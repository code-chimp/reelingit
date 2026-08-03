import { ROUTES } from '../../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /account screen.
 */
export default class AccountPagePom {
  /** @type {Page} */
  #page;
  /** @type {Locator} */
  root;

  /** @type {Locator} */
  logoutButton;
  /** @type {Locator} */
  favoritesButton;
  /** @type {Locator} */
  watchlistButton;

  /**
   * @param {Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('account-page');

    this.logoutButton = this.root.getByRole('button', { name: 'Log Out' });
    this.favoritesButton = this.root.getByRole('button', { name: 'Your Favorites' });
    this.watchlistButton = this.root.getByRole('button', { name: 'Your Watchlist' });
  }

  /**
   * Navigates to the account page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT);
  }
}
