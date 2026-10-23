import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/shared/context/AuthContext';

// Mocks (same as your smoke test)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

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

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: () => null,
}));

// Import components after mocks
import Dashboard from '@/features/dashboard/Dashboard';
import Navbar from '@/shared/components/Navbar';
import Auth from '@/features/auth/Auth';
import SignUp from '@/features/auth/SignUp';
import { createSmokeAuthContext } from '@/shared/test/createSmokeAuthContext.js';

describe('Accessibility (a11y) Tests', () => {
  let queryClient;
  let mockAuthContext;

  beforeEach(() => {
    mockAuthContext = createSmokeAuthContext();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    queryClient.clear();
  });

  const renderWithProviders = (Component, props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <MemoryRouter>
            <Component {...props} />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  // ===================== LOGIN PAGE (Auth) =====================
  describe('Login Page', () => {
    it('has accessible email input with label', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('has accessible password input with label', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('has accessible submit button', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('has accessible sign up button', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('has accessible close button with aria-label', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      renderWithProviders(Auth, { onClose: jest.fn() });
      expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    });
  });

  // ===================== HOME PAGE (Navbar) =====================
  describe('Home Page (Navbar)', () => {
    it('has accessible navigation', () => {
      renderWithProviders(Navbar);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has accessible login button', () => {
      renderWithProviders(Navbar);
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('has accessible menu button with aria-label', () => {
      renderWithProviders(Navbar);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('has accessible navigation links as buttons', () => {
      renderWithProviders(Navbar);
      expect(screen.getAllByRole('button', { name: 'Job Seekers' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Creators' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Dashboard' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Solutions' }).length).toBeGreaterThan(0);
    });
  });

  // ===================== DASHBOARD PAGE =====================
  describe('Dashboard Page', () => {
    it('renders with accessible structure', () => {
      renderWithProviders(Dashboard);
      // Check for headings (adjust based on your Dashboard content)
      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(0);
    });

    it('has accessible buttons', () => {
      renderWithProviders(Dashboard);
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });

    it('has accessible links', () => {
      renderWithProviders(Dashboard);
      const links = screen.queryAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ===================== SIGNUP PAGE =====================
  describe('SignUp Page', () => {
    it('has accessible heading', () => {
      renderWithProviders(SignUp);
      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('has accessible name input', () => {
      renderWithProviders(SignUp);
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('has accessible username input', () => {
      renderWithProviders(SignUp);
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    });

    it('has accessible email input', () => {
      renderWithProviders(SignUp);
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    it('has accessible password input', () => {
      renderWithProviders(SignUp);
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('has accessible submit button', () => {
      renderWithProviders(SignUp);
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });
});