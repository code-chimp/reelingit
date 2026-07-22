// Package handlers implements HTTP handlers for ReelingIt's JSON API,
// translating requests into data.MovieStorage calls and encoding the
// results (or errors) as JSON responses.
package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"code-chimp.com/reelingit/internal/data"
	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/models"
)

// MovieHandler serves the /api/movies and /api/genres endpoints.
type MovieHandler struct {
	repository data.MovieStorage
	logger     *logger.Logger
}

// NewMovieHandler creates a MovieHandler backed by repository, logging
// failures to logger.
func NewMovieHandler(repository data.MovieStorage, logger *logger.Logger) *MovieHandler {
	return &MovieHandler{
		repository: repository,
		logger:     logger,
	}
}

// GetTopMovies handles GET /api/movies/top, responding with the current
// highest-popularity movies.
func (h *MovieHandler) GetTopMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := h.repository.GetTopMovies()

	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served top movies")
	}
}

// GetRandomMovies handles GET /api/movies/random, responding with a
// random selection of movies.
func (h *MovieHandler) GetRandomMovies(w http.ResponseWriter, r *http.Request) {
	movies, err := h.repository.GetRandomMovies()

	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served random movies")
	}
}

// SearchMovies handles GET /api/movies/search, responding with movies
// matching the "q" query parameter, optionally sorted via "order" and
// filtered via "genre". An empty "q" yields an empty result set.
func (h *MovieHandler) SearchMovies(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	order := r.URL.Query().Get("order")
	genreStr := r.URL.Query().Get("genre")

	var genre *int
	if genreStr != "" {
		genreInt, ok := h.parseID(w, genreStr)
		if !ok {
			return
		}
		genre = &genreInt
	}

	var movies []models.Movie
	var err error
	if query != "" {
		movies, err = h.repository.SearchMoviesByName(query, order, genre)
	}
	if h.handleStorageError(w, err, "Failed to get movies") {
		return
	}
	if writeJSONResponse(w, movies) == nil {
		h.logger.Info("Successfully served movies")
	}
}

// GetMovie handles GET /api/movies/{id}, responding with the matching
// movie or 404 if none exists.
func (h *MovieHandler) GetMovie(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, ok := h.parseID(w, idStr)
	if !ok {
		return
	}

	movie, err := h.repository.GetMovieByID(id)
	if h.handleStorageError(w, err, "movie not found") {
		return
	}
	if writeJSONResponse(w, movie) == nil {
		h.logger.Info("Successfully served movie with ID: " + idStr)
	}
}

// GetGenres handles GET /api/genres, responding with every genre.
func (h *MovieHandler) GetGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := h.repository.GetAllGenres()
	if h.handleStorageError(w, err, "Failed to get genres") {
		return
	}
	if writeJSONResponse(w, genres) == nil {
		h.logger.Info("Successfully served genres")
	}
}

// handleStorageError inspects err from a repository call and, if non-nil,
// writes the appropriate JSON error response — 404 with context as the
// message for data.ErrMovieNotFound, 500 with a generic message otherwise
// (also logging context in that case). It reports whether a response was
// written, so callers should return immediately when it reports true.
func (h *MovieHandler) handleStorageError(w http.ResponseWriter, err error, context string) bool {
	if err != nil {
		if errors.Is(err, data.ErrMovieNotFound) {
			writeJSONError(w, context, http.StatusNotFound)
			return true
		}
		h.logger.Error(context, err)
		writeJSONError(w, "Internal server error", http.StatusInternalServerError)
		return true
	}
	return false
}

// parseID parses idStr as an int. If it isn't one, it writes a 400
// response and returns ok=false.
func (h *MovieHandler) parseID(w http.ResponseWriter, idStr string) (int, bool) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		h.logger.Error("Invalid ID format", err)
		writeJSONError(w, "Invalid ID", http.StatusBadRequest)
		return 0, false
	}
	return id, true
}
