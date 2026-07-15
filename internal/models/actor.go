package models

// Actor is a cast member who can appear in a Movie's Casting.
type Actor struct {
	ID        int     `json:"id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	ImageURL  *string `json:"image_url,omitempty"`
}
