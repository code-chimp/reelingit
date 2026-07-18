import { AccountPage } from '../pages/AccountPage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { MovieDetailsPage } from '../pages/MovieDetailsPage.js';
import { MoviesPage } from '../pages/MoviesPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';

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
    component: MovieDetailsPage,
  },
  {
    path: '/account/register',
    component: RegisterPage,
  },
  {
    path: '/account/login',
    component: LoginPage,
  },
  {
    path: '/account/favorites',
    component: MoviesPage, //FavoritesPage,
  },
  {
    path: '/account/watchlist',
    component: MoviesPage, //WatchlistPage
  },
  {
    path: '/account',
    component: AccountPage,
  },
];
