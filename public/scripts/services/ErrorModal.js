import { CUSTOM_EVENTS, ROUTES } from '../constants.js';

/**
 * Displays the app's shared error modal with the given message.
 *
 * @param {string} [message] - Text to show in the modal body.
 * @param {boolean} [goToHome] - Whether to request navigation to `/` after showing the modal.
 * @returns {void}
 */
export function showErrorModal(message = 'Sorry, there was an error.', goToHome = true) {
  /** @type {HTMLDialogElement | null} */
  const modal = document.querySelector('#alert-modal');
  const body = modal?.querySelector('p');
  if (body) {
    body.textContent = message;
  }
  modal?.showModal();
  if (goToHome) {
    // The router owns navigation; the modal only emits the intent.
    document.dispatchEvent(
      new CustomEvent(CUSTOM_EVENTS.NAVIGATE, {
        detail: {
          route: ROUTES.HOME,
        },
      }),
    );
  }
}

/**
 * Closes the app's shared error modal.
 *
 * @returns {void}
 */
export function closeErrorModal() {
  /** @type {HTMLDialogElement | null} */
  const modal = document.querySelector('#alert-modal');
  modal?.close();
}
