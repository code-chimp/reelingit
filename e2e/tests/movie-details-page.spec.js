import { expect, test } from '../fixtures.js';

test.describe('MovieDetailsPage', () => {
  test.describe('base / guest behavior', () => {
    test.beforeEach(async ({ movieDetailsPage }) => {
      await movieDetailsPage.goto();
      await movieDetailsPage.waitForLoaded();
    });

    test('renders the movie details', async ({ movieDetailsPage }) => {
      await expect(movieDetailsPage.title).toHaveText('Guardians of the Galaxy');
      await expect(movieDetailsPage.tagline).toHaveText('All heroes start somewhere.');
      await expect(movieDetailsPage.overview).toHaveText(
        'Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.',
      );
      // happy path test of controls and display elements
    });

    test('cannot favorite the current movie', async ({ loginPage, movieDetailsPage }) => {
      await movieDetailsPage.addToFavorites.click();
      await expect(loginPage.root).toBeVisible();
    });

    test('cannot watchlist the current movie', async ({ loginPage, movieDetailsPage }) => {
      await movieDetailsPage.addToWatchlist.click();
      await expect(loginPage.root).toBeVisible();
    });
  });

  test.describe('authenticated behavior', () => {
    test.beforeAll(async () => {
      // login test user
    });

    test.beforeEach(async ({ movieDetailsPage }) => {
      await movieDetailsPage.goto();
      await movieDetailsPage.waitForLoaded();
    });

    test.afterAll(async () => {
      // cleanup test user
    });

    test.skip('can favorite the current movie', async ({
      favoritesPage,
      movieDetailsPage,
    }) => {
      await movieDetailsPage.addToFavorites.click();
      await expect(favoritesPage.root).toBeVisible();
      // verify the movie is in the list by href = /movies/GUARDIANS_OF_THE_GALAXY_MOVIE_ID
    });

    test.skip('can watchlist the current movie', async ({
      movieDetailsPage,
      watchlistPage,
    }) => {
      await movieDetailsPage.addToWatchlist.click();
      await expect(watchlistPage.root).toBeVisible();
      // verify the movie is in the list by href = /movies/GUARDIANS_OF_THE_GALAXY_MOVIE_ID
    });
  });

  test.describe('error state(s)', () => {
    const INVALID_MOVIE_ID = 99999;

    test('navigating with an invalid movie id results in the home page with an error modal', async ({
      homePage,
      movieDetailsPage,
    }) => {
      await movieDetailsPage.goto(INVALID_MOVIE_ID);
      await expect(homePage.root).toBeVisible();
      // need to verify error modal
    });
  });
});
