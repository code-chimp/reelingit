import { test } from '../../fixtures.js';

test.describe('LoginPage', () => {
  test.skip('testing test', async ({ loginPage }) => {
    await loginPage.goto();
  });
});
