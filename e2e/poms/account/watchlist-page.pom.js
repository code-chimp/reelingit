import { ROUTES } from '../../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /account/watchlist screen.
 */
export default class WatchlistPagePom {
  /** @type {Page} */
  #page;
  /** @type {Locator} */
  root;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('watchlist-page');
  }

  /**
   * Navigates to the watchlist page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_WATCHLIST);
  }
}
