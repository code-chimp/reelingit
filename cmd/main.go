// Command reelingit runs the ReelingIt HTTP server: a JSON API under
// /api/ backed by PostgreSQL, plus a static file server (with SPA
// fallback) for the public/ frontend.
package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"code-chimp.com/reelingit/internal/data"
	"code-chimp.com/reelingit/internal/handlers"
	"code-chimp.com/reelingit/internal/logger"
	"code-chimp.com/reelingit/internal/middleware"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

// initializeLogger creates the app's Logger, exiting the process if the
// log file can't be opened.
func initializeLogger() *logger.Logger {
	logInstance, err := logger.NewLogger("movie-service.log")
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	return logInstance
}

// spaHandler serves static files out of root when the request path matches a
// real file, and falls back to root/index.html otherwise so the client-side
// router can handle deep links (e.g. /movies/90) on a hard navigation.
func spaHandler(root string) http.HandlerFunc {
	fs := http.FileServer(http.Dir(root))

	return func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(root, filepath.Clean(r.URL.Path))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, filepath.Join(root, "index.html"))
	}
}

// envOrDefault returns the value of key, or defaultValue when key is unset
// or set to an empty string.
func envOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// main wires together the logger, database connection, repositories, and
// HTTP handlers, then starts the server on PORT (default ":8080").
func main() {
	logInstance := initializeLogger()
	defer logInstance.Close()

	// app configuration
	if err := godotenv.Load(); err != nil {
		logInstance.Info(".env file not found, relying on environment variables")
	}

	addr := envOrDefault("PORT", ":8080")
	connStr, ok := os.LookupEnv("DATABASE_URL")
	if !ok || connStr == "" {
		log.Fatal("DATABASE_URL is required")
	}

	// start app
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		logInstance.Error("Failed to connect to database", err)
		log.Fatalf("Could not connect to database: %v", err)
	}
	if err := db.Ping(); err != nil {
		db.Close()
		logInstance.Error("Failed to ping database", err)
		log.Fatalf("Could not reach database: %v", err)
	}
	defer db.Close()

	// initialize repositories
	movieRepo := data.NewMovieRepository(db, logInstance)
	accountRepo := data.NewAccountRepository(db, logInstance)

	// initialize handlers
	moviesHandler := handlers.NewMovieHandler(movieRepo, logInstance)
	accountHandler := handlers.NewAccountHandler(accountRepo, logInstance)

	// routing
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/movies/random", moviesHandler.GetRandomMovies)
	mux.HandleFunc("GET /api/movies/search", moviesHandler.SearchMovies)
	mux.HandleFunc("GET /api/movies/top", moviesHandler.GetTopMovies)
	mux.HandleFunc("GET /api/movies/{id}", moviesHandler.GetMovie)
	mux.HandleFunc("GET /api/genres", moviesHandler.GetGenres)
	mux.HandleFunc("POST /api/account/register", accountHandler.Register)
	mux.HandleFunc("POST /api/account/authenticate", accountHandler.Authenticate)
	mux.Handle("GET /api/account/favorites",
		accountHandler.AuthMiddleware(http.HandlerFunc(accountHandler.GetFavorites)))
	mux.Handle("GET /api/account/watchlist",
		accountHandler.AuthMiddleware(http.HandlerFunc(accountHandler.GetWatchlist)))
	mux.Handle("POST /api/account/save-to-collection",
		accountHandler.AuthMiddleware(http.HandlerFunc(accountHandler.SaveToCollection)))
	mux.Handle("/", spaHandler("public"))

	// Add CSP policy and CSRF protection.
	handler := http.NewCrossOriginProtection().Handler(middleware.ContentSecurityPolicy(mux))

	// Start server
	logInstance.Info("Server starting on " + addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		logInstance.Error("Server failed to start", err)
		log.Fatalf("Server failed: %v", err)
	}
}
