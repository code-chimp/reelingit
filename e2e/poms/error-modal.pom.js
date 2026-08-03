/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the app's shared `#alert-modal` error dialog.
 *
 * Unlike the other POMs, this isn't scoped under a per-screen custom
 * element — `#alert-modal` lives once at the document root (`index.html`)
 * and is shown/populated by `services/ErrorModal.js`'s `showErrorModal()`
 * from any screen, so it stays mounted across client-side navigation.
 */
export default class ErrorModalPom {
  /** Root `<dialog id="alert-modal">` element. @type {Locator} */
  root;
  /** @type {Locator} */
  heading;
  /** Error text set by `showErrorModal(message)`. @type {Locator} */
  message;
  /** Dismisses the modal without navigating. @type {Locator} */
  closeButton;

  /**
   * @param {Page} page
   */
  constructor(page) {
    this.root = page.locator('#alert-modal');

    this.heading = this.root.locator('h3');
    this.message = this.root.locator('p');
    this.closeButton = this.root.getByRole('button', { name: 'Ok' });
  }
}
