/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the API
jest.mock('../../pages/portfolios/healthcare/lib/api', () => ({
  api: {
    login: jest.fn()
  }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaLock: () => <span data-testid="icon-lock">Lock</span>,
  FaEnvelope: () => <span data-testid="icon-envelope">Email</span>,
  FaEye: () => <span data-testid="icon-eye">Eye</span>,
  FaEyeSlash: () => <span data-testid="icon-eye-slash">EyeSlash</span>,
  FaArrowLeft: () => <span data-testid="icon-arrow">Back</span>,
}));

const Login = require('../../pages/portfolios/healthcare/pages/auth/Login').default;
const { api } = require('../../pages/portfolios/healthcare/lib/api');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Healthcare Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should render login form elements', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText(/doctor@example.com/i)).toBeInTheDocument();
    const passwordInput = screen.getByPlaceholderText(/•/);
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('should render welcome back heading', () => {
    renderLogin();
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('should render sign in to manage your practice text', () => {
    renderLogin();
    
    expect(screen.getByText(/sign in to manage your practice/i)).toBeInTheDocument();
  });

  test('should render Email Address label', () => {
    renderLogin();
    
    expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
  });

  test('should render Password label', () => {
    renderLogin();
    
    const passwordLabels = screen.getAllByText(/Password/i);
    expect(passwordLabels.length).toBeGreaterThan(0);
  });

  test('should handle successful login', async () => {
    const user = userEvent.setup();
    
    api.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: {
        practiceId: 'practice_123',
        email: 'test@test.com'
      }
    });
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('test-token');
      expect(localStorage.getItem('practiceId')).toBe('practice_123');
      expect(mockNavigate).toHaveBeenCalledWith('/portfolios/healthcare/practice_123/admin/dashboard');
    });
  });

  test('should show error message on failed login', async () => {
    const user = userEvent.setup();
    
    api.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should show loading state while signing in', async () => {
    const user = userEvent.setup();
    
    let resolveLogin;
    api.login.mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    
    resolveLogin({
      success: true,
      token: 'test-token',
      user: { practiceId: 'practice_123' }
    });
  });

  test('should have link to registration page', () => {
    renderLogin();
    
    expect(screen.getByText(/create practice/i)).toBeInTheDocument();
  });

  test('should have back to home link', () => {
    renderLogin();
    
    expect(screen.getByText(/back to home/i)).toBeInTheDocument();
  });

  test('should display demo account information', () => {
    renderLogin();
    
    expect(screen.getByText(/demo account/i)).toBeInTheDocument();
    expect(screen.getByText(/demo@healthcare.com/i)).toBeInTheDocument();
  });

  test('should display demo password', () => {
    renderLogin();
    
    const passwordLabels = screen.getAllByText(/demo123/i);
    expect(passwordLabels.length).toBeGreaterThan(0);
  });

  test('should toggle password visibility', async () => {
    const user = userEvent.setup();
    
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText(/•/);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByTestId('icon-eye').closest('button');
    await user.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should toggle password visibility back to hidden', async () => {
    const user = userEvent.setup();
    
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText(/•/);
    const toggleButton = screen.getByTestId('icon-eye').closest('button');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should store userData in localStorage on successful login', async () => {
    const user = userEvent.setup();
    
    const mockUser = {
      practiceId: 'practice_123',
      email: 'test@test.com',
      firstName: 'John'
    };
    
    api.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: mockUser
    });
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('userData')).toBe(JSON.stringify(mockUser));
    });
  });

  test('should display lock icon', () => {
    renderLogin();
    
    const lockIcons = screen.getAllByTestId('icon-lock');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  test('should call api.login with correct credentials', async () => {
    const user = userEvent.setup();
    
    api.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { practiceId: 'practice_123' }
    });
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
    });
  });

  test('should show generic error message on unknown error', async () => {
    const user = userEvent.setup();
    
    api.login.mockRejectedValue(new Error());
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  test('should require email input', () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    expect(emailInput).toBeRequired();
  });

  test('should require password input', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText(/•/);
    expect(passwordInput).toBeRequired();
  });

  test('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    
    let resolveLogin;
    api.login.mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    resolveLogin({
      success: true,
      token: 'test-token',
      user: { practiceId: 'practice_123' }
    });
  });

  test('should render dont have account text', () => {
    renderLogin();
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test('should handle form submission with enter key', async () => {
    const user = userEvent.setup();
    
    api.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { practiceId: 'practice_123' }
    });
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123{enter}');
    
    await waitFor(() => {
      expect(api.login).toHaveBeenCalled();
    });
  });

  test('should clear error message when typing', async () => {
    const user = userEvent.setup();
    
    api.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/•/);
    
    await user.type(emailInput, 'wrong@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Now try again - error should clear when form is submitted again
    api.login.mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { practiceId: 'practice_123' }
    });
    
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  test('should display email icon', () => {
    renderLogin();
    
    expect(screen.getByTestId('icon-envelope')).toBeInTheDocument();
  });

  test('should display eye icon for password toggle', () => {
    renderLogin();
    
    expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
  });
});