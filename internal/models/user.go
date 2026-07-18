package models

// User is an account record, as persisted by AccountStorage and returned by
// GetAccountDetails with its Favorites/Watchlist populated. Password holds
// the bcrypt hash, not the plaintext password, and is only set internally
// (by Authenticate, to verify credentials) — it is not populated by
// GetAccountDetails, but is JSON-tagged like every other field, so any
// handler that serializes a User populated by Authenticate would leak the
// hash to the client.
type User struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Password  string  `json:"password"`
	Favorites []Movie `json:"favorites"`
	Watchlist []Movie `json:"watchlist"`
}
