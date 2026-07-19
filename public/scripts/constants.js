/**
 * App-wide constants for values referenced from more than one module, so a
 * typo in one spot can't silently diverge from another (e.g. a route string
 * declared in `routes.js` but re-typed at a call site elsewhere).
 *
 * @module constants
 */

/**
 * Route paths used both to declare `routes.js`'s route table and to
 * navigate to those routes elsewhere (`Router.go(...)`, `<a href>`
 * construction). Keeping both sides in sync via these constants means a
 * renamed route can't drift out of sync between the two.
 *
 * @type {{
 *   HOME: string,
 *   MOVIES: string,
 *   ACCOUNT: string,
 *   ACCOUNT_LOGIN: string,
 *   ACCOUNT_REGISTER: string,
 *   ACCOUNT_FAVORITES: string,
 *   ACCOUNT_WATCHLIST: string,
 * }}
 */
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  ACCOUNT: '/account',
  ACCOUNT_LOGIN: '/account/login',
  ACCOUNT_REGISTER: '/account/register',
  ACCOUNT_FAVORITES: '/account/favorites',
  ACCOUNT_WATCHLIST: '/account/watchlist',
};

/**
 * Named movie collections a user can save a movie to, via
 * `API.saveToCollection`.
 *
 * @type {{ FAVORITE: string, WATCHLIST: string }}
 */
export const COLLECTIONS = {
  FAVORITE: 'favorite',
  WATCHLIST: 'watchlist',
};

/**
 * `localStorage` keys used by `Store.js` to persist session state across
 * page reloads.
 *
 * @type {{ JWT: string }}
 */
export const STORAGE_KEYS = {
  JWT: 'jwt',
};
