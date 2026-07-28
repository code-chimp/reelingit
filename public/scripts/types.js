/**
 * @typedef {object} Actor
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [image_url]
 */

/**
 * @typedef {object} AuthResult
 * @property {boolean} success
 * @property {string} message
 * @property {string} jwt
 */

/**
 * @typedef {object} ErrorEnvelope
 * @property {string} error
 */

/**
 * @typedef {object} Genre
 * @property {number} id
 * @property {string} name
 */

/**
 * Movie JSON from the backend (`internal/models/movie.go`).
 * List endpoints may leave relation arrays null; detail fills them in.
 *
 * @typedef {object} Movie
 * @property {number} id
 * @property {number} [tmdb_id]
 * @property {string} title
 * @property {string} [tagline]
 * @property {number} release_year
 * @property {Genre[] | null} genres
 * @property {string} [overview]
 * @property {number} [score]
 * @property {number} [popularity]
 * @property {string[] | null} keywords
 * @property {string} [language]
 * @property {string} [poster_url]
 * @property {string} [trailer_url]
 * @property {Actor[] | null} casting
 */

/** @typedef {Movie[]} MovieList */

export {};
