import { ROUTES } from '../../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /account/favorites screen.
 */
export default class FavoritesPagePom {
  /** @type {Page} */
  #page;
  /** @type {Locator} */
  root;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('favorites-page');
  }

  /**
   * Navigates to the favorites page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_FAVORITES);
  }
}
