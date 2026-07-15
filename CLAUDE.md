# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ReelingIt is a movie browsing app: a Go backend (stdlib `net/http`, PostgreSQL via `lib/pq`) serving a JSON API, paired with a vanilla-JS frontend built on native Web Components (no framework, no bundler). It doubles as the companion repo for the Frontend Masters course "Build a Fullstack App in Vanilla JS & Go" — `README.md` contains the full course script (sections A–K) with copy-paste code snippets for every step. The actual repo is partway through that script; check current source before assuming a section's snippet reflects what's implemented.

## Commands

Backend (run from repo root, requires `.env` with `DATABASE_URL` and `PORT`):
```
go run ./cmd/main.go        # run the server once
air                          # hot-reload dev server (config: .air.toml, builds to ./tmp/main)
go build ./...                # compile check
go vet ./...
```

Local Postgres:
```
docker-compose up -d          # starts postgres on :5432 (db/user/pass: reelingit)
```
Seed data comes from `import/database-dump.sql` and `import/install.go`.

Frontend lint/format (no build step — static files served directly from `public/`):
```
npm run lint          # runs lint:format + lint:styles
npm run lint:format   # prettier --check ./public
npm run fix:format    # prettier --write ./public
npm run lint:styles   # stylelint on ./public/**/*.css
npm run fix:styles
npm run manifest:gen  # regenerate custom-elements.json via @custom-elements-manifest/analyzer
```

There is no JS test runner configured (`npm test` is a stub) and no Go test files currently exist.

## Backend architecture

Layering: `cmd/main.go` (wiring/config/routes) → `internal/handlers` (HTTP handlers) → `internal/data` (repositories) → `internal/models` (structs) → `internal/logger`.

- **`internal/data/interfaces.go`** defines storage interfaces (e.g. `MovieStorage`) that handlers depend on, not concrete repository types — handlers take `data.MovieStorage`, and `*data.MovieRepository` implements it. Follow this pattern for new resources (e.g. an eventual `UserStorage`/`AuthHandler`).
- **`internal/data/movies_repository.go`** hand-writes SQL against `database/sql` (no ORM). `GetMovieByID` does a primary query then a separate `fetchMovieRelations` step to populate genres/actors/keywords via join queries — follow that pattern rather than one giant join. Repository-level errors are sentinel values (e.g. `ErrMovieNotFound`) that handlers check with `errors.Is`.
- **`internal/handlers/movie_handler.go`** has shared helpers (`writeJSONResponse`, `handleStorageError`, `parseID`) that every handler method should reuse rather than reimplementing response/error boilerplate.
- **`cmd/main.go`** wires routing with Go 1.22+ `http.ServeMux` method+path patterns (`mux.HandleFunc("GET /api/movies/{id}", ...)`). Static files and the SPA fallback are handled by `spaHandler`, which serves a real file if one exists at the request path and otherwise serves `public/index.html` so client-side routes (e.g. `/movies/90`) survive a hard navigation/refresh.
- `godotenv.Load()` is required to succeed (main fails fast if `.env` is missing), and `DATABASE_URL` is required; `PORT` defaults via `envOrDefault`.
- Some routes in `main.go` are stubs pointing at the wrong handler (e.g. `/api/account/register` → `GetGenres`) pending the auth handler described in the README's Section G — don't assume routes wired today are semantically correct without checking.

## Frontend architecture

Everything lives under `public/`, loaded directly by the browser as ES modules (`public/scripts/app.js` is the entry point referenced from `public/index.html`) — there is no bundler/transpiler in this repo.

- **`base/TemplateElement.js`** is the base class nearly every custom element should extend instead of `HTMLElement` directly. Subclasses set a static `TEMPLATE_PATH` to an external `.html` file containing a `<template>`; the base class fetches+caches that template per subclass, clones it into the element on `connectedCallback`, and then calls the subclass's `render()` hook. Override `handleError()` for custom failure UI instead of throwing from `render()`.
- **`services/Router.js`** + **`services/routes.js`**: a hand-rolled client-side router. `routes.js` maps a path (exact string or `RegExp`) to a custom element constructor; `Router.go()` swaps `<main>`'s contents by constructing `new route.component()`. RegExp routes expose capture groups to the mounted element as `screenElement.params`. Internal navigation must use `<a class="navlink">` (the router intercepts clicks on that class) or `Router.go()` directly — plain `<a href>` without the class triggers a full page load. Several route entries currently point at the `MoviesPage` placeholder with a comment noting the real screen (e.g. `//RegisterPage`) — replace the placeholder and comment together when building that screen.
- **`services/API.js`**: single client for all `/api/` calls. `API.fetch` swallows errors and resolves to `undefined` rather than throwing/rejecting — callers (screens/components) must handle an `undefined` result, not wrap calls in try/catch.
- **`window.app`** (set in `app.js`) exposes `API` and `Router` globally so inline HTML event attributes (e.g. `onsubmit="app.search(event)"`) can reach them without module imports — this is intentional for the inline-handler pattern used in templates, not a leftover global.
- Components are documented with JSDoc `@tag`/`@tagname` used by the Custom Elements Manifest analyzer (`npm run manifest:gen` → `custom-elements.json`) for IDE autocomplete on custom elements in HTML/templates. Keep these tags accurate when adding or renaming custom elements.

## Formatting

Prettier (`.prettierrc.json`) and Stylelint (`.stylelintrc.json`) govern `public/`: single quotes, semicolons, trailing commas, 95-char print width, `arrowParens: avoid`. Run `npm run fix:format` / `npm run fix:styles` before committing frontend changes. Go code follows standard `gofmt` conventions.
