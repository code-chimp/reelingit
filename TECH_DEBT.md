# Tech Debt

## Code review findings (July 2026)

Findings from an architecture review of the frontend SPA and its API
contract, ordered by priority. Items 1–2 should land before the testing
work below, since they define the seams the tests will mock against.

### 1. XSS: `innerHTML` interpolation of untrusted data

- [x] Fix the reflected XSS in `public/scripts/pages/MoviesPage.js` — the
      "no results" message interpolates the URL-supplied search term into
      `innerHTML` (`Could not find movies with the search term: ...`).
      Render the term via `textContent` instead
- [x] Sweep the remaining `innerHTML` writes that interpolate API data and
      switch data-bearing values to `textContent`/`createElement`:
      `MovieDetailsPage.js` (metadata `<dl>`, genres list, cast names),
      `MovieItem.js` (title, poster alt). Pattern: `innerHTML` is fine for
      static markup skeletons; anything containing data goes in via
      `textContent` or attribute assignment
- [x] Add a Content-Security-Policy header to the Go server (in
      `cmd/main.go`'s `spaHandler` or a wrapping middleware) as defense in
      depth

### 2. API error contract is ambiguous

- [x] Standardize a JSON error envelope on the Go side — auth failures in
      `internal/handlers/account_handler.go` currently use `http.Error`
      (plaintext), which the frontend's `response.json()` can't parse
- [x] Check `response.ok` in `API.fetch`/`API.post`
      (`public/scripts/services/API.js`) and throw typed errors instead of
      swallowing everything into `undefined`, so callers can distinguish
      "network down" from "401" from "empty list". Both methods now delegate
      to a shared `_handleResponse` helper; `LoginPage` and `RegisterPage`
      catch and display server error messages
- [x] Add a 401 handling path: clear the stored JWT and redirect to login.
      `_handleResponse` clears `Store.jwt` and fires a navigation event to
      `/account/login` on any 401 before throwing
- [x] Remove the obsolete `try/catch` blocks around `API.getFavorites` /
      `API.getWatchlist` in `API.js` — `API.fetch` now rethrows failures,
      allowing the calling pages to decide how to recover
- [ ] Rework `MovieDetailsPage.render()` error handling — it currently
      only works by accident (`undefined.title` throws a `TypeError` that
      gets reinterpreted as "Movie not found"). Handle the not-found case
      explicitly once `API.fetch` surfaces status codes

### 3. Query strings never encoded

- [ ] Build search/filter URLs with `URLSearchParams` instead of raw
      template interpolation: `app.search` in `app.js`, and
      `#handleFilterChange` / `#handleOrderChange` in `MoviesPage.js`.
      Searching for `AT&T` or `50%` currently breaks

### 4. `window.app` coupling (testability)

- [x] Invert the dependency direction: modules import `Store` and the error
      modal helper directly, and request navigation through document events
      rather than importing the router back through the route table. The
      runtime no longer depends on a `window.app` fixture
- [x] `API.js` reads `app.Store.jwt` without importing `Store` — it works
      only through temporal coupling with `app.js`. Import `Store`
      directly
- [x] Build the fetch headers object conditionally in `API.js` —
      `Authorization: null` in an object literal actually sends the header
      with the string value `"null"`

### 5. Router edge cases

- [ ] `popstate` handler in `services/Router.js` passes only
      `location.pathname` while `init` passes `pathname + search` — make
      them consistent (back-button to a search URL currently survives only
      because `MoviesPage` reads `location.search` itself)
- [ ] Check `protected` before calling `history.pushState` — the
      protected URL currently lands in history first, so the back button
      bounces the user back into the redirect
- [ ] Move focus to `<main>` (or the new page's `h1`) and update
      `document.title` on route changes — the two biggest SPA
      accessibility gaps; screen readers get no signal that the page
      changed

### 6. Smaller items

- [ ] `YouTubeEmbed.js`: `url.split('v=')[1]` breaks on `youtu.be` links
      and trailing params (`v=X&t=30`). Use
      `new URL(url).searchParams.get('v')`
- [ ] `HomePage.js`: fetch top and random movies with `Promise.all`
      instead of sequential `await`s
- [ ] `TemplateElement._loadTemplate`: check `response.ok` — a missing
      template path gets served `index.html` by the SPA fallback, so
      `querySelector('template')` returns `null` and fails with a
      confusing "cannot read content of null"
- [x] `MovieDetailsPage.js`: the `this.params[0] ?? 14` fallback throws
      anyway when `params` is undefined, so it doesn't do what the
      docstring claims — fix or remove
- [ ] `Store.js`: `loggedIn` returns `true` for an empty-string JWT
      (`this.jwt !== null`); use a truthiness check

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
