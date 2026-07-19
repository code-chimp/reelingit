import { API } from '../../services/API.js';
import { CollectionPage } from './CollectionPage.js';

/**
 * Screen listing the current user's watchlisted movies.
 *
 * A protected route (per `routes.js`); `Router` only mounts this after
 * confirming the user is logged in.
 *
 * @summary Watchlist screen
 * @tag watchlist-page
 * @tagname watchlist-page
 */
export class WatchlistPage extends CollectionPage {
  constructor() {
    super(API.getWatchlist, 'Movies in Watchlist');
  }
}

customElements.define('watchlist-page', WatchlistPage);
