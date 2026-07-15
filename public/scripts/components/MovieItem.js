/**
 * Renders a single movie as a linked poster card for use in movie lists.
 *
 * Movie data is supplied via the constructor rather than HTML attributes.
 * The element is intended to be created programmatically and appended to a
 * list item.
 *
 * Use it like this:
 * ```js
 * import { MovieItem } from '../components/MovieItem.js';
 *
 * const li = document.createElement('li');
 * li.appendChild(new MovieItem({
 *   title: 'Inception',
 *   poster_url: '/posters/inception.jpg',
 *   release_year: 2010,
 * }));
 * ```
 *
 * @summary Movie poster card for list views
 * @tag movie-item
 * @tagname movie-item
 */
export class MovieItem extends HTMLElement {
  #movie;

  /**
   * @param {{ title: string, poster_url: string, release_year: number }} movie - Movie data from the API
   */
  constructor(movie) {
    super();
    this.#movie = movie;
  }

  connectedCallback() {
    this.innerHTML = `
      <a class="navlink" href="/movies/${this.#movie.id}">
        <article>
          <img src="${this.#movie.poster_url}" alt="${this.#movie.title} Poster" />
          <p>${this.#movie.title} (${this.#movie.release_year})</p>
        </article>
      </a>
    `;
  }
}

customElements.define('movie-item', MovieItem);
