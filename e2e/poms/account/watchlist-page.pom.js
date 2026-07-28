import { ROUTES } from '../../constants.js';

/**
 * Page object model for the /account/watchlist screen.
 */
export default class WatchlistPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
  }

  /**
   * Navigates to the watchlist page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_WATCHLIST);
  }
}
