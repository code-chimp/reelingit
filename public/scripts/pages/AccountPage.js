import { TemplateElement } from '../base/TemplateElement.js';

export class AccountPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account-page.html';
}

customElements.define('account-page', AccountPage);
