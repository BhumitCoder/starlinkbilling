// Simple client-side authentication gate for the billing app.
// NOTE: These credentials live in the frontend bundle, so this is a basic
// access gate, not real security. For strong protection, move auth to a
// backend / Firebase Authentication.

const AUTH_USERNAME = 'starlink';
const AUTH_PASSWORD = 'jewels@1';
const AUTH_KEY = 'starlink_auth';

export const login = (username: string, password: string): boolean => {
  if (username.trim() === AUTH_USERNAME && password === AUTH_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
