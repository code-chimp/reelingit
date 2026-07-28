import { ROUTES } from '../../constants.js';

/**
 * Page object model for the /account/login screen.
 */
export default class LoginPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;
  /** @type {import('@playwright/test').Locator} */
  emailInput;
  /** @type {import('@playwright/test').Locator} */
  passwordInput;
  /** @type {import('@playwright/test').Locator} */
  loginButton;
  /** @type {import('@playwright/test').Locator} */
  registerLink;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;

    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.registerLink = page.getByRole('link', { name: 'register' });
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
