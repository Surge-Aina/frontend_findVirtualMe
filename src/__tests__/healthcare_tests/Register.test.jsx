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
    register: jest.fn()
  }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUser: () => <span data-testid="icon-user">User</span>,
  FaEnvelope: () => <span data-testid="icon-envelope">Email</span>,
  FaLock: () => <span data-testid="icon-lock">Lock</span>,
  FaHospital: () => <span data-testid="icon-hospital">Hospital</span>,
  FaArrowLeft: () => <span data-testid="icon-arrow">Back</span>,
}));

const Register = require('../../pages/portfolios/healthcare/pages/auth/Register').default;
const { api } = require('../../pages/portfolios/healthcare/lib/api');

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Healthcare Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should render registration form elements', () => {
    renderRegister();
    
    expect(screen.getByPlaceholderText(/john/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/elite medical center/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/doctor@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('should render create your practice heading', () => {
    renderRegister();
    
    expect(screen.getByText(/create your practice/i)).toBeInTheDocument();
  });

  test('should render start building text', () => {
    renderRegister();
    
    expect(screen.getByText(/start building your healthcare website/i)).toBeInTheDocument();
  });

  test('should render First Name and Last Name labels', () => {
    renderRegister();
    
    expect(screen.getByText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
  });

  test('should render Practice Name label', () => {
    renderRegister();
    
    expect(screen.getByText(/Practice Name/i)).toBeInTheDocument();
  });

  test('should render Email Address label', () => {
    renderRegister();
    
    expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
  });

  test('should render Password and Confirm Password labels', () => {
    renderRegister();
    
    const passwordLabels = screen.getAllByText(/Password/i);
    expect(passwordLabels.length).toBeGreaterThanOrEqual(2);
  });

  test('should handle successful registration', async () => {
    const user = userEvent.setup();
    
    api.register.mockResolvedValue({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: {
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    // Get password inputs by their placeholder
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('test-token');
      expect(localStorage.getItem('practiceId')).toBe('practice_123');
      expect(mockNavigate).toHaveBeenCalledWith('/portfolios/healthcare/practice_123/admin/dashboard');
    }, { timeout: 5000 });
  });

  test('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'differentpassword');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    expect(api.register).not.toHaveBeenCalled();
  });

  test('should show error when password is too short', async () => {
    const user = userEvent.setup();
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], '12345');
    await user.type(passwordInputs[1], '12345');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    expect(api.register).not.toHaveBeenCalled();
  });

  test('should show error on registration failure', async () => {
    const user = userEvent.setup();
    
    api.register.mockRejectedValue(new Error('Email already registered'));
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should show loading state while creating account', async () => {
    const user = userEvent.setup();
    
    let resolveRegister;
    api.register.mockImplementation(() => new Promise(resolve => {
      resolveRegister = resolve;
    }));
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    
    resolveRegister({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: { email: 'test@test.com' }
    });
  });

  test('should have link to login page', () => {
    renderRegister();
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('should have back to home link', () => {
    renderRegister();
    
    expect(screen.getByText(/back to home/i)).toBeInTheDocument();
  });

  test('should store userData in localStorage on successful registration', async () => {
    const user = userEvent.setup();
    
    const mockUser = {
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    api.register.mockResolvedValue({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: mockUser
    });
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('userData')).toBe(JSON.stringify(mockUser));
    });
  });

  test('should display hospital icon', () => {
    renderRegister();
    
    const hospitalIcons = screen.getAllByTestId('icon-hospital');
    expect(hospitalIcons.length).toBeGreaterThan(0);
  });

  test('should call api.register with correct data', async () => {
    const user = userEvent.setup();
    
    api.register.mockResolvedValue({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: { email: 'test@test.com' }
    });
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        password: 'password123',
        practiceName: 'Test Clinic'
      });
    });
  });

  test('should render already have account text', () => {
    renderRegister();
    
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  test('should handle form submission with enter key', async () => {
    const user = userEvent.setup();
    
    api.register.mockResolvedValue({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: { email: 'test@test.com' }
    });
    
    renderRegister();
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123{enter}');
    
    await waitFor(() => {
      expect(api.register).toHaveBeenCalled();
    });
  });

  test('should show generic error message on unknown error', async () => {
    const user = userEvent.setup();
    
    api.register.mockRejectedValue(new Error());
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  test('should require all fields', () => {
    renderRegister();
    
    const firstNameInput = screen.getByPlaceholderText(/john/i);
    const lastNameInput = screen.getByPlaceholderText(/doe/i);
    const practiceNameInput = screen.getByPlaceholderText(/elite medical center/i);
    const emailInput = screen.getByPlaceholderText(/doctor@example.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    
    expect(firstNameInput).toBeRequired();
    expect(lastNameInput).toBeRequired();
    expect(practiceNameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInputs[0]).toBeRequired();
    expect(passwordInputs[1]).toBeRequired();
  });

  test('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    
    let resolveRegister;
    api.register.mockImplementation(() => new Promise(resolve => {
      resolveRegister = resolve;
    }));
    
    renderRegister();
    
    await user.type(screen.getByPlaceholderText(/john/i), 'John');
    await user.type(screen.getByPlaceholderText(/doe/i), 'Doe');
    await user.type(screen.getByPlaceholderText(/elite medical center/i), 'Test Clinic');
    await user.type(screen.getByPlaceholderText(/doctor@example.com/i), 'test@test.com');
    
    const passwordInputs = screen.getAllByPlaceholderText(/•/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    resolveRegister({
      success: true,
      token: 'test-token',
      practiceId: 'practice_123',
      user: { email: 'test@test.com' }
    });
  });
});