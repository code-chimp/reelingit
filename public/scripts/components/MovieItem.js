import { ROUTES } from '../constants.js';

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
   * @param {{ id: number|string, title: string, poster_url: string, release_year: number }} movie - Movie data from the API
   */
  constructor(movie) {
    super();
    this.#movie = movie;
  }

  /**
   * Builds and appends the linked poster card after the element is connected.
   *
   * @returns {void}
   */
  connectedCallback() {
    const movieItem = document.createElement('a');
    movieItem.classList.add('navlink');
    movieItem.href = `${ROUTES.MOVIES}/${this.#movie.id}`;

    const poster = document.createElement('img');
    poster.src = `${this.#movie.poster_url}`;
    poster.alt = `${this.#movie.title} Poster`;

    const description = document.createElement('p');
    description.textContent = `${this.#movie.title} (${this.#movie.release_year})`;

    const wrapper = document.createElement('article');

    wrapper.appendChild(poster);
    wrapper.appendChild(description);
    movieItem.appendChild(wrapper);
    this.appendChild(movieItem);
  }
}

customElements.define('movie-item', MovieItem);
