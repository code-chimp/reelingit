// Package models defines ReelingIt's domain types, shared between the
// data layer (as SQL scan targets) and the handlers layer (as JSON
// response bodies).
package models

// Movie is a single movie record, including its related genres, cast,
// and keywords. Pointer fields are nullable in the database and omitted
// from JSON when nil.
type Movie struct {
	ID          int      `json:"id"`
	TMDB_ID     int      `json:"tmdb_id,omitempty"` // External ID in The Movie Database (TMDB)
	Title       string   `json:"title"`
	Tagline     *string  `json:"tagline,omitempty"`
	ReleaseYear int      `json:"release_year"`
	Genres      []Genre  `json:"genres"`
	Overview    *string  `json:"overview,omitempty"`
	Score       *float32 `json:"score,omitempty"`
	Popularity  *float32 `json:"popularity,omitempty"`
	Keywords    []string `json:"keywords"`
	Language    *string  `json:"language,omitempty"`
	PosterURL   *string  `json:"poster_url,omitempty"`
	TrailerURL  *string  `json:"trailer_url,omitempty"`
	Casting     []Actor  `json:"casting"` // Cast members appearing in the movie
}
