import { ROUTES } from '../constants.js';

// vi.mock factories are hoisted before class declarations, so stub components
// must be defined inside the factory. They are re-exported so the tests can
// use them in instanceof assertions.
vi.mock('./routes.js', () => {
  class StubHome extends HTMLElement {}
  class StubMovies extends HTMLElement {}
  class StubMovieDetails extends HTMLElement {}
  class StubProtected extends HTMLElement {}
  class StubLogin extends HTMLElement {}

  return {
    StubHome,
    StubMovies,
    StubMovieDetails,
    StubProtected,
    StubLogin,
    routes: [
      { path: '/', pageTitle: 'Home', component: StubHome, protected: false },
      { path: '/movies', pageTitle: 'Movies', component: StubMovies, protected: false },
      {
        path: /\/movies\/(\d+)/,
        pageTitle: 'Movie Details',
        component: StubMovieDetails,
        protected: false,
      },
      { path: '/account/login', pageTitle: 'Sign In', component: StubLogin, protected: false },
      {
        path: '/protected',
        pageTitle: 'Protected',
        component: StubProtected,
        protected: true,
      },
    ],
  };
});

const mockStore = vi.hoisted(() => ({ loggedIn: false }));
vi.mock('./Store.js', () => ({ default: mockStore }));

import { Router } from './Router.js';
import { StubHome, StubLogin, StubMovieDetails, StubMovies, StubProtected } from './routes.js';

// jsdom requires custom element classes to be in the registry before `new` is called.
customElements.define('stub-home', StubHome);
customElements.define('stub-movies', StubMovies);
customElements.define('stub-movie-details', StubMovieDetails);
customElements.define('stub-protected', StubProtected);
customElements.define('stub-login', StubLogin);

describe('services/Router', () => {
  let main;
  let pushStateSpy;

  beforeEach(() => {
    main = document.createElement('main');
    document.body.appendChild(main);
    pushStateSpy = vi.spyOn(history, 'pushState').mockImplementation(() => {});
    mockStore.loggedIn = false;
  });

  afterEach(() => {
    document.body.removeChild(main);
    vi.restoreAllMocks();
  });

  describe('string route matching', () => {
    it('mounts the matching component for an exact string route', () => {
      Router.go('/');
      expect(main.firstChild).toBeInstanceOf(StubHome);
    });

    it('sets document.title from the route pageTitle', () => {
      Router.go('/movies');
      expect(document.title).toBe('ReelingIt - Movies');
    });

    it('pushes the route onto history by default', () => {
      Router.go('/movies');
      expect(pushStateSpy).toHaveBeenCalledWith(null, null, '/movies');
    });

    it('does not push history when addToHistory is false', () => {
      Router.go('/movies', false);
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('RegExp route matching', () => {
    it('mounts the matching component for a RegExp route', () => {
      Router.go('/movies/42');
      expect(main.firstChild).toBeInstanceOf(StubMovieDetails);
    });

    it('exposes capture groups as params on the mounted element', () => {
      Router.go('/movies/42');
      expect(main.firstChild.params).toEqual(['42']);
    });

    it('exposes params for a different id', () => {
      Router.go('/movies/99');
      expect(main.firstChild.params).toEqual(['99']);
    });
  });

  describe('not-found fallback', () => {
    it('renders a "Page not found" heading for an unrecognised route', () => {
      Router.go('/does-not-exist');
      const el = main.firstChild;
      expect(el.tagName).toBe('H1');
      expect(el.textContent).toBe('Page not found');
    });

    it('sets document.title to the not-found title', () => {
      Router.go('/does-not-exist');
      expect(document.title).toBe('ReelingIt - Page not found');
    });
  });

  describe('protected route redirect', () => {
    it('redirects to login when the user is not logged in', () => {
      mockStore.loggedIn = false;
      Router.go('/protected');
      expect(main.firstChild).toBeInstanceOf(StubLogin);
    });

    it('mounts the protected component when the user is logged in', () => {
      mockStore.loggedIn = true;
      Router.go('/protected');
      expect(main.firstChild).toBeInstanceOf(StubProtected);
    });

    it('does not push the protected URL to history when redirecting', () => {
      mockStore.loggedIn = false;
      Router.go('/protected');
      // Only the login redirect should be pushed, not the protected URL first.
      const pushedPaths = pushStateSpy.mock.calls.map(([, , path]) => path);
      expect(pushedPaths).not.toContain('/protected');
      expect(pushedPaths).toContain(ROUTES.ACCOUNT_LOGIN);
    });
  });
});
