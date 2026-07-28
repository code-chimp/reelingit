// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from .env so tests and the webServer share
 * config with the Go server (see cmd/main.go). Node's built-in loader is
 * a no-op if .env doesn't exist, matching godotenv.Load()'s fallback to
 * real environment variables.
 */
process.loadEnvFile?.(new URL('.env', import.meta.url));

// cmd/main.go's PORT is a Go net/http addr (e.g. ":8080"); strip the
// leading colon to build a URL.
const port = (process.env.PORT || ':8080').replace(/^:/, '');
const baseURL = `http://localhost:${port}`;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Only *.spec.js are e2e tests; *.test.js is reserved for vitest unit tests. */
  testMatch: '**/*.spec.js',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Bring up Postgres and the air-managed Go server before running tests.
   * If `air` is already running on baseURL, Playwright reuses it instead
   * of starting a second instance (see reuseExistingServer below); either
   * way, cmd/main.go's own db.Ping()-and-exit on startup means a down
   * database surfaces as a clear webServer timeout rather than passing
   * silently. */
  webServer: {
    command: 'docker-compose up -d && air',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
