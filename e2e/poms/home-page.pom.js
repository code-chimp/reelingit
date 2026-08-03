import { expect } from '@playwright/test';
import { ROUTES } from '../constants.js';

/**
 * @typedef {import('@playwright/test').Locator} Locator
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Page object model for the `/` home screen.
 *
 * Locators are scoped under the `home-page` custom element and its two list
 * sections (`#top-10`, `#random`). During fetch, lists contain
 * `animated-loading`; after `HomePage.render()` completes they contain
 * `movie-item` cards with `a.navlink` links to movie details.
 */
export default class HomePagePom {
  /** @type {Page} */
  #page;

  /** Root screen element. @type {Locator} */
  root;

  /** Top movies section (`#top-10`). @type {Locator} */
  topSection;
  /** @type {Locator} */
  topTitle;
  /** @type {Locator} */
  topList;
  /** Skeleton shown while top movies load. @type {Locator} */
  topLoading;
  /** @type {Locator} */
  topListItem;
  /** One per movie after load. @type {Locator} */
  topMovieItem;
  /** Client-router links inside top movie cards. @type {Locator} */
  topMovieLink;

  /** Random movies section (`#random`). @type {Locator} */
  randomSection;
  /** @type {Locator} */
  randomTitle;
  /** @type {Locator} */
  randomList;
  /** Skeleton shown while random movies load. @type {Locator} */
  randomLoading;
  /** @type {Locator} */
  randomListItem;
  /** One per movie after load. @type {Locator} */
  randomMovieItem;
  /** Client-router links inside random movie cards. @type {Locator} */
  randomMovieLink;

  /**
   * @param {Page} page
   */
  constructor(page) {
    this.#page = page;
    this.root = page.locator('home-page');

    this.topSection = this.root.locator('#top-10');
    this.topTitle = this.topSection.locator('h2');
    this.topList = this.topSection.locator('ul');
    this.topLoading = this.topList.locator('animated-loading');
    this.topListItem = this.topList.locator('li');
    this.topMovieItem = this.topList.locator('movie-item');
    this.topMovieLink = this.topMovieItem.locator('a.navlink');

    this.randomSection = this.root.locator('#random');
    this.randomTitle = this.randomSection.locator('h2');
    this.randomList = this.randomSection.locator('ul');
    this.randomLoading = this.randomList.locator('animated-loading');
    this.randomListItem = this.randomList.locator('li');
    this.randomMovieItem = this.randomList.locator('movie-item');
    this.randomMovieLink = this.randomMovieItem.locator('a.navlink');
  }

  /**
   * Navigates to the home page (`/`).
   *
   * @returns {Promise<void>}
   */
  async goto() {
    await this.#page.goto(ROUTES.HOME);
  }

  /**
   * Waits until the screen is mounted and both lists have finished loading.
   *
   * "Loaded" means `animated-loading` is gone from the top and random lists.
   * Does not assert movie card count or content; callers should assert those
   * after this returns.
   *
   * @returns {Promise<void>}
   */
  async waitForLoaded() {
    await expect(this.root).toBeVisible();
    await expect(this.topLoading).toBeHidden();
    await expect(this.randomLoading).toBeHidden();
  }

  /**
   *
   * @param {number} movieId
   * @returns {Locator}
   */
  movieLinkFor(movieId) {
    return this.topMovieItem.locator(`a.navlink[href="/movies/${movieId}"]`);
  }
}
