import { TemplateElement } from '../base/TemplateElement.js';
import { MovieItem } from '../components/MovieItem.js';
import { API } from '../services/API.js';

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
  static TEMPLATE_PATH = '/scripts/screens/movies-page.html';

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
  }
}

customElements.define('movie-page', MoviesPage);
