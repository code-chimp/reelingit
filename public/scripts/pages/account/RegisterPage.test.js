const mockAPI = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock('../../services/API.js', () => ({ API: mockAPI }));

const mockStore = vi.hoisted(() => ({ jwt: null }));
vi.mock('../../services/Store.js', () => ({ default: mockStore }));

const mockShowErrorModal = vi.hoisted(() => vi.fn());
vi.mock('../../services/ErrorModal.js', () => ({ showErrorModal: mockShowErrorModal }));

import { CUSTOM_EVENTS, ROUTES } from '../../constants.js';
import { RegisterPage } from './RegisterPage.js';

function makeTemplate() {
  return new DOMParser()
    .parseFromString(
      `<template>
        <form>
          <input name="name">
          <input name="email">
          <input name="password" type="password">
          <input name="passwordConfirm" type="password">
        </form>
      </template>`,
      'text/html',
    )
    .querySelector('template');
}

async function submitForm(page, { name, email, password, passwordConfirm }) {
  page.querySelector('[name="name"]').value = name;
  page.querySelector('[name="email"]').value = email;
  page.querySelector('[name="password"]').value = password;
  page.querySelector('[name="passwordConfirm"]').value = passwordConfirm;
  page
    .querySelector('form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve));
}

const VALID = {
  name: 'Alice',
  email: 'user@example.com',
  password: 'validpassword',
  passwordConfirm: 'validpassword',
};

describe('RegisterPage', () => {
  let page;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(RegisterPage, '_loadTemplate').mockResolvedValue(makeTemplate());
    page = new RegisterPage();
    document.body.appendChild(page);
    await new Promise(resolve => setTimeout(resolve));
  });

  afterEach(() => {
    document.body.removeChild(page);
    mockStore.jwt = null;
    vi.restoreAllMocks();
  });

  describe('client-side validation', () => {
    it('shows an error when name is too short', async () => {
      await submitForm(page, { ...VALID, name: 'Jo' });
      expect(mockShowErrorModal).toHaveBeenCalledWith(
        'Name must be at least 4 characters long',
        false,
      );
    });

    it('shows an error when email is too short', async () => {
      await submitForm(page, { ...VALID, email: 'a' });
      expect(mockShowErrorModal).toHaveBeenCalledWith('Please enter your email', false);
    });

    it('shows an error when password is too short', async () => {
      await submitForm(page, { ...VALID, password: 'short', passwordConfirm: 'short' });
      expect(mockShowErrorModal).toHaveBeenCalledWith(
        'Password must be at least 8 characters long',
        false,
      );
    });

    it('shows an error when passwords do not match', async () => {
      await submitForm(page, { ...VALID, passwordConfirm: 'different' });
      expect(mockShowErrorModal).toHaveBeenCalledWith('Passwords do not match', false);
    });

    it('combines all errors when all fields are invalid', async () => {
      await submitForm(page, {
        name: 'Jo',
        email: 'a',
        password: 'short',
        passwordConfirm: 'different',
      });
      expect(mockShowErrorModal).toHaveBeenCalledWith(
        [
          'Name must be at least 4 characters long',
          'Please enter your email',
          'Password must be at least 8 characters long',
          'Passwords do not match',
        ].join('\n'),
        false,
      );
    });

    it('does not call API.register when validation fails', async () => {
      await submitForm(page, { ...VALID, name: 'Jo' });
      expect(mockAPI.register).not.toHaveBeenCalled();
    });
  });

  describe('successful registration', () => {
    beforeEach(() => {
      mockAPI.register.mockResolvedValue({ jwt: 'new-token' });
    });

    it('calls API.register with name, email, and password', async () => {
      await submitForm(page, VALID);
      expect(mockAPI.register).toHaveBeenCalledWith(
        'Alice',
        'user@example.com',
        'validpassword',
      );
    });

    it('stores the JWT in Store', async () => {
      await submitForm(page, VALID);
      expect(mockStore.jwt).toBe('new-token');
    });

    it('navigates to /account on success', async () => {
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      await submitForm(page, VALID);
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].detail.route).toBe(ROUTES.ACCOUNT);
    });

    it('does not show an error modal on success', async () => {
      await submitForm(page, VALID);
      expect(mockShowErrorModal).not.toHaveBeenCalled();
    });
  });

  describe('API failure', () => {
    it('shows the server error message in the error modal', async () => {
      mockAPI.register.mockRejectedValue(new Error('Email already in use'));
      await submitForm(page, VALID);
      expect(mockShowErrorModal).toHaveBeenCalledWith('Email already in use', false);
    });

    it('does not navigate on API failure', async () => {
      mockAPI.register.mockRejectedValue(new Error('Email already in use'));
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      await submitForm(page, VALID);
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
