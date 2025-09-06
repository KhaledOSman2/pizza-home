/**
 * Utility for handling authentication token storage
 */

const TOKEN_KEY = 'authToken';

export const authStorage = {
  // Store token
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.warn('Failed to store auth token:', error);
    }
  },

  // Get token
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to retrieve auth token:', error);
      return null;
    }
  },

  // Remove token
  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  },

  // Check if token exists
  hasToken(): boolean {
    return !!this.getToken();
  }
};
