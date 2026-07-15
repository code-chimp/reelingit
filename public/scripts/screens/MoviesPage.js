/**
 * Placeholder screen used by `routes.js` for movie search/listing and
 * several not-yet-built account routes (register, login, account,
 * favorites, watchlist).
 *
 * @summary Placeholder screen pending its real implementation
 * @tag movie-page
 * @tagname movie-page
 */
export class MoviesPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Movie Page</h1>
    `;
  }
}

customElements.define('movie-page', MoviesPage);
