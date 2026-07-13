import { API } from '../services/API.js';
import { MovieItem } from '../components/MovieItem.js';
import '../components/AnimatedLoading.js';

export class HomePage extends HTMLElement {
  static #templatePromise;

  static #loadTemplate() {
    if (!this.#templatePromise) {
      this.#templatePromise = fetch('/scripts/screens/home-page.html')
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          return parser.parseFromString(html, 'text/html').querySelector('template');
        })
        .catch(error => {
          console.error('Failed to load template:', error);
          throw error;
        });
    }
    return this.#templatePromise;
  }

  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      const template = await HomePage.#loadTemplate();
      const content = template.content.cloneNode(true);
      this.appendChild(content);
      await this.render();
    } catch (error) {
      console.error('Error initializing HomePage:', error);
    }
  }

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
