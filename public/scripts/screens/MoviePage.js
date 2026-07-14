export class MoviePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Movie Page</h1>
    `;
  }
}

customElements.define('movie-page', MoviePage);
