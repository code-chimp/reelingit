import { TemplateElement } from '../base/TemplateElement.js';
import { API } from '../services/API.js';
import { MovieItem } from '../components/MovieItem.js';

/**
 * Home screen showing this week's top movies and a random selection.
 *
 * Extends TemplateElement to load its HTML template on connect, then fetches
 * movie data from the API and renders `movie-item` cards into two horizontal
 * lists. The element is intended to be created programmatically with no HTML
 * attributes.
 *
 * Use it like this:
 * ```js
 * import { HomePage } from './screens/HomePage.js';
 *
 * document.querySelector('main').appendChild(new HomePage());
 * ```
 *
 * @summary Home screen with top and random movie lists
 * @tag home-page
 * @tagname home-page
 */
export class HomePage extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/screens/home-page.html';

  #renderMoviesToList(movies, ul) {
    ul.innerHTML = '';
    movies.forEach(movie => {
      const li = document.createElement('li');
      li.appendChild(new MovieItem(movie));
      ul.appendChild(li);
    });
  }

  async render() {
    try {
      const topMovies = await API.getTopMovies();
      this.#renderMoviesToList(topMovies, this.querySelector('#top-10 ul'));

      const randomMovies = await API.getRandomMovies();
      this.#renderMoviesToList(randomMovies, this.querySelector('#random ul'));
    } catch (error) {
      console.error('Error rendering movies:', error);
    }
  }
}

customElements.define('home-page', HomePage);
