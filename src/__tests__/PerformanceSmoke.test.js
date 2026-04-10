import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/shared/context/AuthContext';

// Mock navigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    img: (props) => <img {...props} />,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({ start: jest.fn() }),
  useInView: () => true,
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import components after mocks
import Dashboard from '../components/Dashboard';
import ExamplePortfolios from '../components/examplePortfolios';
import Navbar from '@/shared/components/Navbar';
import Auth from '../pages/login/Auth';
import SignUp from '../pages/login/SignUp';

describe('Performance Smoke Tests', () => {
  let consoleSpy;
  let queryClient;

  const mockAuthContext = {
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    contextLoggedIn: false,
    contextLogin: jest.fn(),
    contextLogout: jest.fn(),
    setUser: jest.fn(),
    refreshUser: jest.fn(),
  };

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
    queryClient.clear();
  });

  const renderWithProviders = (Component, props = {}) => {
    const start = performance.now();
    const result = render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <MemoryRouter>
            <Component {...props} />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
    const end = performance.now();
    return { ...result, renderTime: end - start };
  };

  // ===================== DASHBOARD =====================
  describe('Dashboard Page', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(Dashboard)).not.toThrow();
    });

    it('renders within acceptable time (<1000ms)', () => {
      const { renderTime } = renderWithProviders(Dashboard);
      expect(renderTime).toBeLessThan(1000);
    });

    it('renders without critical errors', () => {
      renderWithProviders(Dashboard);
      const criticalErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('Cannot read') ||
        call[0]?.toString().includes('fatal')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  // ===================== EXAMPLE PORTFOLIOS =====================
  describe('ExamplePortfolios Page', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(ExamplePortfolios)).not.toThrow();
    });

    it('renders within acceptable time (<1000ms)', () => {
      const { renderTime } = renderWithProviders(ExamplePortfolios);
      expect(renderTime).toBeLessThan(1000);
    });

    it('renders without critical errors', () => {
      renderWithProviders(ExamplePortfolios);
      const criticalErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('Cannot read') ||
        call[0]?.toString().includes('fatal')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  // ===================== NAVBAR =====================
  describe('Navbar Component', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(Navbar)).not.toThrow();
    });

    it('renders within acceptable time (<1000ms)', () => {
      const { renderTime } = renderWithProviders(Navbar);
      expect(renderTime).toBeLessThan(1000);
    });

    it('renders without critical errors', () => {
      renderWithProviders(Navbar);
      const criticalErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('Cannot read') ||
        call[0]?.toString().includes('fatal')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  // ===================== AUTH =====================
  describe('Auth Component', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(Auth, { onClose: jest.fn() })).not.toThrow();
    });

    it('renders within acceptable time (<1000ms)', () => {
      const { renderTime } = renderWithProviders(Auth, { onClose: jest.fn() });
      expect(renderTime).toBeLessThan(1000);
    });

    it('renders without critical errors', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      const criticalErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('Cannot read') ||
        call[0]?.toString().includes('fatal')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  // ===================== SIGNUP =====================
  describe('SignUp Component', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(SignUp)).not.toThrow();
    });

    it('renders within acceptable time (<1000ms)', () => {
      const { renderTime } = renderWithProviders(SignUp);
      expect(renderTime).toBeLessThan(1000);
    });

    it('renders without critical errors', () => {
      renderWithProviders(SignUp);
      const criticalErrors = consoleSpy.mock.calls.filter(call =>
        call[0]?.toString().includes('Cannot read') ||
        call[0]?.toString().includes('fatal')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });
});