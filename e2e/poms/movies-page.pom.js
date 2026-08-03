import { ROUTES } from '../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /movies screen.
 */
export default class MoviesPagePom {
  /** @type {Page} */
  #page;

  /** @type {Locator} */
  root;

  /**
   * @param {Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('movie-page');
  }

  /**
   * Navigates to the movies page, optionally pre-filtered/sorted via query params.
   * @param {string} [q=''] - Search term to filter movies by title; omit for no filter.
   * @param {string} [genre=''] - Genre id to filter by (see the `select#filter` options); omit for all genres.
   * @param {string} [order=''] - Sort order: 'popularity' | 'score' | 'date' | 'name'; omit for the default order.
   * @returns {Promise<void>}
   */
  async goto(q = '', genre = '', order = '') {
    await this.#page.goto(`${ROUTES.MOVIES}?q=${q}&genre=${genre}&order=${order}`);
  }
}
