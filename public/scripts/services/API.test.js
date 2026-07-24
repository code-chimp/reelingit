import { CUSTOM_EVENTS, ROUTES } from '../constants.js';

const mockStore = vi.hoisted(() => ({ jwt: null }));
vi.mock('./Store.js', () => ({ default: mockStore }));

import { API } from './API.js';

// Minimal Response-like object for stubbing globalThis.fetch
function makeResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  };
}

describe('services/API', () => {
  let fetchSpy;

  beforeEach(() => {
    mockStore.jwt = null;
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('_handleResponse', () => {
    it('returns parsed JSON for a 2xx response', async () => {
      const data = { id: 1, title: 'Batman' };
      const result = await API._handleResponse(makeResponse(200, data));
      expect(result).toEqual(data);
    });

    it('throws with the server error message for a non-ok response', async () => {
      await expect(
        API._handleResponse(makeResponse(404, { error: 'Movie not found' })),
      ).rejects.toThrow('Movie not found');
    });

    it('throws with a generic message when the body has no error field', async () => {
      await expect(API._handleResponse(makeResponse(500, {}))).rejects.toThrow(
        'Request failed',
      );
    });

    it('attaches the HTTP status to the thrown error', async () => {
      let thrown;
      try {
        await API._handleResponse(makeResponse(422, { error: 'bad' }));
      } catch (e) {
        thrown = e;
      }
      expect(thrown.status).toBe(422);
    });

    it('clears Store.jwt on a 401', async () => {
      mockStore.jwt = 'some-token';
      try {
        await API._handleResponse(makeResponse(401, {}));
        // eslint-disable-next-line no-empty
      } catch {}
      expect(mockStore.jwt).toBeNull();
    });

    it('fires a navigate event to login on a 401', async () => {
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      try {
        await API._handleResponse(makeResponse(401, {}));
        // eslint-disable-next-line no-empty
      } catch {}
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].detail.route).toBe(ROUTES.ACCOUNT_LOGIN);
    });
  });

  describe('fetch', () => {
    it('requests the correct URL with no query args', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, []));
      await API.fetch('movies/top');
      expect(fetchSpy).toHaveBeenCalledWith('/api/movies/top', expect.any(Object));
    });

    it('appends args as a query string', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, []));
      await API.fetch('movies/search', { q: 'batman', order: 'asc' });
      const url = fetchSpy.mock.calls[0][0];
      expect(url).toContain('q=batman');
      expect(url).toContain('order=asc');
    });

    it('encodes special characters in query args', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, []));
      await API.fetch('movies/search', { q: 'AT&T' });
      const url = fetchSpy.mock.calls[0][0];
      expect(url).toContain('q=AT%26T');
    });

    it('includes the Authorization header when jwt is set', async () => {
      mockStore.jwt = 'mytoken';
      fetchSpy.mockResolvedValue(makeResponse(200, {}));
      await API.fetch('movies/top');
      const { headers } = fetchSpy.mock.calls[0][1];
      expect(headers.Authorization).toBe('Bearer mytoken');
    });

    it('omits the Authorization header when jwt is null', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, {}));
      await API.fetch('movies/top');
      const { headers } = fetchSpy.mock.calls[0][1];
      expect(headers.Authorization).toBeUndefined();
    });

    it('rethrows errors from _handleResponse', async () => {
      fetchSpy.mockResolvedValue(makeResponse(404, { error: 'Not found' }));
      await expect(API.fetch('movies/99')).rejects.toThrow('Not found');
    });
  });

  describe('post', () => {
    it('sends a POST request with a JSON body', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, { success: true }));
      await API.post('account/register', { email: 'a@b.com' });
      const [, options] = fetchSpy.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com' });
    });

    it('sets Content-Type to application/json', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, {}));
      await API.post('account/register', {});
      const { headers } = fetchSpy.mock.calls[0][1];
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('includes the Authorization header when jwt is set', async () => {
      mockStore.jwt = 'mytoken';
      fetchSpy.mockResolvedValue(makeResponse(200, {}));
      await API.post('account/save-to-collection', {});
      const { headers } = fetchSpy.mock.calls[0][1];
      expect(headers.Authorization).toBe('Bearer mytoken');
    });

    it('omits the Authorization header when jwt is null', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, {}));
      await API.post('account/register', {});
      const { headers } = fetchSpy.mock.calls[0][1];
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('endpoint methods', () => {
    beforeEach(() => {
      fetchSpy.mockResolvedValue(makeResponse(200, []));
    });

    it('getTopMovies calls /api/movies/top', async () => {
      await API.getTopMovies();
      expect(fetchSpy).toHaveBeenCalledWith('/api/movies/top', expect.any(Object));
    });

    it('getMovieById calls /api/movies/{id}', async () => {
      await API.getMovieById(42);
      expect(fetchSpy).toHaveBeenCalledWith('/api/movies/42', expect.any(Object));
    });

    it('searchMovies passes q, order, and genre as query params', async () => {
      await API.searchMovies('batman', 'asc', 'action');
      const url = fetchSpy.mock.calls[0][0];
      expect(url).toContain('q=batman');
      expect(url).toContain('order=asc');
      expect(url).toContain('genre=action');
    });

    it('register posts to /api/account/register with name, email, password', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, { jwt: 'tok' }));
      await API.register('Alice', 'a@b.com', 'password');
      expect(fetchSpy).toHaveBeenCalledWith('/api/account/register', expect.any(Object));
      expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({
        name: 'Alice',
        email: 'a@b.com',
        password: 'password',
      });
    });

    it('saveToCollection posts to /api/account/save-to-collection with movie_id and collection', async () => {
      fetchSpy.mockResolvedValue(makeResponse(200, { success: true }));
      await API.saveToCollection(14, 'favorite');
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/account/save-to-collection',
        expect.any(Object),
      );
      expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toEqual({
        movie_id: 14,
        collection: 'favorite',
      });
    });
  });
});
