import { ROUTES } from '../constants.js';

/**
 * Page object model for the /movies/{id} screen.
 */
export default class MovieDetailsPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
  }

  /**
   * Navigates to the movie details page.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async goto(id) {
    await this.#page.goto(`${ROUTES.MOVIES}/${id}`);
  }
}
