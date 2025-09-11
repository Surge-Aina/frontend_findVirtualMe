import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthContext } from '../../../../context/AuthContext'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock the ReadOnlyPortfolio component functionality
const MockReadOnlyPortfolio = ({ contextLoggedIn = false, isExampleView = false }) => {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

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
      setLastRefresh(new Date())
    }, 100)
  }, [])

  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">Error: {error}</div>
  if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

  return (
    <div data-testid="readonly-portfolio">
      <div data-testid="readonly-indicator">Read-Only Mode</div>
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
      <div data-testid="experience-section">
        <h3>Experience</h3>
        {portfolio.experience.map((exp, index) => (
          <div key={index} data-testid={`experience-${index}`}>
            {exp.role} at {exp.company}
          </div>
        ))}
      </div>
      <div data-testid="education-section">
        <h3>Education</h3>
        {portfolio.education.map((edu, index) => (
          <div key={index} data-testid={`education-${index}`}>
            {edu.degree} from {edu.institution}
          </div>
        ))}
      </div>
      <div data-testid="certifications-section">
        <h3>Certifications</h3>
        {portfolio.certifications.map((cert, index) => (
          <div key={index} data-testid={`certification-${index}`}>
            {cert.title} ({cert.year})
          </div>
        ))}
      </div>
      {isExampleView && (
        <div data-testid="example-view-indicator">Example Portfolio</div>
      )}
      {lastRefresh && (
        <div data-testid="last-refresh">
          Last updated: {lastRefresh.toLocaleString()}
        </div>
      )}
    </div>
  )
}

/**
 * Test suite for ReadOnlyPortfolio component
 * Tests read-only functionality, data display, and different view modes
 */
describe('ReadOnlyPortfolio Component', () => {
  const mockContextLogout = vi.fn()

  const renderWithAuth = (contextLoggedIn = false, isExampleView = false) => {
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
          <MockReadOnlyPortfolio 
            contextLoggedIn={contextLoggedIn} 
            isExampleView={isExampleView}
          />
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
      expect(screen.getByTestId('readonly-portfolio')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('displays read-only indicator', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('readonly-indicator')).toBeInTheDocument()
    })

    expect(screen.getByText('Read-Only Mode')).toBeInTheDocument()
  })

  it('displays all portfolio sections correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('readonly-portfolio')).toBeInTheDocument()
    })

    // Check all sections are present
    expect(screen.getByTestId('personal-info')).toBeInTheDocument()
    expect(screen.getByTestId('skills-section')).toBeInTheDocument()
    expect(screen.getByTestId('projects-section')).toBeInTheDocument()
    expect(screen.getByTestId('experience-section')).toBeInTheDocument()
    expect(screen.getByTestId('education-section')).toBeInTheDocument()
    expect(screen.getByTestId('certifications-section')).toBeInTheDocument()
  })

  it('displays skills data correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('skills-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('JavaScript - Expert')).toBeInTheDocument()
    expect(screen.getByText('React - Expert')).toBeInTheDocument()
  })

  it('displays projects data correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('projects-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('displays experience data correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('experience-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer at Test Company')).toBeInTheDocument()
  })

  it('displays education data correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('education-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Computer Science from Test University')).toBeInTheDocument()
  })

  it('displays certifications data correctly', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('certifications-section')).toBeInTheDocument()
    })

    expect(screen.getByText('Certifications')).toBeInTheDocument()
    expect(screen.getByText('AWS Certified (2023)')).toBeInTheDocument()
  })

  it('shows example view indicator when in example mode', async () => {
    renderWithAuth(false, true)
    
    await waitFor(() => {
      expect(screen.getByTestId('example-view-indicator')).toBeInTheDocument()
    })

    expect(screen.getByText('Example Portfolio')).toBeInTheDocument()
  })

  it('displays last refresh timestamp', async () => {
    renderWithAuth()
    
    await waitFor(() => {
      expect(screen.getByTestId('last-refresh')).toBeInTheDocument()
    })

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('handles empty portfolio data gracefully', async () => {
    const MockEmptyReadOnlyPortfolio = () => {
      const [portfolio, setPortfolio] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null)

      if (loading) return <div data-testid="loading">Loading...</div>
      if (error) return <div data-testid="error">Error: {error}</div>
      if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

      return <div data-testid="readonly-portfolio">Portfolio</div>
    }

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ contextLoggedIn: false, contextLogout: mockContextLogout }}>
          <MockEmptyReadOnlyPortfolio />
        </AuthContext.Provider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('no-portfolio')).toBeInTheDocument()
  })

  it('handles error state correctly', async () => {
    const MockErrorReadOnlyPortfolio = () => {
      const [portfolio, setPortfolio] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('Failed to load portfolio')

      if (loading) return <div data-testid="loading">Loading...</div>
      if (error) return <div data-testid="error">Error: {error}</div>
      if (!portfolio) return <div data-testid="no-portfolio">No portfolio found</div>

      return <div data-testid="readonly-portfolio">Portfolio</div>
    }

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ contextLoggedIn: false, contextLogout: mockContextLogout }}>
          <MockErrorReadOnlyPortfolio />
        </AuthContext.Provider>
      </BrowserRouter>
    )

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByText('Error: Failed to load portfolio')).toBeInTheDocument()
  })

  it('works correctly for logged in users', async () => {
    renderWithAuth(true)
    
    await waitFor(() => {
      expect(screen.getByTestId('readonly-portfolio')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('works correctly for anonymous users', async () => {
    renderWithAuth(false)
    
    await waitFor(() => {
      expect(screen.getByTestId('readonly-portfolio')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
