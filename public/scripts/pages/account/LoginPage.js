import { TemplateElement } from '../../base/TemplateElement.js';
import { MIN_EMAIL_LENGTH, MIN_PASSWORD_LENGTH, ROUTES } from '../../constants.js';
import { API } from '../../services/API.js';
import { showErrorModal } from '../../services/ErrorModal.js';
import Store from '../../services/Store.js';

/**
 * Account login screen.
 *
 * Renders the login form from its template and wires up its submit handler
 * on connect.
 *
 * @summary Login screen
 * @tag login-page
 * @tagname login-page
 */
export class LoginPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account/login-page.html';

  /**
   * Wires the login form after the template is loaded.
   *
   * @returns {Promise<void>}
   */
  async render() {
    this.querySelector('form').addEventListener('submit', e => this.#handleSubmit(e));
  }

  /**
   * Handles the login form's submit event: validates the entered
   * email/password client-side, then calls `API.authenticate`. On success,
   * stores the returned JWT in `Store` and navigates to `/account`; on
   * failure (client validation or invalid credentials), shows the error
   * modal without navigating away from the form.
   *
   * @param {SubmitEvent} e - Submit event from the login `<form>`, expected
   *   to have `email` and `password` fields.
   * @returns {Promise<void>}
   */
  async #handleSubmit(e) {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(e.target));
    const errors = [];

    if (email.length < MIN_EMAIL_LENGTH) {
      errors.push('Please enter your email');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.push('Password must be at least 8 characters long');
    }

    if (errors.length > 0) {
      showErrorModal(errors.join('\n'), false);
      return;
    }

    try {
      const response = await API.authenticate(email, password);
      Store.jwt = response.jwt;
      this.navigate(ROUTES.ACCOUNT);
    } catch (e) {
      showErrorModal(e.message, false);
    }
  }
}

customElements.define('login-page', LoginPage);
