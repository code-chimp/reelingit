import { API } from '../../services/API.js';
import { CollectionPage } from './CollectionPage.js';

/**
 * Screen listing the current user's favorited movies.
 *
 * A protected route (per `routes.js`); `Router` only mounts this after
 * confirming the user is logged in.
 *
 * @summary Favorited-movies screen
 * @tag favorites-page
 * @tagname favorites-page
 */
export class FavoritesPage extends CollectionPage {
  constructor() {
    super(API.getFavorites, 'Favorite Movies');
  }
}

customElements.define('favorites-page', FavoritesPage);
