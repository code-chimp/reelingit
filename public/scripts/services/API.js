import { ROUTES } from '../constants.js';

/**
 * Client for the ReelingIt backend's `/api/` movie endpoints.
 *
 * Use it like this:
 * ```js
 * import { API } from './services/API.js';
 *
 * const movie = await API.getMovieById(14);
 * ```
 *
 * @summary Movie API client
 */
export const API = {
  baseURL: '/api/',

  /**
   * Fetches JSON from a path under `baseURL`, optionally appending `args` as
   * a query string.
   *
   * Errors (network failures, non-JSON responses) are caught and logged
   * rather than thrown, so a failed call resolves to `undefined` instead of
   * rejecting.
   *
   * @param {string} service - Path under `baseURL`, e.g. `movies/top`
   * @param {Record<string, string>} [args] - Query params to append
   * @returns {Promise<any|undefined>} Parsed JSON response, or `undefined` on failure
   */
  fetch: async (service, args) => {
    const queryString = args ? new URLSearchParams(args).toString() : '';
    try {
      const response = await fetch(
        `${API.baseURL}${service}${queryString ? `?${queryString}` : ''}`,
        {
          headers: {
            Authorization: app.Store.jwt ? `Bearer ${app.Store.jwt}` : null,
          },
        },
      );

      return await response.json();
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * POSTs `args` as a JSON body to a path under `baseURL`.
   *
   * Unlike `fetch`, a network/parsing failure here also triggers the app's
   * shared error modal (via `window.app`), since POST calls are typically
   * user-initiated form submissions rather than background loads.
   *
   * @param {string} service - Path under `baseURL`, e.g. `account/register`
   * @param {Record<string, unknown>} args - Request body, serialized as JSON
   * @returns {Promise<any|undefined>} Parsed JSON response, or `undefined` on failure
   */
  post: async (service, args) => {
    try {
      const response = await fetch(API.baseURL + service, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: app.Store.jwt ? `Bearer ${app.Store.jwt}` : null,
        },
        body: JSON.stringify(args),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      app.showErrorModal();
    }
  },

  /**
   * @returns {Promise<Array<object>|undefined>} This week's top movies
   */
  getTopMovies: async () => {
    return await API.fetch('movies/top');
  },

  /**
   * @returns {Promise<Array<object>|undefined>} A random selection of movies
   */
  getRandomMovies: async () => {
    return await API.fetch('movies/random');
  },

  /**
   * @param {number|string} id - Movie ID
   * @returns {Promise<object|undefined>} The movie matching `id`
   */
  getMovieById: async id => {
    return await API.fetch(`movies/${id}`);
  },

  /**
   * @param {string} q - Search text
   * @param {string} [order] - Sort order
   * @param {string} [genre] - Genre filter
   * @returns {Promise<Array<object>|undefined>} Movies matching the search criteria
   */
  searchMovies: async (q, order, genre) => {
    return await API.fetch(`movies/search`, { q, order, genre });
  },

  /**
   * @returns {Promise<Array<object>|undefined>} All genres
   */
  getGenres: async () => {
    return await API.fetch('genres');
  },

  /**
   * Creates a new account via `POST /api/account/register`.
   *
   * @param {string} name - Display name
   * @param {string} email - Account email, used as the login identifier
   * @param {string} password - Plaintext password; hashed server-side
   * @returns {Promise<{success: boolean, message: string, jwt: string}|undefined>}
   *   Auth result. On success `jwt` is a signed token to store for
   *   subsequent authenticated requests; on failure `success` is `false`
   *   and `message` explains why (e.g. duplicate email).
   */
  register: async (name, email, password) => {
    return await API.post('account/register', { name, email, password });
  },

  /**
   * Logs an existing account in via `POST /api/account/authenticate`.
   *
   * @param {string} email - Account email
   * @param {string} password - Plaintext password, checked against the stored hash
   * @returns {Promise<{success: boolean, message: string, jwt: string}|undefined>}
   *   Auth result. On success `jwt` is a signed token to store for
   *   subsequent authenticated requests; on failure `success` is `false`
   *   and `message` explains why (e.g. invalid credentials).
   */
  authenticate: async (email, password) => {
    return await API.post('account/authenticate', { email, password });
  },

  /**
   * Fetches the current user's favorited movies via
   * `GET /api/account/favorites`. Requires an authenticated session (a JWT
   * in `app.Store.jwt`), since the backend derives the user from it.
   *
   * @returns {Promise<Array<object>|undefined>} The user's favorited movies, or
   *   `undefined` on failure (in which case the user is redirected to `ROUTES.ACCOUNT`)
   */
  getFavorites: async () => {
    try {
      return await API.fetch('account/favorites');
    } catch (e) {
      console.error('Error fetching favorites:', e);
      app.Router.go(ROUTES.ACCOUNT);
    }
  },

  /**
   * Fetches the current user's watchlisted movies via
   * `GET /api/account/watchlist`. Requires an authenticated session (a JWT
   * in `app.Store.jwt`), since the backend derives the user from it.
   *
   * @returns {Promise<Array<object>|undefined>} The user's watchlisted movies, or
   *   `undefined` on failure (in which case the user is redirected to `ROUTES.ACCOUNT`)
   */
  getWatchlist: async () => {
    try {
      return await API.fetch('account/watchlist');
    } catch (e) {
      console.error('Error fetching watchlist:', e);
      app.Router.go(ROUTES.ACCOUNT);
    }
  },

  /**
   * Saves a movie to a named collection for the current user via
   * `POST /api/account/save-to-collection`. Requires an authenticated
   * session (a JWT in `app.Store.jwt`).
   *
   * @param {number|string} movie_id - ID of the movie to save
   * @param {string} collection - Target collection, one of `COLLECTIONS`'s values
   * @returns {Promise<{success: boolean, message: string}|undefined>} Save result, or `undefined` on failure
   */
  saveToCollection: async (movie_id, collection) => {
    return await API.post('account/save-to-collection', { movie_id, collection });
  },
};
