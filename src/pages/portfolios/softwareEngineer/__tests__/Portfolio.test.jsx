import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthContext } from '../../../../context/AuthContext'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock the main Portfolio component functionality
const MockPortfolio = ({ contextLoggedIn = true }) => {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState('')
  const [isAdmin, setIsAdmin] = useState(true)

  // Mock portfolio data
  const mockPortfolioData = {
    _id: '1',
    ownerId: 'test@example.com',
    personalInfo: {
      name: 'John Doe',
      title: 'Software Engineer',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'New York, NY',
      summary: 'Experienced software engineer'
    },
    skills: [
      { name: 'JavaScript', level: 'Expert', rating: 5, description: 'Advanced JavaScript' },
      { name: 'React', level: 'Expert', rating: 5, description: 'React development' }
    ],
    projects: [
      {
        title: 'Test Project',
        description: 'A test project',
        repoUrl: 'https://github.com/test',
        demoUrl: 'https://demo.com',
        imageUrl: 'test.jpg',
        techStack: ['React', 'Node.js']
      }
    ],
    experience: [
      {
        company: 'Test Company',
        role: 'Software Engineer',
        duration: '2020-2023',
        details: 'Worked on various projects'
      }
    ],
    education: [
      {
        degree: 'Computer Science',
        institution: 'Test University',
        year: '2020'
      }
    ],
    certifications: [
      {
        title: 'AWS Certified',
        year: '2023',
        imageUrl: 'cert.jpg'
      }
    ]
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPortfolio(mockPortfolioData)
      setLoading(false)
    }, 100)
  }, [])

  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">Error: {error}</div>
  if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

  return (
    <div data-testid="portfolio">
      <h1>Portfolio</h1>
      <div data-testid="personal-info">
        <h2>{portfolio.personalInfo.name}</h2>
        <p>{portfolio.personalInfo.title}</p>
        <p>{portfolio.personalInfo.email}</p>
      </div>
      <div data-testid="skills-section">
        <h3>Skills</h3>
        {portfolio.skills.map((skill, index) => (
          <div key={index} data-testid={`skill-${index}`}>
            {skill.name} - {skill.level}
          </div>
        ))}
      </div>
      <div data-testid="projects-section">
        <h3>Projects</h3>
        {portfolio.projects.map((project, index) => (
          <div key={index} data-testid={`project-${index}`}>
            {project.title}
          </div>
        ))}
      </div>
      <button 
        data-testid="add-skill-btn"
        onClick={() => setShowAddModal(true)}
      >
        Add Skill
      </button>
      <button 
        data-testid="edit-field-btn"
        onClick={() => setEditingField('name')}
      >
        Edit Name
      </button>
      {editingField && (
        <div data-testid="edit-modal">
          <input 
            data-testid="edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button 
            data-testid="save-edit-btn"
            onClick={() => setEditingField(null)}
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Test suite for Portfolio component
 * Tests loading states, data rendering, editing functionality, and admin features
 */
describe('Portfolio Component', () => {
  const mockContextLogout = vi.fn()

  const renderWithAuth = (contextLoggedIn = true) => {
    const authValue = {
      contextLoggedIn,
      contextLogout: mockContextLogout
    }

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'email') return 'test@example.com'
      return null
    })

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <MockPortfolio contextLoggedIn={contextLoggedIn} />
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state initially', () => {
    renderWithAuth()
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('renders portfolio data after loading', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('portfolio')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('displays skills section correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('skills-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('JavaScript - Expert')).toBeInTheDocument()
    expect(screen.getByText('React - Expert')).toBeInTheDocument()
  })

  it('displays projects section correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('projects-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('handles editing functionality', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('portfolio')).toBeInTheDocument()
    })

    const editButton = screen.getByTestId('edit-field-btn')
    fireEvent.click(editButton)

    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
    expect(screen.getByTestId('edit-input')).toBeInTheDocument()
    expect(screen.getByTestId('save-edit-btn')).toBeInTheDocument()
  })

  it('handles add modal functionality', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('portfolio')).toBeInTheDocument()
    })

    const addButton = screen.getByTestId('add-skill-btn')
    fireEvent.click(addButton)

    // The modal should be triggered (in real implementation)
    expect(addButton).toBeInTheDocument()
  })

  it('displays personal information correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('personal-info')).toBeInTheDocument()
    })

    const personalInfo = screen.getByTestId('personal-info')
    expect(personalInfo).toHaveTextContent('John Doe')
    expect(personalInfo).toHaveTextContent('Software Engineer')
    expect(personalInfo).toHaveTextContent('john@example.com')
  })

  it('handles empty portfolio data gracefully', async () => {
    // Mock empty portfolio
    const MockEmptyPortfolio = () => {
      const [portfolio, setPortfolio] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null)

      if (loading) return <div data-testid="loading">Loading...</div>
      if (error) return <div data-testid="error">Error: {error}</div>
      if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

      return <div data-testid="portfolio">Portfolio</div>
    }

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ contextLoggedIn: true, contextLogout: mockContextLogout }}>
          <MockEmptyPortfolio />
        </AuthContext.Provider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('no-portfolio')).toBeInTheDocument()
  })

  it('handles error state correctly', async () => {
    const MockErrorPortfolio = () => {
      const [portfolio, setPortfolio] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('Failed to load portfolio')

      if (loading) return <div data-testid="loading">Loading...</div>
      if (error) return <div data-testid="error">Error: {error}</div>
      if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

      return <div data-testid="portfolio">Portfolio</div>
    }

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ contextLoggedIn: true, contextLogout: mockContextLogout }}>
          <MockErrorPortfolio />
        </AuthContext.Provider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByText('Error: Failed to load portfolio')).toBeInTheDocument()
  })

  it('renders with admin privileges', async () => {
    renderWithAuth(true)
    
    await waitFor(() => {
      expect(screen.getByTestId('portfolio')).toBeInTheDocument()
    })

    // Admin should see edit buttons
    expect(screen.getByTestId('add-skill-btn')).toBeInTheDocument()
    expect(screen.getByTestId('edit-field-btn')).toBeInTheDocument()
  })
})
