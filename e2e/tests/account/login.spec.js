import { test } from '../../fixtures.js';

test.describe('LoginPage', () => {
  test('testing test', async ({ loginPage }) => {
    await loginPage.goto();
  });
});
