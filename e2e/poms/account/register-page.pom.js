import { ROUTES } from '../../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the /account/register screen.
 */
export default class RegisterPagePom {
  /** @type {Page} */
  #page;
  /** @type {Locator} */

  root;
  /** @type {Locator} */
  nameInput;
  /** @type {Locator} */
  emailInput;
  /** @type {Locator} */
  passwordInput;
  /** @type {Locator} */
  confirmPasswordInput;
  /** @type {Locator} */
  registerButton;
  /** @type {Locator} */
  loginLink;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('register-page');

    this.nameInput = this.root.getByLabel('Name');
    this.emailInput = this.root.getByLabel('Email');
    this.passwordInput = this.root.getByLabel('Password');
    this.confirmPasswordInput = this.root.getByLabel('Confirm Password');
    this.registerButton = this.root.getByRole('button', { name: 'Register' });
    this.loginLink = this.root.getByRole('link', { name: 'login' });
  }

  /**
   * Navigates to the registration page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.ACCOUNT_REGISTER);
  }

  /**
   * Fills in the registration form and submits it.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {Promise<void>}
   */
  async register(name, email, password, confirmPassword) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.registerButton.click();
  }
}
