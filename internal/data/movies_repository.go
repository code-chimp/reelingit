package data

import (
	"database/sql"
	"errors"
	"strconv"

	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/models"

	_ "github.com/lib/pq"
)

// MovieRepository is a MovieStorage implementation backed by PostgreSQL.
type MovieRepository struct {
	db     *sql.DB
	logger *logger.Logger
}

// NewMovieRepository creates a MovieRepository that queries db, logging
// query failures to log.
func NewMovieRepository(db *sql.DB, log *logger.Logger) *MovieRepository {
	return &MovieRepository{
		db:     db,
		logger: log,
	}
}

// defaultLimit caps the number of rows returned by movie list queries.
const defaultLimit = 20

// GetTopMovies returns the defaultLimit movies with the highest popularity.
func (r *MovieRepository) GetTopMovies() ([]models.Movie, error) {
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score,
		       popularity, language, poster_url, trailer_url
		FROM movies
		ORDER BY popularity DESC
		LIMIT $1
	`
	return r.getMovies(query)
}

// GetRandomMovies returns a random selection of up to defaultLimit movies.
func (r *MovieRepository) GetRandomMovies() ([]models.Movie, error) {
	randomQuery := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score,
		       popularity, language, poster_url, trailer_url
		FROM movies
		ORDER BY random()
		LIMIT $1
	`
	return r.getMovies(randomQuery)
}

// getMovies runs query (expected to select the standard movie columns and
// accept defaultLimit as its sole parameter) and scans the results into
// a slice of models.Movie.
func (r *MovieRepository) getMovies(query string) ([]models.Movie, error) {
	rows, err := r.db.Query(query, defaultLimit)
	if err != nil {
		r.logger.Error("Failed to query movies", err)
		return nil, err
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var m models.Movie
		if err := rows.Scan(
			&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
			&m.Overview, &m.Score, &m.Popularity, &m.Language,
			&m.PosterURL, &m.TrailerURL,
		); err != nil {
			r.logger.Error("Failed to scan movie row", err)
			return nil, err
		}
		movies = append(movies, m)
	}

	return movies, nil
}

// GetMovieByID returns the movie with the given id, including its genres,
// cast, and keywords. It returns ErrMovieNotFound if no movie exists with
// that id.
func (r *MovieRepository) GetMovieByID(id int) (models.Movie, error) {
	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score,
		       popularity, language, poster_url, trailer_url
		FROM movies
		WHERE id = $1
	`
	row := r.db.QueryRow(query, id)

	var m models.Movie
	err := row.Scan(
		&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
		&m.Overview, &m.Score, &m.Popularity, &m.Language,
		&m.PosterURL, &m.TrailerURL,
	)
	if errors.Is(err, sql.ErrNoRows) {
		r.logger.Error("Movie not found", ErrMovieNotFound)
		return models.Movie{}, ErrMovieNotFound
	}
	if err != nil {
		r.logger.Error("Failed to query movie by ID", err)
		return models.Movie{}, err
	}

	// Fetch related data
	if err := r.fetchMovieRelations(&m); err != nil {
		return models.Movie{}, err
	}

	return m, nil
}

// SearchMoviesByName returns up to defaultLimit movies whose title or
// overview contains name (case-insensitive). order selects the sort:
// "score" (score desc), "name" (title asc), "date" (release year desc),
// or anything else for the default of popularity desc. When genre is
// non-nil, results are restricted to movies tagged with that genre ID.
func (r *MovieRepository) SearchMoviesByName(name string, order string, genre *int) ([]models.Movie, error) {
	orderBy := "popularity DESC"
	switch order {
	case "score":
		orderBy = "score DESC"
	case "name":
		orderBy = "title"
	case "date":
		orderBy = "release_year DESC"
	}

	genreFilter := ""
	if genre != nil {
		genreFilter = ` AND ((SELECT COUNT(*) FROM movie_genres
								WHERE movie_id=movies.id
								AND genre_id=` + strconv.Itoa(*genre) + `) = 1) `
	}

	query := `
		SELECT id, tmdb_id, title, tagline, release_year, overview, score,
		       popularity, language, poster_url, trailer_url
		FROM movies
		WHERE (title ILIKE $1 OR overview ILIKE $1) ` + genreFilter + `
		ORDER BY ` + orderBy + `
		LIMIT $2
	`
	rows, err := r.db.Query(query, "%"+name+"%", defaultLimit)
	if err != nil {
		r.logger.Error("Failed to search movies by name", err)
		return nil, err
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var m models.Movie
		if err := rows.Scan(
			&m.ID, &m.TMDB_ID, &m.Title, &m.Tagline, &m.ReleaseYear,
			&m.Overview, &m.Score, &m.Popularity, &m.Language,
			&m.PosterURL, &m.TrailerURL,
		); err != nil {
			r.logger.Error("Failed to scan movie row", err)
			return nil, err
		}
		movies = append(movies, m)
	}

	return movies, nil
}

// GetAllGenres returns every genre, ordered by ID.
func (r *MovieRepository) GetAllGenres() ([]models.Genre, error) {
	query := `SELECT id, name FROM genres ORDER BY id`
	rows, err := r.db.Query(query)
	if err != nil {
		r.logger.Error("Failed to query all genres", err)
		return nil, err
	}
	defer rows.Close()

	var genres []models.Genre
	for rows.Next() {
		var g models.Genre
		if err := rows.Scan(&g.ID, &g.Name); err != nil {
			r.logger.Error("Failed to scan genre row", err)
			return nil, err
		}
		genres = append(genres, g)
	}
	return genres, nil
}

// fetchMovieRelations populates m's Genres, Casting, and Keywords fields
// by querying their respective join tables.
func (r *MovieRepository) fetchMovieRelations(m *models.Movie) error {
	// Fetch genres
	genreQuery := `
		SELECT g.id, g.name
		FROM genres g
		JOIN movie_genres mg ON g.id = mg.genre_id
		WHERE mg.movie_id = $1
	`
	genreRows, err := r.db.Query(genreQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query genres for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer genreRows.Close()
	for genreRows.Next() {
		var g models.Genre
		if err := genreRows.Scan(&g.ID, &g.Name); err != nil {
			r.logger.Error("Failed to scan genre row", err)
			return err
		}
		m.Genres = append(m.Genres, g)
	}

	// Fetch actors
	actorQuery := `
		SELECT a.id, a.first_name, a.last_name, a.image_url
		FROM actors a
		JOIN movie_cast mc ON a.id = mc.actor_id
		WHERE mc.movie_id = $1
	`
	actorRows, err := r.db.Query(actorQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query actors for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer actorRows.Close()
	for actorRows.Next() {
		var a models.Actor
		if err := actorRows.Scan(&a.ID, &a.FirstName, &a.LastName, &a.ImageURL); err != nil {
			r.logger.Error("Failed to scan actor row", err)
			return err
		}
		m.Casting = append(m.Casting, a)
	}

	// Fetch keywords
	keywordQuery := `
		SELECT k.word
		FROM keywords k
		JOIN movie_keywords mk ON k.id = mk.keyword_id
		WHERE mk.movie_id = $1
	`
	keywordRows, err := r.db.Query(keywordQuery, m.ID)
	if err != nil {
		r.logger.Error("Failed to query keywords for movie "+strconv.Itoa(m.ID), err)
		return err
	}
	defer keywordRows.Close()
	for keywordRows.Next() {
		var k string
		if err := keywordRows.Scan(&k); err != nil {
			r.logger.Error("Failed to scan keyword row", err)
			return err
		}
		m.Keywords = append(m.Keywords, k)
	}

	return nil
}

// ErrMovieNotFound is returned by MovieRepository methods when a lookup
// finds no matching movie.
var (
	ErrMovieNotFound = errors.New("movie not found")
)
