import { GUARDIANS_OF_THE_GALAXY_MOVIE_ID } from '../constants.js';
import { expect, test } from '../fixtures.js';

const EXPECTED_LIST_SIZE = 20;

test.describe('HomePage', () => {
  test.describe('normal state', () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.goto();
      await homePage.waitForLoaded();
    });

    test('displays top and random movies after loading', async ({ homePage }) => {
      await expect(homePage.topTitle).toHaveText("This Week's Top Movies");
      await expect(homePage.randomTitle).toHaveText('Something to watch today');
      await expect(homePage.topMovieLink.first()).toBeVisible();
      await expect(homePage.randomMovieLink.first()).toBeVisible();
      await expect(homePage.topMovieLink.first()).toHaveAttribute('href', /\/movies\/\d+/);
      await expect(homePage.randomMovieLink.first()).toHaveAttribute('href', /\/movies\/\d+/);
    });

    test('displays the correct number of movie cards', async ({ homePage }) => {
      await expect(homePage.topMovieItem).toHaveCount(EXPECTED_LIST_SIZE);
      await expect(homePage.randomMovieItem).toHaveCount(EXPECTED_LIST_SIZE);
    });

    test('navigates to movie details when a card is clicked', async ({
      homePage,
      movieDetailsPage,
    }) => {
      const gogLink = homePage.movieLinkFor(GUARDIANS_OF_THE_GALAXY_MOVIE_ID);
      await gogLink.click();
      await expect(movieDetailsPage.root).toBeVisible();
    });
  });

  test.describe('error state(s)', () => {
    test('backend failure leaves skeleton loaders on the screen', async ({
      homePage,
      page,
    }) => {
      await page.route('**/api/movies/top', route => route.abort());
      await homePage.goto();
      await expect(homePage.randomLoading).toBeVisible();
      await expect(homePage.topLoading).toBeVisible();
    });
  });
});
