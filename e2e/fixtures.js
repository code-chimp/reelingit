import { test as base, expect } from '@playwright/test';
import AccountPagePom from './poms/account/account-page.pom.js';
import FavoritesPagePom from './poms/account/favorites-page.pom.js';
import LoginPagePom from './poms/account/login-page.pom.js';
import RegisterPagePom from './poms/account/register-page.pom.js';
import WatchlistPagePom from './poms/account/watchlist-page.pom.js';
import ErrorModalPom from './poms/error-modal.pom.js';
import HomePagePom from './poms/home-page.pom.js';
import MoviesPagePom from './poms/movies-page.pom.js';
import MovieDetailsPagePom from './poms/movie-details-page.pom.js';

/**
 * Project-wide Playwright fixtures: one POM per account screen, each
 * constructed with the test's `page` and injected as a same-named test
 * argument. Import `test`/`expect` from here instead of `@playwright/test`
 * to get access to these.
 *
 * @type {import('@playwright/test').Fixtures<
 *   {
 *     homePage: HomePagePom,
 *     moviesPage: MoviesPagePom,
 *     movieDetailsPage: MovieDetailsPagePom,
 *     accountPage: AccountPagePom,
 *     favoritesPage: FavoritesPagePom,
 *     loginPage: LoginPagePom,
 *     registerPage: RegisterPagePom,
 *     watchlistPage: WatchlistPagePom,
 *     errorModal: ErrorModalPom,
 *   },
 *   {},
 *   import('@playwright/test').PlaywrightTestArgs,
 *   import('@playwright/test').PlaywrightWorkerArgs
 * >}
 */
const fixtures = {
  homePage: async ({ page }, use) => {
    await use(new HomePagePom(page));
  },
  moviesPage: async ({ page }, use) => {
    await use(new MoviesPagePom(page));
  },
  movieDetailsPage: async ({ page }, use) => {
    await use(new MovieDetailsPagePom(page));
  },
  // protected pages
  accountPage: async ({ page }, use) => {
    await use(new AccountPagePom(page));
  },
  favoritesPage: async ({ page }, use) => {
    await use(new FavoritesPagePom(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPagePom(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPagePom(page));
  },
  watchlistPage: async ({ page }, use) => {
    await use(new WatchlistPagePom(page));
  },
  // utility components
  errorModal: async ({ page }, use) => {
    await use(new ErrorModalPom(page));
  },
};

export const test = base.extend(fixtures);

export { expect };
