package handlers

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse is the JSON body written for all API error responses.
// Every non-2xx response from the handlers package uses this envelope so
// clients always know where to find the error message.
type ErrorResponse struct {
	Error string `json:"error"`
}

// writeJSONResponse encodes data as JSON to w with a 200 status and the
// application/json content type. If encoding fails it falls back to
// writeJSONError with a 500 and returns the error; on success it returns nil.
func writeJSONResponse(w http.ResponseWriter, data any) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		writeJSONError(w, "internal server error", http.StatusInternalServerError)
		return err
	}
	return nil
}

// writeJSONError writes a JSON ErrorResponse with the given HTTP status code.
// It must be called before any other write to w so the status code is not lost.
func writeJSONError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: msg})
}
