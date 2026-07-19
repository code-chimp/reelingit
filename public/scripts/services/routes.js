import { AccountPage } from '../pages/account/AccountPage.js';
import { FavoritesPage } from '../pages/account/FavoritesPage.js';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/account/LoginPage.js';
import { MovieDetailsPage } from '../pages/MovieDetailsPage.js';
import { MoviesPage } from '../pages/MoviesPage.js';
import { RegisterPage } from '../pages/account/RegisterPage.js';
import { WatchlistPage } from '../pages/account/WatchlistPage.js';
import { ROUTES } from '../constants.js';

/**
 * Route table consumed by `Router.js`.
 *
 * Each entry is `{ path, component, protected }`, where `path` is either an
 * exact string match against the route's pathname, or a `RegExp` matched
 * against the full route (including query string) whose capture groups are
 * exposed to the mounted component as `screenElement.params`. `component`
 * is a `HTMLElement` subclass constructed with `new` and appended to
 * `<main>`. `protected` (default `false`) requires the user to be logged
 * in; `Router.go` redirects to `ROUTES.ACCOUNT_LOGIN` instead of mounting
 * the component when it's `true` and the user isn't.
 *
 * @type {Array<{ path: string|RegExp, component: CustomElementConstructor, protected?: boolean }>}
 */
export const routes = [
  {
    path: ROUTES.HOME,
    component: HomePage,
  },
  {
    path: ROUTES.MOVIES,
    component: MoviesPage,
  },
  {
    path: /\/movies\/(\d+)/,
    component: MovieDetailsPage,
  },
  {
    path: ROUTES.ACCOUNT_REGISTER,
    component: RegisterPage,
  },
  {
    path: ROUTES.ACCOUNT_LOGIN,
    component: LoginPage,
  },
  {
    path: ROUTES.ACCOUNT_FAVORITES,
    component: FavoritesPage,
    protected: true,
  },
  {
    path: ROUTES.ACCOUNT_WATCHLIST,
    component: WatchlistPage,
    protected: true,
  },
  {
    path: ROUTES.ACCOUNT,
    component: AccountPage,
    protected: true,
  },
];
