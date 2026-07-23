import { routes } from './routes.js';
import { CUSTOM_EVENTS, ROUTES } from '../constants.js';
import Store from './Store.js';

/**
 * Client-side router that swaps the contents of `<main>` based on the URL,
 * without a full page reload.
 *
 * Routes are declared in `routes.js` as `{ path, component, protected }`
 * entries, where `path` is either an exact string or a `RegExp` matched
 * against the full route (including query string). For a `RegExp` match,
 * any capture groups are exposed to the mounted screen as
 * `screenElement.params`. Routes marked `protected` redirect to
 * `ROUTES.ACCOUNT_LOGIN` instead of mounting when the user isn't logged in.
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
 * @summary Client-side router for swapping pages into `<main>`
 */
export const Router = {
  /**
   * Wires browser history, delegated nav-link clicks, and document-level
   * navigation requests, then renders the screen for the current URL. Call
   * once on app startup.
   *
   * @returns {void}
   */
  init: () => {
    window.addEventListener('popstate', () => {
      Router.go(window.location.pathname + window.location.search, false);
    });

    document.addEventListener('click', e => {
      const anchor = e.target.closest('a.navlink');
      if (!anchor) return;

      e.preventDefault();
      Router.go(anchor.getAttribute('href'));
    });

    document.addEventListener(CUSTOM_EVENTS.NAVIGATE, e => {
      Router.go(e.detail.route);
    });

    // go to the initial route
    Router.go(location.pathname + location.search);
  },

  /**
   * Matches `route` against the declared `routes` and mounts the matching
   * screen component into `<main>`, replacing any current content, using a
   * view transition (`document.startViewTransition`) when the browser
   * supports it. Falls back to a "Page not found" heading when no route
   * matches. If the matched route is `protected` and the user isn't logged
   * in (per `Store.loggedIn`), redirects to `ROUTES.ACCOUNT_LOGIN`
   * instead of mounting anything.
   *
   * @param {string} route - Path to navigate to, optionally including a query string (e.g. `/movies/14?ref=home`)
   * @param {boolean} [addToHistory=true] - Whether to push `route` onto browser history. Pass `false` when responding to a `popstate` event, since the entry already exists.
   * @returns {void}
   */
  go: (route, addToHistory = true) => {
    const mainElement = document.querySelector('main');
    const routePath = route.split('?')[0];
    let pageTitle = 'Movies';
    let protectedRoute = false;
    let screenElement = null;

    for (const r of routes) {
      if (typeof r.path === 'string' && r.path === routePath) {
        pageTitle = r.pageTitle;
        screenElement = new r.component();
        protectedRoute = r.protected ?? false;
        break;
      } else if (r.path instanceof RegExp) {
        const match = route.match(r.path);
        if (match) {
          pageTitle = r.pageTitle;
          screenElement = new r.component();
          screenElement.params = match.slice(1);
          protectedRoute = r.protected ?? false;
          break;
        }
      }
    }

    if (protectedRoute && !Store.loggedIn) {
      Router.go(ROUTES.ACCOUNT_LOGIN);
      return;
    }

    if (addToHistory) {
      history.pushState(null, null, route);
    }

    if (screenElement == null) {
      screenElement = document.createElement('h1');
      screenElement.textContent = 'Page not found';
      pageTitle = `Page not found`;
    }

    function navigate() {
      document.title = `ReelingIt - ${pageTitle}`;
      mainElement.innerHTML = null;
      mainElement.appendChild(screenElement);
      mainElement.focus({ preventScroll: true });
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
