/**
 * Route paths used by `e2e/poms/` to build `goto()` targets and by specs
 * that need to assert on the current URL, mirroring
 * `public/scripts/constants.js`'s `ROUTES`. Kept as a separate copy here
 * (rather than imported from the app) so the e2e suite exercises the app
 * as a black box, the same way a real user's browser would, without a
 * source-level dependency on `public/`. Keeping paths centralized here
 * means a renamed route only needs updating in one place across all POMs.
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
 * A known, disposable account used by specs that exercise protected
 * flows (login, favorites, watchlist). Specs are responsible for
 * registering/cleaning up this user themselves; this is just the shared
 * identity so every spec/POM refers to the same credentials.
 *
 * @type {{ name: string, email: string, password: string }}
 */
export const TEST_USER = {
  name: 'Testy McTestface',
  email: 'testy@example.com',
  password: 's00p3r*s3kr1t',
};

export const BIG_HERO_SIX_MOVIE_ID = 84;
export const CAPT_AMERICA_MOVIE_ID = 165;
export const DEAD_MAN_ON_CAMPUS_MOVIE_ID = 2686;
export const DEADPOOL_MOVIE_ID = 784;
export const GUARDIANS_OF_THE_GALAXY_MOVIE_ID = 90;
