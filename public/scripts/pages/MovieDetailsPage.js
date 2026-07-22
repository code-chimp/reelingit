import { COLLECTIONS, ROUTES } from '../constants.js';
import { TemplateElement } from '../base/TemplateElement.js';
import '../components/YouTubeEmbed.js';
import { API } from '../services/API.js';
import { showErrorModal } from '../services/ErrorModal.js';
import Store from '../services/Store.js';

/**
 * Movie detail screen showing poster, trailer, metadata, genres, overview,
 * and cast for a single movie.
 *
 * The movie is identified by `params`, which `Router` sets on the element
 * instance (from the `/movies/(\d+)` route's capture group) before it is
 * connected to the DOM. `params[0]` is the movie ID as a string.
 *
 * Also wires up the "Add to Favorites"/"Add to Watchlist" buttons to save
 * the movie to the corresponding `COLLECTIONS` entry for the current user,
 * redirecting to `ROUTES.ACCOUNT` first if they aren't logged in.
 *
 * Use it like this:
 * ```js
 * import { MovieDetailsPage } from './pages/MovieDetailsPage.js';
 *
 * const screen = new MovieDetailsPage();
 * screen.params = ['14'];
 * document.querySelector('main').appendChild(screen);
 * ```
 *
 * @summary Movie detail screen for a single movie ID
 * @tag movie-details
 * @tagname movie-details
 */
export class MovieDetailsPage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/pages/movie-details-page.html';

  #movie;

  /**
   * Saves movie_id to the given named collection (a `COLLECTIONS` value) for
   * the current user, then navigates to that collection's page. If the user
   * isn't logged in, navigates to `ROUTES.ACCOUNT` instead of attempting the
   * save. Shows the shared error modal if the save request fails.
   *
   * @param {number|string} movie_id - ID of the movie to save.
   * @param {string} collection - Target collection, one of `COLLECTIONS`'s values.
   * @returns {Promise<void>}
   */
  async #saveToCollection(movie_id, collection) {
    if (Store.loggedIn) {
      try {
        const response = await API.saveToCollection(movie_id, collection);
        if (response.success) {
          switch (collection) {
            case COLLECTIONS.FAVORITE:
              this.navigate(ROUTES.ACCOUNT_FAVORITES);
              break;
            case COLLECTIONS.WATCHLIST:
              this.navigate(ROUTES.ACCOUNT_WATCHLIST);
          }
        } else {
          showErrorModal("We couldn't save the movie.");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      this.navigate(ROUTES.ACCOUNT);
    }
  }

  /**
   * Reads the movie ID out of `params` (set by `Router` before this element
   * is connected) before deferring to `TemplateElement`'s template loading
   * and render lifecycle.
   *
   * @returns {void}
   */
  connectedCallback() {
    this.#movie = { id: this.params[0] };
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

      // metadata definition list
      const metaDataDL = this.querySelector('#metadata');

      const releaseDt = document.createElement('dt');
      releaseDt.textContent = 'Release Year';
      const releaseDd = document.createElement('dd');
      releaseDd.textContent = this.#movie.release_year;

      const scoreDt = document.createElement('dt');
      scoreDt.textContent = 'Score';
      const scoreDd = document.createElement('dd');
      scoreDd.textContent = `${this.#movie.score} / 10`;

      const popularityDt = document.createElement('dt');
      popularityDt.textContent = 'Popularity';
      const popularityDd = document.createElement('dd');
      popularityDd.textContent = `${this.#movie.popularity}`;

      metaDataDL.appendChild(releaseDt);
      metaDataDL.appendChild(releaseDd);
      metaDataDL.appendChild(scoreDt);
      metaDataDL.appendChild(scoreDd);
      metaDataDL.appendChild(popularityDt);
      metaDataDL.appendChild(popularityDd);

      // genres
      const genresUl = this.querySelector('#genres');
      this.#movie.genres.forEach(genre => {
        const li = document.createElement('li');
        li.textContent = genre.name;
        genresUl.appendChild(li);
      });

      this.querySelector('#overview').textContent = this.#movie.overview;
      const castUl = this.querySelector('#cast');
      this.#movie.casting.forEach(actor => {
        const actorPic = document.createElement('img');
        actorPic.src = actor.image_url ?? '/images/generic_actor.jpg';
        actorPic.alt = `Picture of ${actor.first_name} ${actor.last_name}`;

        const actorName = document.createElement('p');
        actorName.textContent = `${actor.first_name} ${actor.last_name}`;

        const li = document.createElement('li');
        li.appendChild(actorPic);
        li.appendChild(actorName);
        castUl.appendChild(li);
      });

      this.querySelector('#button-favorites').addEventListener('click', () => {
        this.#saveToCollection(this.#movie.id, COLLECTIONS.FAVORITE);
      });

      this.querySelector('#button-watchlist').addEventListener('click', () => {
        this.#saveToCollection(this.#movie.id, COLLECTIONS.WATCHLIST);
      });
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      showErrorModal('Movie not found');
    }
  }
}

customElements.define('movie-details', MovieDetailsPage);
