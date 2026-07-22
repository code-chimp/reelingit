import { TemplateElement } from '../../base/TemplateElement.js';
import { ROUTES } from '../../constants.js';
import { API } from '../../services/API.js';
import { showErrorModal } from '../../services/ErrorModal.js';
import Store from '../../services/Store.js';

/**
 * Account registration screen.
 *
 * Renders the registration form from its template and wires up its submit
 * handler on connect.
 *
 * @summary Registration screen
 * @tag register-page
 * @tagname register-page
 */
export class RegisterPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account/register-page.html';

  /**
   * Wires the registration form after the template is loaded.
   *
   * @returns {Promise<void>}
   */
  async render() {
    this.querySelector('form').addEventListener('submit', e => this.#handleSubmit(e));
  }

  /**
   * Handles the registration form's submit event: validates the entered
   * name/email/password client-side, then calls `API.register`. On success,
   * stores the returned JWT in `Store` and navigates to `/account`; on
   * failure (client validation or a server-rejected response), shows the
   * error modal without navigating away from the form.
   *
   * @param {SubmitEvent} e - Submit event from the registration `<form>`,
   *   expected to have `name`, `email`, `password`, and `passwordConfirm` fields.
   * @returns {Promise<void>}
   */
  async #handleSubmit(e) {
    e.preventDefault();
    const { name, email, password, passwordConfirm } = Object.fromEntries(
      new FormData(e.target),
    );
    const errors = [];

    if (name.length < 4) errors.push('Name must be at least 4 characters long');
    if (email.length < 4) errors.push('Please enter your email');
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (password !== passwordConfirm) errors.push('Passwords do not match');

    if (errors.length > 0) {
      showErrorModal(errors.join('\n'), false);
      return;
    }

    try {
      const response = await API.register(name, email, password);
      Store.jwt = response.jwt;
      this.navigate(ROUTES.ACCOUNT);
    } catch (e) {
      showErrorModal(e.message, false);
    }
  }
}

customElements.define('register-page', RegisterPage);
