import { ROUTES } from '../../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /account/login screen.
 */
export default class LoginPagePom {
  /** @type {Page} */
  #page;
  /** @type {Locator} */
  root;

  /** @type {Locator} */
  emailInput;
  /** @type {Locator} */
  passwordInput;
  /** @type {Locator} */
  loginButton;
  /** @type {Locator} */
  registerLink;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('login-page');

    this.emailInput = this.root.getByLabel('Email');
    this.passwordInput = this.root.getByLabel('Password');
    this.loginButton = this.root.getByRole('button', { name: 'Log In' });
    this.registerLink = this.root.getByRole('link', { name: 'register' });
  }

  /**
   * Navigates to the login page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_LOGIN);
  }

  /**
   * Fills in the login form and submits it.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
