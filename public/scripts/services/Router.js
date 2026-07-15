import { routes } from './routes.js';

/**
 * Client-side router that swaps the contents of `<main>` based on the URL,
 * without a full page reload.
 *
 * Routes are declared in `routes.js` as `{ path, component }` pairs, where
 * `path` is either an exact string or a `RegExp` matched against the full
 * route (including query string). For a `RegExp` match, any capture groups
 * are exposed to the mounted screen as `screenElement.params`.
 *
 * Use it like this:
 * ```js
 * import { Router } from './services/Router.js';
 *
 * window.addEventListener('DOMContentLoaded', () => Router.init());
 * ```
 *
 * To navigate programmatically (e.g. from a link click handler):
 * ```js
 * Router.go('/movies/14');
 * ```
 *
 * @summary Client-side router for swapping screens into `<main>`
 */
export const Router = {
  /**
   * Wires up browser back/forward navigation and renders the screen for the
   * current URL. Call once on app startup.
   *
   * @returns {void}
   */
  init: () => {
    window.addEventListener('popstate', () => {
      Router.go(window.location.pathname, false);
    });

    document.addEventListener('click', e => {
      const anchor = e.target.closest('a.navlink');
      if (!anchor) return;

      e.preventDefault();
      Router.go(anchor.getAttribute('href'));
    });

    // go to the initial route
    Router.go(location.pathname + location.search);
  },

  /**
   * Matches `route` against the declared `routes` and mounts the matching
   * screen component into `<main>`, replacing any current content. Falls
   * back to a "Page not found" heading when no route matches.
   *
   * @param {string} route - Path to navigate to, optionally including a query string (e.g. `/movies/14?ref=home`)
   * @param {boolean} [addToHistory=true] - Whether to push `route` onto browser history. Pass `false` when responding to a `popstate` event, since the entry already exists.
   * @returns {void}
   */
  go: (route, addToHistory = true) => {
    if (addToHistory) {
      history.pushState(null, null, route);
    }

    const mainElement = document.querySelector('main');
    const routePath = route.split('?')[0];
    let screenElement = null;

    for (const r of routes) {
      if (typeof r.path === 'string' && r.path === routePath) {
        screenElement = new r.component();
        break;
      } else if (r.path instanceof RegExp) {
        const match = route.match(r.path);
        if (match) {
          screenElement = new r.component();
          screenElement.params = match.slice(1);
          break;
        }
      }
    }

    if (screenElement == null) {
      screenElement = document.createElement('h1');
      screenElement.textContent = 'Page not found';
    }

    function navigate() {
      mainElement.innerHTML = null;
      mainElement.appendChild(screenElement);
    }

    const oldPage = mainElement.firstChild;

    if (!document.startViewTransition) {
      navigate();
      return;
    }
    if (oldPage) {
      mainElement.style.viewTransitionName = 'old';
    }
    screenElement.style.viewTransitionName = 'new';

    document.startViewTransition(() => {
      navigate();
    });
  },
};
