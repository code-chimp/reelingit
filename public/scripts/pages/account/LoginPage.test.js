const mockAPI = vi.hoisted(() => ({ authenticate: vi.fn() }));
vi.mock('../../services/API.js', () => ({ API: mockAPI }));

const mockStore = vi.hoisted(() => ({ jwt: null }));
vi.mock('../../services/Store.js', () => ({ default: mockStore }));

const mockShowErrorModal = vi.hoisted(() => vi.fn());
vi.mock('../../services/ErrorModal.js', () => ({ showErrorModal: mockShowErrorModal }));

import { CUSTOM_EVENTS, ROUTES } from '../../constants.js';
import { LoginPage } from './LoginPage.js';

function makeTemplate() {
  return new DOMParser()
    .parseFromString(
      '<template><form><input name="email"><input name="password" type="password"></form></template>',
      'text/html',
    )
    .querySelector('template');
}

// Fill the form inputs and fire a submit event, then flush the async handler.
async function submitForm(page, email, password) {
  page.querySelector('[name="email"]').value = email;
  page.querySelector('[name="password"]').value = password;
  page
    .querySelector('form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve));
}

describe('LoginPage', () => {
  let page;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(LoginPage, '_loadTemplate').mockResolvedValue(makeTemplate());
    page = new LoginPage();
    document.body.appendChild(page);
    await new Promise(resolve => setTimeout(resolve));
  });

  afterEach(() => {
    document.body.removeChild(page);
    mockStore.jwt = null;
    vi.restoreAllMocks();
  });

  describe('client-side validation', () => {
    it('shows an error when email is too short', async () => {
      await submitForm(page, 'a', 'validpassword');
      expect(mockShowErrorModal).toHaveBeenCalledWith('Please enter your email', false);
    });

    it('shows an error when password is too short', async () => {
      await submitForm(page, 'user@example.com', 'short');
      expect(mockShowErrorModal).toHaveBeenCalledWith(
        'Password must be at least 8 characters long',
        false,
      );
    });

    it('combines both errors when email and password are invalid', async () => {
      await submitForm(page, 'a', 'short');
      expect(mockShowErrorModal).toHaveBeenCalledWith(
        'Please enter your email\nPassword must be at least 8 characters long',
        false,
      );
    });

    it('does not call API.authenticate when validation fails', async () => {
      await submitForm(page, 'a', 'short');
      expect(mockAPI.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('successful login', () => {
    beforeEach(() => {
      mockAPI.authenticate.mockResolvedValue({ jwt: 'test-token' });
    });

    it('calls API.authenticate with the submitted email and password', async () => {
      await submitForm(page, 'user@example.com', 'validpassword');
      expect(mockAPI.authenticate).toHaveBeenCalledWith('user@example.com', 'validpassword');
    });

    it('stores the JWT in Store', async () => {
      await submitForm(page, 'user@example.com', 'validpassword');
      expect(mockStore.jwt).toBe('test-token');
    });

    it('navigates to /account on success', async () => {
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      await submitForm(page, 'user@example.com', 'validpassword');
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].detail.route).toBe(ROUTES.ACCOUNT);
    });

    it('does not show an error modal on success', async () => {
      await submitForm(page, 'user@example.com', 'validpassword');
      expect(mockShowErrorModal).not.toHaveBeenCalled();
    });
  });

  describe('API failure', () => {
    it('shows the server error message in the error modal', async () => {
      mockAPI.authenticate.mockRejectedValue(new Error('Invalid credentials'));
      await submitForm(page, 'user@example.com', 'validpassword');
      expect(mockShowErrorModal).toHaveBeenCalledWith('Invalid credentials', false);
    });

    it('does not navigate on API failure', async () => {
      mockAPI.authenticate.mockRejectedValue(new Error('Invalid credentials'));
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      await submitForm(page, 'user@example.com', 'validpassword');
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
