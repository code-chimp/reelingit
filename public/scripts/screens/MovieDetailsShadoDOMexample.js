import { API } from '../services/API.js';
import '../components/AnimatedLoading.js';
import '../components/YouTubeEmbed.js';

export class MovieDetails extends HTMLElement {
  static #templatePromise;

  #movie;
  #els;

  static #loadTemplate() {
    if (!this.#templatePromise) {
      this.#templatePromise = fetch('/scripts/screens/movie-details.html')
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

  connectedCallback() {
    this.#movie = { id: 14 };
    this.#initialize();
  }

  async #initialize() {
    try {
      const template = await MovieDetails.#loadTemplate();
      const instance = template.content.cloneNode(true);
      this.attachShadow({ mode: 'open' }).appendChild(instance);

      const root = this.shadowRoot;
      this.#els = {
        title: root.querySelector('h2'),
        tagline: root.querySelector('h3'),
        poster: root.querySelector('img'),
        overview: root.querySelector('#overview'),
        trailer: root.querySelector('#trailer'),
        genres: root.querySelector('#genres'),
        cast: root.querySelector('#cast'),
        metadata: root.querySelector('#metadata'),
      };

      await this.#render();
    } catch (error) {
      console.error('Error initializing MovieDetails:', error);
      alert('Failed to load movie details');
    }
  }

  async #render() {
    try {
      this.#movie = await API.getMovieById(this.#movie.id);

      this.#els.title.textContent = this.#movie.title;
      this.#els.tagline.textContent = this.#movie.tagline;
      this.#els.poster.src = this.#movie.poster_url;
      this.#els.trailer.dataset.url = this.#movie.trailer_url;
      this.#els.overview.textContent = this.#movie.overview;
      this.#els.genres.textContent = this.#movie.genres.map(genre => genre.name).join(', ');
      this.#els.cast.innerHTML = this.#movie.casting
        .map(actor => `<li>${actor.first_name} ${actor.last_name}</li>`)
        .join('');
      // this.#els.metadata.textContent = `${this.#movie.runtime} minutes, ${this.#movie.release_date}`;
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      // TODO: Implement Alerts
      alert('yeah, no brah');
    }
  }
}

customElements.define('movie-details', MovieDetails);
