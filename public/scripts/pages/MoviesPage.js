import { TemplateElement } from '../base/TemplateElement.js';
import { MovieItem } from '../components/MovieItem.js';
import { API } from '../services/API.js';
import { ROUTES } from '../constants.js';

/**
 * Movie search/listing screen. Reads `q`, `order`, and `genre` from the
 * URL's query string, fetches matching movies, and renders them as a list
 * of `MovieItem`s alongside genre-filter and sort-order controls.
 *
 * Also stands in as a placeholder for several not-yet-built account routes
 * (register, login, account, favorites, watchlist) in `routes.js`.
 *
 * @summary Movie search/listing screen (also a placeholder for account routes)
 * @tag movie-page
 * @tagname movie-page
 */
export class MoviesPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/movies-page.html';

  /**
   * Genre list cached across all `MoviesPage` instances, since it rarely
   * changes within a session. Shared via a static (rather than instance)
   * field because `Router.go()` constructs a new instance on every
   * navigation to `/movies`.
   *
   * @type {Array<object>}
   */
  static #genres = [];
  #query = '';
  #order = '';
  #genre = '';

  /**
   * Populates the `select#filter` genre dropdown, fetching genres from the
   * API only if `MoviesPage.#genres` hasn't been populated yet.
   *
   * @returns {Promise<void>}
   */
  async #loadGenres() {
    if (MoviesPage.#genres.length === 0) {
      try {
        MoviesPage.#genres = await API.getGenres();
      } catch (e) {
        console.error(e);
        MoviesPage.#genres = [];
      }
    }

    const filterSelect = this.querySelector('select#filter');
    filterSelect.innerHTML = `<option value="">All Genres</option>`;

    MoviesPage.#genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      filterSelect.appendChild(option);
    });
  }

  /**
   * Reads `q`, `order`, and `genre` from the current URL's query string
   * before deferring to `TemplateElement.connectedCallback`, which clones
   * the template and invokes `render()`.
   *
   * @returns {void}
   */
  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    this.#query = urlParams.get('q') ?? '';
    this.#order = urlParams.get('order') ?? '';
    this.#genre = urlParams.get('genre') ?? '';

    super.connectedCallback();
  }

  /**
   * Renders the search results heading and movie list for `#query`,
   * `#order`, and `#genre`, then loads the genre filter options and
   * syncs the filter/order `<select>`s to reflect the current URL state.
   * Shows the shared error modal and bails out if `#query` is empty.
   *
   * @returns {Promise<void>}
   */
  async render() {
    if (this.#query !== '') {
      this.querySelector('h2').textContent = `Search Results for "${this.#query}"`;
    } else {
      app.showErrorModal('Please enter a search term');
      return;
    }

    const movies = await API.searchMovies(this.#query, this.#order, this.#genre);
    await this.#loadGenres();

    const moviesList = this.querySelector('ul');
    moviesList.innerHTML = '';

    if (movies && movies.length > 0) {
      movies.forEach(movie => {
        const li = document.createElement('li');
        li.appendChild(new MovieItem(movie));
        moviesList.appendChild(li);
      });
    } else {
      moviesList.innerHTML = `<li><h3>Could not find movies with the search term: ${this.#query}</h3></li>`;
    }

    if (this.#genre) {
      this.querySelector('select#filter').value = this.#genre;
    }

    if (this.#order) {
      this.querySelector('select#order').value = this.#order;
    }

    this.querySelector('select#filter').addEventListener('change', e =>
      this.#handleFilterChange(e),
    );
    this.querySelector('select#order').addEventListener('change', e =>
      this.#handleOrderChange(e),
    );
  }

  /**
   * Handles the genre filter `<select>`'s change event by re-navigating to
   * `/movies` with the chosen genre applied, preserving the current search
   * query and sort order.
   *
   * @param {Event} e - Change event from `select#filter`.
   * @returns {void}
   */
  #handleFilterChange(e) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const order = params.get('order') ?? '';
    app.Router.go(`${ROUTES.MOVIES}?q=${q}&genre=${e.target.value}&order=${order}`);
  }

  /**
   * Handles the sort-order `<select>`'s change event by re-navigating to
   * `/movies` with the chosen sort order applied, preserving the current
   * search query and genre filter.
   *
   * @param {Event} e - Change event from `select#order`.
   * @returns {void}
   */
  #handleOrderChange(e) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const genre = params.get('genre') ?? '';
    app.Router.go(`${ROUTES.MOVIES}?q=${q}&genre=${genre}&order=${e.target.value}`);
  }
}

customElements.define('movie-page', MoviesPage);
