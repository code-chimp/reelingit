import { ROUTES } from '../constants.js';

/**
 * Page object model for the / (home) screen.
 */
export default class HomePagePom {
  /** @type {import('@playwright/test').Page} */
  #page;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
  }

  /**
   * Navigates to the home page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.HOME);
  }
}
