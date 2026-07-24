import { STORAGE_KEYS } from '../constants.js';

/**
 * Client-side auth session store, backed by `localStorage` so the JWT
 * survives page reloads.
 *
 * `jwt` is seeded from `localStorage` on module load, and any assignment to
 * `Store.jwt` (e.g. after a successful `API.register`/`API.authenticate`
 * call) is mirrored back to `localStorage` via the wrapping `Proxy` below,
 * so callers can treat `Store.jwt = token` as the single write path.
 *
 * Use it like this:
 * ```js
 * import Store from './services/Store.js';
 *
 * if (Store.loggedIn) { ... }
 * Store.jwt = response.jwt;
 * ```
 *
 * @summary Auth session store (JWT), persisted to localStorage
 */
const Store = {
  /** @type {string|null} Current session JWT, or `null` if logged out. */
  jwt: null,

  /** @returns {boolean} Whether the stored JWT value is not `null`. */
  get loggedIn() {
    return Boolean(this.jwt);
  },
};

if (localStorage.getItem(STORAGE_KEYS.JWT)) {
  Store.jwt = localStorage.getItem(STORAGE_KEYS.JWT);
}

// Wraps Store so that `set` also persists to localStorage, keeping the two
// in sync without callers having to remember to do it themselves.
const proxiedStore = new Proxy(Store, {
  set(target, prop, value) {
    if (prop === 'jwt') {
      if (!value) {
        localStorage.removeItem(STORAGE_KEYS.JWT);
      } else {
        localStorage.setItem(STORAGE_KEYS.JWT, value);
      }
    }
    target[prop] = value;
    return true;
  },
});

export default proxiedStore;
