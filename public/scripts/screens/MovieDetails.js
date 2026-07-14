import { TemplateElement } from '../base/TemplateElement.js';
import { API } from '../services/API.js';
import '../components/YouTubeEmbed.js';

export class MovieDetails extends TemplateElement {
  static TEMPLATE_PATH = '/scripts/screens/movie-details.html';

  #movie;

  connectedCallback() {
    this.#movie = { id: 14 };
    super.connectedCallback();
  }

  async render() {
    try {
      this.#movie = await API.getMovieById(this.#movie.id);

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
      // TODO: Implement Alerts
      alert('yeah, no brah');
    }
  }
}

customElements.define('movie-details', MovieDetails);
