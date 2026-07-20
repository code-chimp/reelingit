# ReelingIt

A movie browsing app: a Go backend (stdlib `net/http`, PostgreSQL) serving a
JSON API, paired with a vanilla JavaScript frontend built on native Web
Components — no framework, no bundler.

## Attribution

This project began as the companion exercise for the
[Build a Fullstack App in Vanilla JS & Go](https://frontendmasters.com/courses/vanilla-js-go/)
course by [Max Firtman](https://firt.dev/) on Frontend Masters. The course and
Max's teaching are the foundation here and are highly recommended.

This repository is **my version** of that project, and it deviates from the
course code in a number of places — see below. The original seed data importer
(`import/install.go`) is from the course author's starter repository and was
not written by me.

## How this differs from the course code

Beyond following the coursework, I restructured parts of the frontend and
added tooling the course does not cover:

- **`TemplateElement` base class**
  ([public/scripts/base/TemplateElement.js](public/scripts/base/TemplateElement.js)):
  page and component templates live in external `.html` files rather than
  inline in `index.html`. The base class fetches and caches each template once
  per subclass, clones it on `connectedCallback`, and exposes `render()` and
  `handleError()` hooks for subclasses.
- **OOP structure**: the `CollectionPage` → `FavoritesPage`/`WatchlistPage`
  relationship comes from the course; my version differs in that every page
  flows up to the shared `TemplateElement` base class. I also moved the login
  and register form handling into their respective page components, where the
  course hangs those functions off the global `window.app`. Private class
  fields (`#field`) hold internal state, and a `constants.js` module replaces
  magic strings for routes, collections, and storage keys.
- **Session-level genre caching**: `MoviesPage` caches the genre list in a
  static class field, so a nearly-static list is fetched once per session
  rather than on every visit to the search screen. Since the router
  constructs a fresh page instance on each navigation, the static field acts
  as the vanilla stand-in for what would be a store slice or query cache in
  a framework app.
- **Static analysis**: Prettier and Stylelint govern everything under
  `public/`, with npm scripts for checking and fixing.
- **Custom Elements Manifest**: components carry JSDoc `@tag` annotations and
  `npm run manifest:gen` produces `custom-elements.json` for IDE autocomplete
  on custom elements in HTML.
- **Documentation-first JSDoc**: modules and methods document their contracts
  and the reasoning behind non-obvious choices, not just parameter lists.

## Tech stack

| Layer    | Choices                                                              |
| -------- | -------------------------------------------------------------------- |
| Backend  | Go (stdlib `net/http`, Go 1.22+ method/path routing), `lib/pq`, JWT  |
| Database | PostgreSQL (Docker Compose for local dev)                            |
| Frontend | Vanilla JS ES modules, native Web Components, hand-rolled SPA router |
| Tooling  | Air (hot reload), Prettier, Stylelint, Custom Elements Manifest      |

## Getting started

### Prerequisites

- Go 1.22+
- Node.js (for frontend lint/format tooling only — there is no build step)
- Docker (for local PostgreSQL)

### Setup

1. Start the local database:

   ```
   docker-compose up -d
   ```

2. Create a `.env` file in the repo root:

   ```
   DATABASE_URL=postgres://reelingit:reelingit@localhost:5432/reelingit?sslmode=disable
   PORT=:8080
   ```

3. Seed the database (one-off; from the `import/` folder):

   ```
   cd import && go run install.go
   ```

4. Run the server:

   ```
   go run ./cmd/main.go
   ```

   or with hot reload (macOS/Linux):

   ```
   air
   ```

   On Windows, use the dedicated config, which builds a `.exe` binary:

   ```
   air -c .air.win.toml
   ```

Then open [http://localhost:8080](http://localhost:8080). The frontend is
served directly from `public/` — no bundler, no build step.

### Frontend tooling

```
npm run lint          # prettier --check + stylelint
npm run fix:format    # prettier --write ./public
npm run fix:styles    # stylelint --fix
npm run manifest:gen  # regenerate custom-elements.json
```

## Project structure

```
cmd/main.go            server wiring: config, routes, SPA fallback
internal/
  handlers/            HTTP handlers (movies, account/auth)
  data/                repositories + storage interfaces, hand-written SQL
  models/              domain structs
  token/               JWT create/validate
  logger/              file + stdout logger
public/
  index.html           app shell
  scripts/
    app.js             entry point: element registration, router boot
    base/              TemplateElement base class
    components/        reusable custom elements
    pages/             screen components + their .html templates
    services/          Router, API client, Store, route table
import/                course-provided seed data + importer
```

Backend layering follows handlers → storage interfaces → repositories, with
handlers depending on interfaces (`data.MovieStorage`, `data.AccountStorage`)
rather than concrete types, and repository errors surfaced as sentinel values
checked with `errors.Is`.

## Roadmap

Planned work beyond the coursework — frontend unit tests with Vitest, Go unit
tests (including `testcontainers-go` for repository tests against real
Postgres), Playwright end-to-end tests, and a prioritized list of code review
findings — is tracked in [TECH_DEBT.md](TECH_DEBT.md).
