import { expect, test } from '../../fixtures.js';

test.describe('AccountPage', () => {
  test.beforeEach(async ({ accountPage }) => {
    await accountPage.goto();
  });

  test.skip('clicking Favorites button takes you to Favorites', async ({
    accountPage,
    favoritesPage,
  }) => {
    await accountPage.goto();
    await expect(favoritesPage.root).toBeVisible();
  });

  test.skip('clicking Watchlist button takes you to Watchlist', async ({
    accountPage,
    watchlistPage,
  }) => {
    await accountPage.goto();
    await expect(watchlistPage.root).toBeVisible();
  });

  test.skip('clicking Logout button takes you Home', async ({ accountPage, homePage }) => {
    await accountPage.goto();
    await expect(homePage.root).toBeVisible();
  });
});
