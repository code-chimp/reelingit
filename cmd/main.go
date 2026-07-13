package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"code-chimp.com/reelingit/internal/data"
	"code-chimp.com/reelingit/internal/handlers"
	"code-chimp.com/reelingit/internal/logger"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func initializeLogger() *logger.Logger {
	logInstance, err := logger.NewLogger("movie-service.log")
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	return logInstance
}

func envOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func main() {
	logInstance := initializeLogger()
	defer logInstance.Close()

	// app configuration
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Failed to load environment variables: %v", err)
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

	// initialize handlers
	moviesHandler := handlers.NewMovieHandler(movieRepo, logInstance)
	// authHandler := handlers.NewAuthHandler(userStorage, jwt, logInstance)

	// routing
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/movies/random", moviesHandler.GetRandomMovies)
	mux.HandleFunc("GET /api/movies/top", moviesHandler.GetTopMovies)
	mux.HandleFunc("GET /api/movies/search", moviesHandler.SearchMovies)
	mux.HandleFunc("GET /api/movies/{id}", moviesHandler.GetMovie)
	mux.HandleFunc("GET /api/genres", moviesHandler.GetGenres)
	mux.HandleFunc("/api/account/register", moviesHandler.GetGenres)
	mux.HandleFunc("/api/account/authenticate", moviesHandler.GetGenres)
	mux.Handle("/", http.FileServer(http.Dir("public")))

	// Start server
	logInstance.Info("Server starting on " + addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		logInstance.Error("Server failed to start", err)
		log.Fatalf("Server failed: %v", err)
	}
}
