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

// AccountStorage is the persistence contract required to serve user
// accounts. Implementations must return an error satisfying errors.Is(err,
// ErrUserNotFound) when a lookup finds no matching user.
type AccountStorage interface {
	// Authenticate verifies email and password against the stored
	// credentials. It returns ErrAuthenticationValidation if the
	// credentials are missing, the email is unknown, or the password
	// doesn't match.
	Authenticate(email, password string) (bool, error)

	// Register creates a new user account with name, email, and password.
	// It returns ErrRegistrationValidation if any field is empty, or
	// ErrUserAlreadyExists if a user with email already exists.
	Register(name, email, password string) (bool, error)

	// GetAccountDetails returns the user with the given email, including
	// their favorite and watchlist movies. It returns ErrUserNotFound if
	// no matching user exists.
	GetAccountDetails(email string) (models.User, error)

	// SaveCollection adds the movie with movieID to user's "favorite" or
	// "watchlist" collection (collection must be one of those two
	// values). It is idempotent: adding a movie already in the
	// collection succeeds without creating a duplicate entry. It returns
	// ErrUserNotFound if user doesn't match an existing account.
	SaveCollection(user models.User, movieID int, collection string) (bool, error)
}
