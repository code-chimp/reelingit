import { TemplateElement } from '../../base/TemplateElement.js';
import { ROUTES } from '../../constants.js';
import Store from '../../services/Store.js';

/**
 * Authenticated account landing page with collection links and logout control.
 *
 * @summary Account landing page
 * @tag account-page
 * @tagname account-page
 */
export class AccountPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account/account-page.html';

  /**
   * Wires the account actions after the template is loaded.
   *
   * @returns {Promise<void>}
   */
  async render() {
    this.querySelector('#logout-button').addEventListener('click', () => {
      Store.jwt = null;
      this.navigate(ROUTES.HOME);
    });

    this.querySelector('#favorites').addEventListener('click', () => {
      this.navigate(ROUTES.ACCOUNT_FAVORITES);
    });

    this.querySelector('#watchlist').addEventListener('click', () => {
      this.navigate(ROUTES.ACCOUNT_WATCHLIST);
    });
  }
}

customElements.define('account-page', AccountPage);
