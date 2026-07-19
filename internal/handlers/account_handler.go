package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"code-chimp.com/reelingit/internal/data"
	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/models"
	"code-chimp.com/reelingit/internal/token"
	"github.com/golang-jwt/jwt/v5"
)

// RegisterRequest is the JSON body expected by AccountHandler.Register.
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthRequest is the JSON body expected by AccountHandler.Authenticate.
type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse is the JSON response written by AccountHandler.Register and
// AccountHandler.Authenticate on success.
type AuthResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	JWT     string `json:"jwt"`
}

// contextKey is a private type for AccountHandler's context keys, so they
// can't collide with keys set by other packages using the same string.
type contextKey string

// emailContextKey is the context key AuthMiddleware uses to pass the
// authenticated user's email to downstream handlers.
const emailContextKey contextKey = "email"

// AccountHandler serves the /api/account endpoints.
type AccountHandler struct {
	storage data.AccountStorage
	logger  *logger.Logger
}

// NewAccountHandler creates an AccountHandler backed by storage, logging
// failures to log.
func NewAccountHandler(storage data.AccountStorage, log *logger.Logger) *AccountHandler {
	return &AccountHandler{
		storage: storage,
		logger:  log,
	}
}

// AuthMiddleware wraps next, requiring a valid HMAC-signed JWT in the
// Authorization header ("Bearer <token>" or the bare token). On success, it
// injects the token's email claim into the request context (retrievable via
// emailContextKey) and calls next. On failure, it writes a 401 and does not
// call next.
func (h *AccountHandler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			http.Error(w, "Missing authorization token", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix if present
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

		// Parse and validate the token

		tokenIn, err := jwt.Parse(tokenStr,
			func(t *jwt.Token) (interface{}, error) {
				// Ensure the signing method is HMAC
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(token.GetJWTSecret(*h.logger)), nil
			},
		)
		if err != nil || !tokenIn.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract claims from the token
		claims, ok := tokenIn.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		// Get the email from claims
		email, ok := claims["email"].(string)
		if !ok {
			http.Error(w, "Email not found in token", http.StatusUnauthorized)
			return
		}

		// Inject email into the request context
		ctx := context.WithValue(r.Context(), emailContextKey, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Register handles account registration requests, decoding a
// RegisterRequest from the body and delegating to
// data.AccountStorage.Register. Responds with an AuthResponse on success;
// a malformed body yields a 400, and storage validation/duplicate-email
// failures are surfaced by handleStorageError.
func (h *AccountHandler) Register(w http.ResponseWriter, r *http.Request) {

	// Parse request body
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode registration request", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Register the user
	success, err := h.storage.Register(req.Name, req.Email, req.Password)
	if h.handleStorageError(w, err, "Failed to register user") {
		return
	}

	// Return success response
	response := AuthResponse{
		Success: success,
		Message: "User registered successfully",
		JWT:     token.CreateJWT(models.User{Email: req.Email, Name: req.Name}, *h.logger),
	}

	if err := h.writeJSONResponse(w, response); err == nil {
		h.logger.Info("Successfully registered user with email: " + req.Email)
	}
}

// Authenticate handles login requests, decoding an AuthRequest from the
// body and delegating to data.AccountStorage.Authenticate. Responds with an
// AuthResponse on success; a malformed body yields a 400, and invalid
// credentials are surfaced by handleStorageError as a 401.
func (h *AccountHandler) Authenticate(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode authentication request", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Authenticate the user
	success, err := h.storage.Authenticate(req.Email, req.Password)
	if h.handleStorageError(w, err, "Failed to authenticate user") {
		return
	}

	// Return success response
	response := AuthResponse{
		Success: success,
		Message: "User registered successfully",
		JWT:     token.CreateJWT(models.User{Email: req.Email}, *h.logger),
	}

	if err := h.writeJSONResponse(w, response); err == nil {
		h.logger.Info("Successfully authenticated user with email: " + req.Email)
	}
}

// SaveToCollection handles requests to add a movie to the authenticated
// user's named collection (e.g. "favorites" or "watchlist"), decoding a
// movie ID and collection name from the body and delegating to
// data.AccountStorage.SaveCollection. Requires AuthMiddleware to have run,
// since it reads the user's email from the request context. Responds with
// an AuthResponse on success; a malformed body yields a 400, and storage
// failures are surfaced by handleStorageError.
func (h *AccountHandler) SaveToCollection(w http.ResponseWriter, r *http.Request) {
	type CollectionRequest struct {
		MovieID    int    `json:"movie_id"`
		Collection string `json:"collection"`
	}

	var req CollectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode collection request", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	email, ok := r.Context().Value(emailContextKey).(string)
	if !ok {
		http.Error(w, "Unable to retrieve email", http.StatusInternalServerError)
		return
	}

	success, err := h.storage.SaveCollection(models.User{Email: email},
		req.MovieID, req.Collection)
	if h.handleStorageError(w, err, "Failed to save to collection") {
		return
	}

	response := AuthResponse{
		Success: success,
		Message: "Movie added to " + req.Collection + " successfully",
	}

	if err := h.writeJSONResponse(w, response); err == nil {
		h.logger.Info("Successfully saved movie to " + req.Collection)
	}
}

// GetFavorites responds with the authenticated user's favorited movies.
// Requires AuthMiddleware to have run, since it reads the user's email from
// the request context.
func (h *AccountHandler) GetFavorites(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(emailContextKey).(string)
	if !ok {
		http.Error(w, "Unable to retrieve email", http.StatusInternalServerError)
		return
	}
	details, err := h.storage.GetAccountDetails(email)
	if err != nil {
		http.Error(w, "Unable to retrieve collections", http.StatusInternalServerError)
		return
	}
	if err := h.writeJSONResponse(w, details.Favorites); err == nil {
		h.logger.Info("Successfully sent favorites")
	}
}

// GetWatchlist responds with the authenticated user's watchlisted movies.
// Requires AuthMiddleware to have run, since it reads the user's email from
// the request context.
func (h *AccountHandler) GetWatchlist(w http.ResponseWriter, r *http.Request) {
	email, ok := r.Context().Value(emailContextKey).(string)
	if !ok {
		http.Error(w, "Unable to retrieve email", http.StatusInternalServerError)
		return
	}
	details, err := h.storage.GetAccountDetails(email)
	if err != nil {
		http.Error(w, "Unable to retrieve collections", http.StatusInternalServerError)
		return
	}
	if err := h.writeJSONResponse(w, details.Watchlist); err == nil {
		h.logger.Info("Successfully sent favorites")
	}
}

// writeJSONResponse encodes data as JSON to w. If encoding fails, it logs
// the failure and writes a 500 response.
func (h *AccountHandler) writeJSONResponse(w http.ResponseWriter, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.logger.Error("Failed to encode response", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return err
	}
	return nil
}

// handleStorageError inspects err from a storage call and, if non-nil,
// writes the appropriate HTTP error response: a 401 JSON AuthResponse for
// data.ErrAuthenticationValidation, data.ErrUserAlreadyExists, or
// data.ErrRegistrationValidation; a 404 for data.ErrUserNotFound; a 500
// (also logging that case, using context as the log message) otherwise. It
// reports whether a response was written, so callers should return
// immediately when it reports true.
func (h *AccountHandler) handleStorageError(w http.ResponseWriter, err error, context string) bool {
	if err != nil {
		switch err {
		case data.ErrAuthenticationValidation, data.ErrUserAlreadyExists, data.ErrRegistrationValidation:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(AuthResponse{Success: false, Message: err.Error()})
			return true
		case data.ErrUserNotFound:
			http.Error(w, "User not found", http.StatusNotFound)
			return true
		default:
			h.logger.Error(context, err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return true
		}
	}
	return false
}
