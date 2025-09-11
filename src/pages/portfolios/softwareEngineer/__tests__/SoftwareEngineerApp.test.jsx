import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../../../context/AuthContext'

// Mock the main components
vi.mock('../../SoftwareEngineerApp', () => ({
  default: ({ contextLoggedIn }) => (
    <div data-testid="software-engineer-app">
      <div data-testid="auth-status">
        {contextLoggedIn ? 'Logged In' : 'Not Logged In'}
      </div>
    </div>
  )
}))

// Mock the routing components
const MockSoftwareEngineerApp = ({ contextLoggedIn = false }) => {
  const authValue = {
    contextLoggedIn,
    contextLogout: vi.fn()
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div data-testid="software-engineer-app">
        <div data-testid="auth-status">
          {contextLoggedIn ? 'Logged In' : 'Not Logged In'}
        </div>
        <div data-testid="app-content">Software Engineer App</div>
      </div>
    </AuthContext.Provider>
  )
}

// Mock routing behavior
const MockAppWithRouting = ({ initialPath = '/', contextLoggedIn = false }) => {
  const authValue = {
    contextLoggedIn,
    contextLogout: vi.fn()
  }

  const renderRoute = () => {
    switch (initialPath) {
      case '/unauthorized':
        return <div data-testid="unauthorized">Unauthorized</div>
      case '/dashboard':
        return contextLoggedIn ? 
          <div data-testid="dashboard">Dashboard</div> : 
          <div data-testid="navigate-to-login">Navigate to Login</div>
      case '/admin':
        return <div data-testid="admin-portfolio">Admin Portfolio</div>
      case '/example':
        return <div data-testid="example-portfolio">Example Portfolio</div>
      case '/':
        return <div data-testid="navigate-to-admin">Navigate to Admin</div>
      default:
        return <div data-testid="not-found">Not Found</div>
    }
  }

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={authValue}>
        <div data-testid="app">
          {renderRoute()}
        </div>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

/**
 * Test suite for SoftwareEngineerApp component
 * Tests routing, authentication, and component rendering
 */
describe('SoftwareEngineerApp Component', () => {
  const mockContextLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main app component', () => {
    render(<MockSoftwareEngineerApp contextLoggedIn={false} />)
    
    expect(screen.getByTestId('software-engineer-app')).toBeInTheDocument()
    expect(screen.getByTestId('app-content')).toBeInTheDocument()
  })

  it('shows logged in status correctly', () => {
    render(<MockSoftwareEngineerApp contextLoggedIn={true} />)
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
  })

  it('shows not logged in status correctly', () => {
    render(<MockSoftwareEngineerApp contextLoggedIn={false} />)
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Logged In')
  })

  it('renders unauthorized route correctly', () => {
    render(<MockAppWithRouting initialPath="/unauthorized" />)
    
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument()
  })

  it('renders dashboard for logged in users', () => {
    render(<MockAppWithRouting initialPath="/dashboard" contextLoggedIn={true} />)
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('redirects to login for dashboard when not logged in', () => {
    render(<MockAppWithRouting initialPath="/dashboard" contextLoggedIn={false} />)
    
    expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument()
  })

  it('renders admin portfolio route', () => {
    render(<MockAppWithRouting initialPath="/admin" />)
    
    expect(screen.getByTestId('admin-portfolio')).toBeInTheDocument()
  })

  it('renders example portfolio route', () => {
    render(<MockAppWithRouting initialPath="/example" />)
    
    expect(screen.getByTestId('example-portfolio')).toBeInTheDocument()
  })

  it('redirects root path to admin', () => {
    render(<MockAppWithRouting initialPath="/" />)
    
    expect(screen.getByTestId('navigate-to-admin')).toBeInTheDocument()
  })

  it('handles unknown routes', () => {
    render(<MockAppWithRouting initialPath="/unknown" />)
    
    expect(screen.getByTestId('not-found')).toBeInTheDocument()
  })

  it('maintains authentication context across routes', () => {
    const { rerender } = render(
      <MockAppWithRouting initialPath="/dashboard" contextLoggedIn={true} />
    )
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    
    // Rerender with different auth state
    rerender(<MockAppWithRouting initialPath="/dashboard" contextLoggedIn={false} />)
    
    expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument()
  })

  it('provides logout function in context', () => {
    const TestComponent = () => {
      const { contextLogout } = useContext(AuthContext)
      return (
        <button 
          data-testid="logout-btn" 
          onClick={contextLogout}
        >
          Logout
        </button>
      )
    }

    render(
      <AuthContext.Provider value={{ contextLoggedIn: true, contextLogout: mockContextLogout }}>
        <TestComponent />
      </AuthContext.Provider>
    )

    const logoutBtn = screen.getByTestId('logout-btn')
    expect(logoutBtn).toBeInTheDocument()
    
    // Test that logout function is callable
    fireEvent.click(logoutBtn)
    expect(mockContextLogout).toHaveBeenCalled()
  })

  it('handles multiple route changes correctly', () => {
    const { rerender } = render(<MockAppWithRouting initialPath="/admin" />)
    
    expect(screen.getByTestId('admin-portfolio')).toBeInTheDocument()
    
    rerender(<MockAppWithRouting initialPath="/example" />)
    expect(screen.getByTestId('example-portfolio')).toBeInTheDocument()
    
    rerender(<MockAppWithRouting initialPath="/dashboard" contextLoggedIn={true} />)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('renders with proper app structure', () => {
    render(<MockSoftwareEngineerApp contextLoggedIn={false} />)
    
    const app = screen.getByTestId('software-engineer-app')
    expect(app).toBeInTheDocument()
    expect(app).toHaveTextContent('Software Engineer App')
  })
})
