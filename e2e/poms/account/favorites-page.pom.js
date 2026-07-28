import { ROUTES } from '../../constants.js';

/**
 * Page object model for the /account/favorites screen.
 */
export default class FavoritesPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
  }

  /**
   * Navigates to the favorites page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_FAVORITES);
  }
}
