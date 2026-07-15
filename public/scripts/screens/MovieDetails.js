import { TemplateElement } from '../base/TemplateElement.js';
import { API } from '../services/API.js';
import '../components/YouTubeEmbed.js';

/**
 * Movie detail screen showing poster, trailer, metadata, genres, overview,
 * and cast for a single movie.
 *
 * The movie is identified by `params`, which `Router` sets on the element
 * instance (from the `/movies/(\d+)` route's capture group) before it is
 * connected to the DOM. `params[0]` is the movie ID as a string; it falls
 * back to `14` when the element is created without a route match, e.g. in a
 * standalone test harness.
 *
 * Use it like this:
 * ```js
 * import { MovieDetails } from './screens/MovieDetails.js';
 *
 * const screen = new MovieDetails();
 * screen.params = ['14'];
 * document.querySelector('main').appendChild(screen);
 * ```
 *
 * @summary Movie detail screen for a single movie ID
 * @tag movie-details
 * @tagname movie-details
 */
export class MovieDetails extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/screens/movie-details.html';

  #movie;

  /**
   * Reads the movie ID out of `params` (set by `Router` before this element
   * is connected) before deferring to `TemplateElement`'s template loading
   * and render lifecycle.
   *
   * @returns {void}
   */
  connectedCallback() {
    this.#movie = { id: this.params[0] ?? 14 };
    super.connectedCallback();
  }

  /**
   * Fetches the movie by ID and populates the template with its details,
   * genres, and cast.
   *
   * @returns {Promise<void>}
   */
  async render() {
    try {
      this.#movie = await API.getMovieById(+this.#movie.id);

      this.querySelector('h2').textContent = this.#movie.title;
      this.querySelector('h3').textContent = this.#movie.tagline;
      this.querySelector('img').src = this.#movie.poster_url;
      this.querySelector('#trailer').dataset.url = this.#movie.trailer_url;
      this.querySelector('#metadata').innerHTML = `
        <dt>Release Year</dt>
        <dd>${this.#movie.release_year}</dd>
        <dt>Score</dt>
        <dd>${this.#movie.score} / 10</dd>
        <dt>Popularity</dt>
        <dd>${this.#movie.popularity}</dd>
      `;
      this.querySelector('#genres').innerHTML = this.#movie.genres
        .map(genre => `<li>${genre.name}</li>`)
        .join('');
      this.querySelector('#overview').textContent = this.#movie.overview;
      this.#movie.casting.forEach(actor => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img src="${actor.image_url ?? '/images/generic_actor.jpg'}" alt="Picture of ${actor.first_name} ${actor.last_name}">
          <p>${actor.first_name} ${actor.last_name}</p>
        `;
        this.querySelector('#cast').appendChild(li);
      });
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      app.showErrorModal('Movie not found');
    }
  }
}

customElements.define('movie-details', MovieDetails);
