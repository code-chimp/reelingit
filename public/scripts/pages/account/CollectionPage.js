import { TemplateElement } from '../../base/TemplateElement.js';
import { MovieItem } from '../../components/MovieItem.js';

/**
 * Generic screen for listing a named collection of movies (e.g. favorites
 * or watchlist), fetched via a caller-supplied endpoint.
 *
 * This class has no custom element tag of its own and is never registered
 * via `customElements.define`; it's meant to be subclassed by a concrete
 * page (e.g. `FavoritesPage`, `WatchlistPage`) that supplies the endpoint
 * and title and registers its own tag.
 *
 * Use it like this:
 * ```js
 * class FavoritesPage extends CollectionPage {
 *   constructor() {
 *     super(API.getFavorites, 'Favorite Movies');
 *   }
 * }
 *
 * customElements.define('favorites-page', FavoritesPage);
 * ```
 *
 * @summary Base screen for listing a named movie collection
 */
export class CollectionPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/account/collection-page.html';
  #endpoint;
  #title;

  /**
   * @param {() => Promise<Array<object>|undefined>} endpoint - Called on render to fetch the collection's movies
   * @param {string} title - Heading text to display above the movie list
   */
  constructor(endpoint, title) {
    super();
    this.#endpoint = endpoint;
    this.#title = title;
  }

  /**
   * Fetches the collection via `#endpoint` and renders it as a list of
   * `MovieItem`s under `#title`. Shows a "No movies in collection" message
   * when the collection is empty or the fetch fails.
   *
   * @returns {Promise<void>}
   */
  async render() {
    const movies = await this.#endpoint();
    const pageTitle = this.querySelector('h2');
    pageTitle.textContent = this.#title;
    const movieList = this.querySelector('ul#movies-result');
    movieList.innerHTML = '';

    if (movies && movies.length > 0) {
      movies.forEach(movie => {
        const movieItem = document.createElement('li');
        movieItem.appendChild(new MovieItem(movie));
        movieList.appendChild(movieItem);
      });
    } else {
      movieList.innerHTML = '<li><h3>No movies in collection</h3></li>';
    }
  }
}
