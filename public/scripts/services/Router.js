import { routes } from './routes.js';

export const Router = {
  init: () => {
    window.addEventListener('popstate', () => {
      Router.go(window.location.pathname, false);
    });

    // go to the initial route
    Router.go(location.pathname + location.search);
  },

  go: (route, addToHistory = true) => {
    if (addToHistory) {
      history.pushState(null, '', route);
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

    mainElement.innerHTML = null;
    mainElement.appendChild(screenElement);
  },
};
