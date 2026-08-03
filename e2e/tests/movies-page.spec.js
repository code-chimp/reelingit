import { test } from '../fixtures.js';

test.describe('MoviesPage', () => {
  test.skip('testing test', async ({ moviesPage }) => {
    await moviesPage.goto();
  });
});
