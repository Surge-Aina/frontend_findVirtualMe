import { render } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { vi } from 'vitest'

/**
 * Test utilities for common testing patterns
 * Provides helper functions for rendering components with common providers
 */

/**
 * Mock portfolio data for testing
 */
export const mockPortfolioData = {
  _id: '1',
  ownerId: 'test@example.com',
  personalInfo: {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    summary: 'Experienced software engineer with expertise in modern web technologies'
  },
  skills: [
    { 
      name: 'JavaScript', 
      level: 'Expert', 
      rating: 5, 
      description: 'Advanced JavaScript development including ES6+, async programming, and modern frameworks' 
    },
    { 
      name: 'React', 
      level: 'Expert', 
      rating: 5, 
      description: 'React development with hooks, context, and state management' 
    },
    { 
      name: 'Node.js', 
      level: 'Advanced', 
      rating: 4, 
      description: 'Server-side JavaScript development with Express and REST APIs' 
    }
  ],
  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce application with React frontend and Node.js backend',
      repoUrl: 'https://github.com/johndoe/ecommerce',
      demoUrl: 'https://ecommerce-demo.com',
      imageUrl: 'ecommerce.jpg',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      title: 'Task Management App',
      description: 'Collaborative task management tool with real-time updates',
      repoUrl: 'https://github.com/johndoe/taskmanager',
      demoUrl: 'https://taskmanager-demo.com',
      imageUrl: 'taskmanager.jpg',
      techStack: ['React', 'Socket.io', 'Express', 'PostgreSQL']
    }
  ],
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      duration: '2021-2024',
      details: 'Led development of microservices architecture and mentored junior developers'
    },
    {
      company: 'StartupXYZ',
      role: 'Full Stack Developer',
      duration: '2019-2021',
      details: 'Built and maintained web applications using React and Node.js'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      year: '2019'
    }
  ],
  certifications: [
    {
      title: 'AWS Certified Solutions Architect',
      year: '2023',
      imageUrl: 'aws-cert.jpg'
    },
    {
      title: 'Google Cloud Professional Developer',
      year: '2022',
      imageUrl: 'gcp-cert.jpg'
    }
  ]
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  email: 'test@example.com',
  username: 'testuser',
  role: 'admin',
  ownerId: 'test@example.com'
}

/**
 * Mock authentication context value
 */
export const createMockAuthContext = (contextLoggedIn = true, contextLogout = vi.fn()) => ({
  contextLoggedIn,
  contextLogout
})

/**
 * Custom render function that includes common providers
 */
export const renderWithProviders = (
  ui,
  {
    contextLoggedIn = true,
    contextLogout = vi.fn(),
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) => {
  const authValue = createMockAuthContext(contextLoggedIn, contextLogout)

  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </MemoryRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Render with BrowserRouter (for components that need full routing)
 */
export const renderWithBrowserRouter = (
  ui,
  {
    contextLoggedIn = true,
    contextLogout = vi.fn(),
    ...renderOptions
  } = {}
) => {
  const authValue = createMockAuthContext(contextLoggedIn, contextLogout)

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = (data = {}) => {
  const store = { ...data }
  
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    store[key] = value
  })
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
    delete store[key]
  })
  vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
    Object.keys(store).forEach(key => delete store[key])
  })
  
  return store
}

/**
 * Mock fetch for API testing
 */
export const mockFetch = (response, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response))
  })
}

/**
 * Mock fetch error
 */
export const mockFetchError = (error = 'Network error') => {
  global.fetch = vi.fn().mockRejectedValue(new Error(error))
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Create mock event handlers
 */
export const createMockHandlers = () => ({
  onClick: vi.fn(),
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn()
})

/**
 * Test data generators
 */
export const generateTestSkills = (count = 3) => 
  Array.from({ length: count }, (_, i) => ({
    name: `Skill ${i + 1}`,
    level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][i % 4],
    rating: (i % 5) + 1,
    description: `Description for skill ${i + 1}`
  }))

export const generateTestProjects = (count = 2) =>
  Array.from({ length: count }, (_, i) => ({
    title: `Project ${i + 1}`,
    description: `Description for project ${i + 1}`,
    repoUrl: `https://github.com/test/project${i + 1}`,
    demoUrl: `https://project${i + 1}-demo.com`,
    imageUrl: `project${i + 1}.jpg`,
    techStack: ['React', 'Node.js', 'MongoDB']
  }))

/**
 * Common test assertions
 */
export const expectElementToBeInDocument = (element) => {
  expect(element).toBeInTheDocument()
}

export const expectElementToHaveText = (element, text) => {
  expect(element).toHaveTextContent(text)
}

export const expectElementToHaveClass = (element, className) => {
  expect(element).toHaveClass(className)
}

export const expectElementToHaveAttribute = (element, attribute, value) => {
  expect(element).toHaveAttribute(attribute, value)
}


