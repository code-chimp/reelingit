import { GUARDIANS_OF_THE_GALAXY_MOVIE_ID, ROUTES } from '../constants.js';
import { expect } from '@playwright/test';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the `/movies/{id}` movie details screen.
 *
 * Locators are scoped under the `movie-details` custom element and its
 * `#movie` article. During fetch, the title contains `animated-loading`;
 * after `MovieDetailsPage.render()` completes the article is populated with
 * the movie's details and the `header` section exposes the favorite/watchlist
 * actions.
 */
export default class MovieDetailsPagePom {
  /** @type {Page} */
  #page;

  /** Root screen element (`movie-details`). @type {Locator} */
  root;
  /** Details article (`#movie`). @type {Locator} */
  articleWrapper;
  /** Header within the details article. @type {Locator} */
  articleHeader;

  /** @type {Locator} */
  title;
  /** Skeleton shown while the movie details load. @type {Locator} */
  loading;
  /** @type {Locator} */
  tagline;
  /** @type {Locator} */
  genres;
  /** @type {Locator} */
  overview;
  /** @type {Locator} */
  cast;

  // header
  /** @type {Locator} */
  poster;
  /** @type {Locator} */
  youtubeEmbed;
  /** Container for the favorite/watchlist action buttons (`#actions`). @type {Locator} */
  headerActions;
  /** @type {Locator} */
  metadata;
  /** "Add to Favorites" button; redirects guests to login. @type {Locator} */
  addToFavorites;
  /** "Add to Watchlist" button; redirects guests to login. @type {Locator} */
  addToWatchlist;

  /**
   * @param {Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('movie-details');

    this.articleWrapper = this.root.locator('#movie');
    this.title = this.articleWrapper.locator('h2');
    this.loading = this.title.locator('animated-loading');
    this.tagline = this.articleWrapper.locator('h3');
    this.genres = this.articleWrapper.locator('#genres');
    this.overview = this.articleWrapper.locator('#overview');
    this.cast = this.articleWrapper.locator('#cast');

    this.articleHeader = this.articleWrapper.locator('header');
    this.poster = this.articleHeader.locator('img');
    this.youtubeEmbed = this.articleWrapper.locator('youtube-embed');
    this.headerActions = this.articleHeader.locator('#actions');
    this.metadata = this.headerActions.locator('#metadata');
    this.addToFavorites = this.headerActions.getByRole('button', { name: 'Add to Favorites' });
    this.addToWatchlist = this.headerActions.getByRole('button', { name: 'Add to Watchlist' });
  }

  /**
   * Navigates to the movie details page.
   * @param {number} [id] Defaults to {@link GUARDIANS_OF_THE_GALAXY_MOVIE_ID}.
   * @returns {Promise<void>}
   */
  async goto(id = GUARDIANS_OF_THE_GALAXY_MOVIE_ID) {
    await this.#page.goto(`${ROUTES.MOVIES}/${id}`);
  }
  /**
   * Waits until the screen is mounted and the details have finished loading.
   *
   * "Loaded" means `animated-loading` is gone from the title.
   *
   * @returns {Promise<void>}
   */
  async waitForLoaded() {
    await expect(this.root).toBeVisible();
    await expect(this.loading).toBeHidden();
  }
}
