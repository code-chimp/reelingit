# Tech Debt

Testing is not yet in place across the stack. The intention is to close that
gap with three layers: Go unit tests on the backend, Vitest unit tests on the
frontend, and Playwright end-to-end tests covering critical user flows.

## Go backend unit tests

- [ ] Add `go test` coverage for `internal/data` repositories (movie and
      account), including error paths (`ErrMovieNotFound`,
      `ErrRegistrationValidation`, `ErrUserAlreadyExists`,
      `ErrAuthenticationValidation`, `ErrUserNotFound`)
- [ ] Add coverage for `internal/handlers` (movie and account handlers),
      verifying status codes and response bodies for both success and
      error cases
- [ ] Add coverage for `internal/token` (`CreateJWT`, `ValidateJWT`,
      `GetJWTSecret`), including expiry and invalid-signature cases
- [ ] Use `testcontainers-go` to run `internal/data` repository tests
      against a real, ephemeral Postgres container seeded from
      `import/database-dump.sql` (see blurb below); keep handler/token
      tests on lightweight interface fakes instead, since they don't touch
      SQL
- [ ] Wire `go test ./...` into CI

## Frontend unit tests (Vitest)

- [ ] Add Vitest as a dev dependency alongside the existing Vite build setup
- [ ] Test `services/Router.js` route matching (string and RegExp routes,
      capture groups, not-found fallback)
- [ ] Test `services/API.js` (`fetch`/`post` error swallowing, query string
      building, each endpoint method)
- [ ] Test `services/Store.js` (localStorage persistence, `loggedIn` getter)
- [ ] Test `base/TemplateElement.js` lifecycle (template caching, render
      hook, `handleError`)
- [ ] Test form validation logic in `pages/RegisterPage.js` and
      `pages/LoginPage.js`
- [ ] Wire `npm test` (currently a stub) to run Vitest in CI

## End-to-end tests (Playwright)

- [ ] Add Playwright and a baseline config pointed at the local dev server
- [ ] Cover the register → login → account golden path
- [ ] Cover movie search, genre filter, and sort order on the movies screen
- [ ] Cover adding/removing a movie from favorites and watchlist
- [ ] Cover deep-link navigation (hard refresh on a client-side route, e.g.
      `/movies/90`)
- [ ] Wire Playwright into CI (headless, against a built/served app)

## What is testcontainers?

[`testcontainers-go`](https://github.com/testcontainers/testcontainers-go) is
a Go library that spins up real Docker containers from inside a test file,
and tears them down automatically when the test binary exits. Instead of
mocking `database/sql` or pointing tests at a long-lived local Postgres
instance (like the `docker-compose up -d` one used for day-to-day dev), a
test calls the library to launch a fresh, disposable Postgres container,
gets back a connection string, and runs real SQL against it. This means the
repository tests in `internal/data` (`account_repository.go`,
`movie_repository.go`) exercise the actual queries — joins, constraints,
type coercion — against the real database engine they run against in
production, not an approximation of it.

How this would fit into this project:

1. Add `github.com/testcontainers/testcontainers-go` and its
   `testcontainers-go/modules/postgres` module as a Go test-only dependency.
2. In a `TestMain(m *testing.M)` for the `internal/data` package, start one
   Postgres container for the whole test run (not per-test, to avoid
   container-startup overhead multiplying), load the schema/seed from
   `import/database-dump.sql` (the same file already used for local dev
   seeding), and store the resulting `*sql.DB` for tests to use.
3. Write table-driven tests against `AccountRepository` and
   `MovieRepository` using that `*sql.DB`, asserting on the sentinel errors
   (`ErrUserNotFound`, etc.) already defined in the repositories.
4. In CI, this only requires a Docker daemon to be available to the runner
   (GitHub Actions' hosted runners have one out of the box).

Further reading:

- [Testcontainers for Go — official docs](https://golang.testcontainers.org/)
- [Getting started with Testcontainers for Go](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)
- [Comprehensive Guide to Testcontainers for Go (Stackademic)](https://blog.stackademic.com/comprehensive-guide-to-testcontainers-for-go-practical-testing-with-containers-b11039e0bf41)
