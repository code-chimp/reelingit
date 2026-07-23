/**
 * Application entry point.
 *
 * Registers universal elements, initializes the client-side `Router`, and
 * wires document-level controls once the DOM is ready. Navigation and modal
 * behavior are invoked through imported services rather than inline handlers.
 *
 * @summary App bootstrap and document-level event wiring
 */
import './pages/HomePage.js';
import { ROUTES } from './constants.js';
import { closeErrorModal } from './services/ErrorModal.js';
import { Router } from './services/Router.js';
// load universal components
import './components/AnimatedLoading.js';

window.addEventListener('DOMContentLoaded', () => {
  Router.init();

  document.querySelector('#search-form').addEventListener('submit', e => {
    e.preventDefault();

    const q = document.querySelector('input[type=search]').value;
    const search = new URLSearchParams({
      q,
    });
    Router.go(`${ROUTES.MOVIES}?${search}`);
  });

  document.querySelector('#close-alert').addEventListener('click', () => {
    closeErrorModal();
  });
});
