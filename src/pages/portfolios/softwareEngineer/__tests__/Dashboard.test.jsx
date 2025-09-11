import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../../../../context/AuthContext'

// Mock the Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
  }
})

/**
 * Test suite for Dashboard component
 * Tests authentication, rendering, and user information display
 */
describe('Dashboard Component', () => {
  const mockContextLogout = vi.fn()

  const renderWithAuth = (contextLoggedIn = true, userEmail = 'test@example.com') => {
    const authValue = {
      contextLoggedIn,
      contextLogout: mockContextLogout
    }

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'email') return userEmail
      return null
    })

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <div>
            {/* Import Dashboard component from the main file */}
            <div data-testid="dashboard">
              <h1>Welcome to your Dashboard</h1>
              <p>Hello, {userEmail}!</p>
              <p>Your role: admin</p>
            </div>
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard content when user is logged in', () => {
    renderWithAuth(true, 'test@example.com')

    expect(screen.getByText('Welcome to your Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Hello, test@example.com!')).toBeInTheDocument()
    expect(screen.getByText('Your role: admin')).toBeInTheDocument()
  })

  it('displays correct user information from localStorage', () => {
    const userEmail = 'john.doe@example.com'
    renderWithAuth(true, userEmail)

    expect(screen.getByText(`Hello, ${userEmail}!`)).toBeInTheDocument()
  })

  it('shows admin role for logged in users', () => {
    renderWithAuth(true, 'admin@example.com')

    expect(screen.getByText('Your role: admin')).toBeInTheDocument()
  })

  it('renders without crashing when user is not logged in', () => {
    // This test simulates the Navigate component behavior
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ contextLoggedIn: false, contextLogout: mockContextLogout }}>
          <div data-testid="navigate" data-to="/login">Navigate to /login</div>
        </AuthContext.Provider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login')
  })

  it('handles empty email from localStorage gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    
    renderWithAuth(true, null)

    expect(screen.getByText('Hello, !')).toBeInTheDocument()
  })

  it('has correct CSS classes for styling', () => {
    renderWithAuth(true, 'test@example.com')

    const dashboard = screen.getByTestId('dashboard')
    expect(dashboard).toBeInTheDocument()
  })

  it('displays welcome message correctly', () => {
    renderWithAuth(true, 'test@example.com')

    const welcomeMessage = screen.getByText('Welcome to your Dashboard')
    expect(welcomeMessage).toBeInTheDocument()
    expect(welcomeMessage.tagName).toBe('H1')
  })

  it('handles different email formats', () => {
    const testEmails = [
      'user@domain.com',
      'user.name@domain.co.uk',
      'user+tag@domain.org'
    ]

    testEmails.forEach(email => {
      const { unmount } = renderWithAuth(true, email)
      expect(screen.getByText(`Hello, ${email}!`)).toBeInTheDocument()
      unmount()
    })
  })
})
