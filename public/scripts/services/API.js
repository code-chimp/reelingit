import Store from './Store.js';
import { CUSTOM_EVENTS, HTTP_CODE, ROUTES } from '../constants.js';

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
   * Shared response handler for `fetch` and `post`.
   *
   * On a 401, clears the stored JWT and fires a navigation event to the login
   * screen before throwing, so the caller's catch block still receives the
   * error. On any other non-ok status, extracts the server's `error` field
   * from the JSON body (falling back to a generic message) and throws. On
   * success, returns the parsed JSON body.
   *
   * @param {Response} response - The raw `fetch` response to inspect.
   * @returns {Promise<any>} Parsed JSON body of a successful response.
   * @throws {Error} For any non-2xx response, with the server's error message
   *   if available.
   */
  _handleResponse: async response => {
    if (response.status === HTTP_CODE.UNAUTHORIZED) {
      Store.jwt = null;
      document.dispatchEvent(
        new CustomEvent(CUSTOM_EVENTS.NAVIGATE, {
          detail: {
            route: ROUTES.ACCOUNT_LOGIN,
          },
        }),
      );
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? 'Request failed');
    }

    return await response.json();
  },

  /**
   * Fetches JSON from a path under `baseURL`, optionally appending `args` as
   * a query string. Non-ok responses and 401s are handled by `_handleResponse`.
   *
   * @param {string} service - Path under `baseURL`, e.g. `movies/top`
   * @param {Record<string, string>} [args] - Query params to append
   * @returns {Promise<any>} Parsed JSON response.
   * @throws {Error} On network failure, non-ok response, or JSON parse error.
   */
  fetch: async (service, args) => {
    const queryString = args ? new URLSearchParams(args).toString() : '';
    try {
      const response = await fetch(
        `${API.baseURL}${service}${queryString ? `?${queryString}` : ''}`,
        {
          headers: Store.jwt
            ? {
                Authorization: `Bearer ${Store.jwt}`,
              }
            : {},
        },
      );

      return await API._handleResponse(response);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  /**
   * POSTs `args` as a JSON body to a path under `baseURL`. Non-ok responses
   * and 401s are handled by `_handleResponse`.
   *
   * @param {string} service - Path under `baseURL`, e.g. `account/register`
   * @param {Record<string, unknown>} args - Request body, serialized as JSON
   * @returns {Promise<any>} Parsed JSON response.
   * @throws {Error} On network failure, non-ok response, or JSON parse error.
   */
  post: async (service, args) => {
    try {
      const response = await fetch(API.baseURL + service, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(Store.jwt ? { Authorization: `Bearer ${Store.jwt}` } : {}),
        },
        body: JSON.stringify(args),
      });

      return await API._handleResponse(response);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  /**
   * @returns {Promise<Array<object>>} This week's top movies.
   */
  getTopMovies: async () => {
    return await API.fetch('movies/top');
  },

  /**
   * @returns {Promise<Array<object>>} A random selection of movies.
   */
  getRandomMovies: async () => {
    return await API.fetch('movies/random');
  },

  /**
   * @param {number|string} id - Movie ID
   * @returns {Promise<object>} The movie matching `id`.
   */
  getMovieById: async id => {
    return await API.fetch(`movies/${id}`);
  },

  /**
   * @param {string} q - Search text
   * @param {string} [order] - Sort order
   * @param {string} [genre] - Genre filter
   * @returns {Promise<Array<object>>} Movies matching the search criteria.
   */
  searchMovies: async (q, order, genre) => {
    return await API.fetch(`movies/search`, { q, order, genre });
  },

  /**
   * @returns {Promise<Array<object>>} All genres.
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
   * @returns {Promise<{success: boolean, message: string, jwt: string}>}
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
   * @returns {Promise<{success: boolean, message: string, jwt: string}>}
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
   * in `Store.jwt`), since the backend derives the user from it.
   *
   * @returns {Promise<Array<object>>} The user's favorited movies.
   */
  getFavorites: async () => {
    return await API.fetch('account/favorites');
  },

  /**
   * Fetches the current user's watchlisted movies via
   * `GET /api/account/watchlist`. Requires an authenticated session (a JWT
   * in `Store.jwt`), since the backend derives the user from it.
   *
   * @returns {Promise<Array<object>>} The user's watchlisted movies.
   */
  getWatchlist: async () => {
    return await API.fetch('account/watchlist');
  },

  /**
   * Saves a movie to a named collection for the current user via
   * `POST /api/account/save-to-collection`. Requires an authenticated
   * session (a JWT in `Store.jwt`).
   *
   * @param {number|string} movie_id - ID of the movie to save
   * @param {string} collection - Target collection, one of `COLLECTIONS`'s values
   * @returns {Promise<{success: boolean, message: string}>} Save result.
   */
  saveToCollection: async (movie_id, collection) => {
    return await API.post('account/save-to-collection', { movie_id, collection });
  },
};
