// Package data implements persistence for ReelingIt's domain models,
// exposing storage interfaces that handlers depend on and concrete
// implementations backed by PostgreSQL.
package data

import "code-chimp.com/reelingit/internal/models"

// MovieStorage is the persistence contract required to serve movie data.
// Implementations must return an error satisfying errors.Is(err,
// ErrMovieNotFound) when a lookup finds no matching movie.
type MovieStorage interface {
	// GetTopMovies returns the current highest-popularity movies.
	GetTopMovies() ([]models.Movie, error)

	// GetRandomMovies returns a random selection of movies.
	GetRandomMovies() ([]models.Movie, error)

	// GetMovieByID returns the movie with the given id, including its
	// genres, cast, and keywords.
	GetMovieByID(id int) (models.Movie, error)

	// SearchMoviesByName returns movies whose title or overview matches
	// name. order selects the sort ("score", "name", "date"; anything
	// else falls back to popularity), and genre, when non-nil, restricts
	// results to that genre ID.
	SearchMoviesByName(name string, order string, genre *int) ([]models.Movie, error)

	// GetAllGenres returns every genre, ordered by ID.
	GetAllGenres() ([]models.Genre, error)
}
