import { TemplateElement } from '../../base/TemplateElement.js';
import { ROUTES } from '../../constants.js';

export class AccountPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account/account-page.html';

  async render() {
    this.querySelector('#logout-button').addEventListener('click', () => {
      app.Store.jwt = null;
      app.Router.go(ROUTES.HOME);
    });
  }
}

customElements.define('account-page', AccountPage);
