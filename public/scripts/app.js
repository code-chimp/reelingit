/**
 * Application entry point.
 *
 * Registers the screen and universal custom elements, then boots the
 * client-side `Router` once the document is ready. Also exposes `API` and
 * `Router` on `window.app` so inline HTML attributes (e.g. the search
 * form's `onsubmit`) can reach them without a module import.
 *
 * @summary App bootstrap: element registration, router startup, window.app
 */
import './screens/HomePage.js';
import { API } from './services/API.js';
import { Router } from './services/Router.js';
// load universal components
import './components/AnimatedLoading.js';

window.addEventListener('DOMContentLoaded', () => {
  app.Router.init();
});

window.app = {
  API,
  Router,

  /**
   * Displays the app's shared error modal with the given message.
   *
   * @param {string} [message] - Text to show in the modal body.
   * @param {boolean} [goToHome] - Whether to navigate to `/` after showing the modal.
   * @returns {void}
   */
  showErrorModal: (message = 'Sorry, there was an error.', goToHome = true) => {
    const modal = document.querySelector('#alert-modal');
    modal.querySelector('p').textContent = message;
    modal.showModal();
    if (goToHome) {
      app.Router.go('/');
    }
  },

  /**
   * Closes the app's shared error modal.
   *
   * @returns {void}
   */
  closeErrorModal: () => {
    document.querySelector('#alert-modal').close();
  },

  /**
   * Handles the header search form's submit event.
   *
   * @param {SubmitEvent} e
   * @returns {void}
   */
  search: e => {
    e.preventDefault();

    const q = document.querySelector('input[type=search]').value;
    console.log(`Query: ${q}`);
  },
};
