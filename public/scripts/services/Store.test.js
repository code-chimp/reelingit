import { STORAGE_KEYS } from '../constants.js';

// Store.js calls localStorage.getItem() at module-level. With ESM, static
// imports are evaluated before the jsdom environment injects globals, so
// localStorage is undefined when Store.js first loads. vi.hoisted runs its
// callback before any imports, letting us inject a fake localStorage first.
const fakeStorage = vi.hoisted(() => {
  let data = {};
  const storage = {
    getItem: key => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: key => {
      delete data[key];
    },
    clear: () => {
      data = {};
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  return storage;
});

import Store from './Store.js';

describe('services/Store', () => {
  beforeEach(() => {
    fakeStorage.clear();
    Store.jwt = null;
  });

  describe('loggedIn getter', () => {
    it('returns false when jwt is null', () => {
      expect(Store.loggedIn).toBe(false);
    });

    it('returns true when jwt is set to a non-empty string', () => {
      Store.jwt = 'token123';
      expect(Store.loggedIn).toBe(true);
    });

    it('returns false after jwt is cleared', () => {
      Store.jwt = 'token123';
      Store.jwt = null;
      expect(Store.loggedIn).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('writes jwt to localStorage when set', () => {
      Store.jwt = 'mytoken';
      expect(localStorage.getItem(STORAGE_KEYS.JWT)).toBe('mytoken');
    });

    it('removes jwt from localStorage when cleared', () => {
      Store.jwt = 'mytoken';
      Store.jwt = null;
      expect(localStorage.getItem(STORAGE_KEYS.JWT)).toBeNull();
    });
  });

  describe('module initialisation', () => {
    it('seeds jwt from localStorage when a token is present at startup', async () => {
      localStorage.setItem(STORAGE_KEYS.JWT, 'stored-token');
      vi.resetModules();
      const { default: FreshStore } = await import('./Store.js');
      expect(FreshStore.jwt).toBe('stored-token');
      expect(FreshStore.loggedIn).toBe(true);
    });

    it('leaves jwt as null when localStorage is empty at startup', async () => {
      vi.resetModules();
      const { default: FreshStore } = await import('./Store.js');
      expect(FreshStore.jwt).toBeNull();
      expect(FreshStore.loggedIn).toBe(false);
    });
  });
});
