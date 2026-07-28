import { ROUTES } from '../../constants.js';

/**
 * Page object model for the /account screen.
 */
export default class AccountPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;
  /** @type {import('@playwright/test').Locator} */
  logoutButton;
  /** @type {import('@playwright/test').Locator} */
  favoritesButton;
  /** @type {import('@playwright/test').Locator} */
  watchlistButton;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;

    this.logoutButton = page.getByRole('button', { name: 'Log Out' });
    this.favoritesButton = page.getByRole('button', { name: 'Your Favorites' });
    this.watchlistButton = page.getByRole('button', { name: 'Your Watchlist' });
  }

  /**
   * Navigates to the account page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT);
  }
}
