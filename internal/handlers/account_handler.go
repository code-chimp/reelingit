package handlers

import (
	"encoding/json"
	"net/http"

	"code-chimp.com/reelingit/internal/data"
	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/models"
	"code-chimp.com/reelingit/internal/token"
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
