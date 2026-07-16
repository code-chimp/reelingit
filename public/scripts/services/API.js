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
      );

      return await response.json();
    } catch (e) {
      console.error(e);
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
};
