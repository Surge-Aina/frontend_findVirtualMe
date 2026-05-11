/**
 * Shared AuthContext mock for smoke / a11y tests so Navbar and pages receive
 * the same shape as the real AuthProvider.
 */
export function createSmokeAuthContext(overrides = {}) {
  return {
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    setUser: jest.fn(),
    setUserAfterLogin: jest.fn(),
    refreshUser: jest.fn(),
    pendingFile: null,
    setPendingFile: jest.fn(),
    contextLoggedIn: false,
    contextLogin: jest.fn(),
    contextLogout: jest.fn(),
    ...overrides,
  };
}
