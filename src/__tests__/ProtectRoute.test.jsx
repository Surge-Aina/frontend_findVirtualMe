import React, { useContext } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminRoute from '../components/AdminRoute';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, AuthProvider } from '@/shared/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock Navigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>,
}));

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithAuth = (user, tokenValue = null) => {
    if (tokenValue) localStorage.setItem('token', tokenValue);
    
    return render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <AdminRoute>
            <div data-testid="admin-content">Admin Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('shows loading when token exists but user is null', () => {
    renderWithAuth(null, 'valid-token');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to home when no token (guest)', () => {
    renderWithAuth(null, null);
    expect(screen.getByText('Redirecting to /')).toBeInTheDocument();
  });

  it('renders children when user is admin', () => {
    renderWithAuth({ role: 'admin' }, 'valid-token');
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects when user is not admin', () => {
    renderWithAuth({ role: 'user' }, 'valid-token');
    expect(screen.getByText('Redirecting to /')).toBeInTheDocument();
  });
});


jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('axios');

const mockQueryClientClear = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockQueryClientClear,
  }),
}));



const TestConsumer = () => {
  const {
    user,
    setUser,
    token,
    login,
    logout,
    refreshUser,
    pendingFile,
    setPendingFile,
    contextLoggedIn,
    contextLogin,
    contextLogout,
  } = useContext(AuthContext);

  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'no user'}</span>
      <span data-testid="token">{token || 'no token'}</span>
      <span data-testid="contextLoggedIn">{contextLoggedIn ? 'true' : 'false'}</span>
      <span data-testid="pendingFile">{pendingFile ? pendingFile.name : 'no file'}</span>
      
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshUser}>Refresh</button>
      <button onClick={contextLogin}>ContextLogin</button>
      <button onClick={contextLogout}>ContextLogout</button>
      <button onClick={() => setUser({ name: 'Test' })}>SetUser</button>
      <button onClick={() => setPendingFile({ name: 'test.pdf' })}>SetFile</button>
    </div>
  );
};

// ============================================
// TESTS
// ============================================

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    axios.get.mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@test.com' },
        portfolioIds: ['p1', 'p2'],
      },
    });

    axios.post.mockResolvedValue({
      data: {
        user: { _id: '1', email: 'test@test.com' },
        token: 'new-token',
        portfolioIds: ['p1', 'p2'],
      },
    });

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  // Basic rendering
  it('renders children', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <div>Child</div>
        </AuthProvider>
      );
    });
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('provides context values', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });

  // Initial state
  it('initializes with no token', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('token').textContent).toBe('no token');
    expect(screen.getByTestId('contextLoggedIn').textContent).toBe('false');
  });

  it('initializes with token from localStorage', async () => {
    localStorage.setItem('token', 'existing-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('token').textContent).toBe('existing-token');
    expect(screen.getByTestId('contextLoggedIn').textContent).toBe('true');
  });

  // Fetch user on mount with token
  it('fetches user when token exists', async () => {
    localStorage.setItem('token', 'existing-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  it('sets user from fetch response', async () => {
    localStorage.setItem('token', 'existing-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('test@test.com');
    });
  });

  it('stores portfolioIds from fetch', async () => {
    localStorage.setItem('token', 'existing-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => {
      expect(localStorage.getItem('userPortfolios')).toBe(JSON.stringify(['p1', 'p2']));
    });
  });

  it('handles fetch user without portfolioIds', async () => {
    localStorage.setItem('token', 'existing-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: '1' } },
    });
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('id');
    });
  });

  it('handles fetch user error', async () => {
    localStorage.setItem('token', 'existing-token');
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('no token');
      expect(screen.getByTestId('user').textContent).toBe('no user');
    });
  });



  it('login stores token', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('new-token');
    });
  });

  it('login stores user data', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(localStorage.getItem('email')).toBe('test@test.com');
      expect(localStorage.getItem('userId')).toBe('1');
    });
  });

  it('login stores portfolioIds', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(localStorage.getItem('userPortfolios')).toBe(JSON.stringify(['p1', 'p2']));
    });
  });

  it('login without portfolioIds', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { _id: '1', email: 'test@test.com' },
        token: 'new-token',
      },
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Logged In!');
    });
  });

  it('login with user.id instead of user._id', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { id: '2', email: 'test@test.com' },
        token: 'new-token',
      },
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(localStorage.getItem('userId')).toBe('2');
    });
  });


  // Logout
  it('logout clears state', async () => {
    localStorage.setItem('token', 'existing-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('token').textContent).toBe('no token');
    expect(screen.getByTestId('user').textContent).toBe('no user');
  });

  it('logout clears localStorage', async () => {
    localStorage.setItem('token', 'test');
    localStorage.setItem('email', 'test@test.com');

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logout clears query cache', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(mockQueryClientClear).toHaveBeenCalled();
  });

  it('logout shows toast', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(toast.success).toHaveBeenCalledWith('Logged Out!');
  });

  // RefreshUser
  it('refreshUser success', async () => {
    localStorage.setItem('token', 'test-token');
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Refresh'));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('user refreshed');
    });
  });

  it('refreshUser error', async () => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockRejectedValue(new Error('Refresh failed'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Refresh'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error refreshing user');
    });
  });

  // Context login/logout (legacy)
  it('contextLogin sets contextLoggedIn', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('ContextLogin'));
    });

    expect(screen.getByTestId('contextLoggedIn').textContent).toBe('true');
  });

  it('contextLogout clears items', async () => {
    localStorage.setItem('token', 'test');
    localStorage.setItem('email', 'test@test.com');
    localStorage.setItem('portfolioId', 'p1');

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('ContextLogout'));
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('portfolioId')).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Logged Out!');
  });

  // SetUser
  it('setUser updates user', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('SetUser'));
    });

    expect(screen.getByTestId('user').textContent).toContain('Test');
  });

  // PendingFile
  it('setPendingFile updates pendingFile', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('SetFile'));
    });

    expect(screen.getByTestId('pendingFile').textContent).toBe('test.pdf');
  });

  it('logs pendingFile when set', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('SetFile'));
    });

    expect(console.log).toHaveBeenCalledWith('✅ pendingFile stored:', 'test.pdf');
  });

  // No token - skips fetch
  it('skips fetch when no token', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    // axios.get should not be called for user fetch when no token
    expect(axios.get).not.toHaveBeenCalled();
  });
});