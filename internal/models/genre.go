package models

// Genre is a movie category (e.g. "Action", "Comedy").
type Genre struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
