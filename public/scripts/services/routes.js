import { HomePage } from '../screens/HomePage.js';
import { MovieDetails } from '../screens/MovieDetails.js';
import { MoviesPage } from '../screens/MoviesPage.js';

/**
 * Route table consumed by `Router.js`.
 *
 * Each entry is `{ path, component }`, where `path` is either an exact
 * string match against the route's pathname, or a `RegExp` matched against
 * the full route (including query string) whose capture groups are exposed
 * to the mounted component as `screenElement.params`. `component` is a
 * `HTMLElement` subclass constructed with `new` and appended to `<main>`.
 *
 * Entries with a placeholder comment (e.g. `MoviesPage, //RegisterPage`)
 * are temporary stand-ins pending their real screen component.
 *
 * @type {Array<{ path: string|RegExp, component: CustomElementConstructor }>}
 */
export const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/movies',
    component: MoviesPage,
  },
  {
    path: /\/movies\/(\d+)/,
    component: MovieDetails,
  },
  {
    path: '/account/register',
    component: MoviesPage, //RegisterPage
  },
  {
    path: '/account/login',
    component: MoviesPage, //LoginPage
  },
  {
    path: '/account/',
    component: MoviesPage, //AccountPage,
  },
  {
    path: '/account/favorites',
    component: MoviesPage, //FavoritesPage,
  },
  {
    path: '/account/watchlist',
    component: MoviesPage, //WatchlistPage
  },
];
