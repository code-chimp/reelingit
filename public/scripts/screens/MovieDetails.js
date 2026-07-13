import '../components/AnimatedLoading.js';

export class MovieDetails extends HTMLElement {
  static #templatePromise;

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

  async connectedCallback() {
    const template = await MovieDetails.#loadTemplate();
    const instance = template.content.cloneNode(true);
    this.attachShadow({ mode: 'open' }).appendChild(instance);
  }
}
