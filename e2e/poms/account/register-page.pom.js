import { ROUTES } from '../../constants.js';

/**
 * Page object model for the /account/register screen.
 */
export default class RegisterPagePom {
  /** @type {import('@playwright/test').Page} */
  #page;
  /** @type {import('@playwright/test').Locator} */
  nameInput;
  /** @type {import('@playwright/test').Locator} */
  emailInput;
  /** @type {import('@playwright/test').Locator} */
  passwordInput;
  /** @type {import('@playwright/test').Locator} */
  confirmPasswordInput;
  /** @type {import('@playwright/test').Locator} */
  registerButton;
  /** @type {import('@playwright/test').Locator} */
  loginLink;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.#page = page;

    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.loginLink = page.getByRole('link', { name: 'login' });
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
