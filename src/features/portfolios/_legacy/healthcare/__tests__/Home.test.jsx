/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockHealthcarePath = jest.fn(() => ({
  basePath: '/portfolios/healthcare/practice_123',
  practiceId: 'practice_123',
}));

jest.mock('@/features/portfolios/_legacy/healthcare/hooks/useHealthcareBasePath', () => ({
  useHealthcareBasePath: () => mockHealthcarePath(),
}));

jest.mock('@/shared/context/PortfolioContext', () => ({
  usePortfolio: () => ({
    setPortfolioId: jest.fn(),
    setPortfolioType: jest.fn(),
    setPortfolioOwner: jest.fn(),
    clearPortfolio: jest.fn(),
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ practiceId: 'practice_123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the API
jest.mock('../lib/api', () => ({
  api: {
    getPracticeData: jest.fn(),
    getDemoData: jest.fn(),
  }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUserMd: () => <span data-testid="icon-usermd">UserMd</span>,
  FaHeartbeat: () => <span data-testid="icon-heartbeat">Heartbeat</span>,
  FaMicroscope: () => <span data-testid="icon-microscope">Microscope</span>,
  FaShieldAlt: () => <span data-testid="icon-shield">Shield</span>,
  FaProcedures: () => <span data-testid="icon-procedures">Procedures</span>,
  FaTooth: () => <span data-testid="icon-tooth">Tooth</span>,
  FaCalendarCheck: () => <span data-testid="icon-calendar">Calendar</span>,
  FaUsers: () => <span data-testid="icon-users">Users</span>,
  FaChartLine: () => <span data-testid="icon-chart">Chart</span>,
  FaBars: () => <span data-testid="icon-bars">Bars</span>,
  FaTimes: () => <span data-testid="icon-times">Times</span>,
  FaSearch: () => <span data-testid="icon-search">Search</span>,
  FaArrowUp: () => <span data-testid="icon-arrow-up">ArrowUp</span>,
}));

const Home = require('../pages/Home').default;
const { api } = require('../lib/api');

const mockUserData = {
  practiceId: 'practice_123',
  practice: {
    name: 'Test Clinic',
    tagline: 'Your Health First',
    description: 'Quality healthcare services'
  },
  stats: {
    yearsExperience: '10',
    patientsServed: '1000',
    successRate: '95',
    doctorsCount: '5'
  },
  services: [
    {
      id: 'service_1',
      title: 'General Consultation',
      description: 'Initial medical consultation',
      icon: 'user-md'
    }
  ],
  ui: {
    hero: {
      primaryButtonText: 'Get Started',
      secondaryButtonText: 'Learn More'
    }
  }
};

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Healthcare Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHealthcarePath.mockImplementation(() => ({
      basePath: '/portfolios/healthcare/practice_123',
      practiceId: 'practice_123',
    }));
  });

  test('should render loading state initially', () => {
    api.getPracticeData.mockImplementation(() => new Promise(() => {}));
    
    renderHome();
    
    expect(screen.getByText(/loading practice/i)).toBeInTheDocument();
  });

  test('should render practice tagline after loading', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Your Health First')).toBeInTheDocument();
    });
  });

  test('should render practice description', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Quality healthcare services')).toBeInTheDocument();
    });
  });

  test('should render statistics', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('10+')).toBeInTheDocument();
      expect(screen.getByText('1000+')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  test('should render Get Started button', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  test('should show error state when practice not found', async () => {
    api.getPracticeData.mockRejectedValue(new Error('Not found'));
    
    renderHome();
    
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /practice not found/i })
      ).toBeInTheDocument();
    });
  });

  test('should render admin link', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  test('loads demo portfolio when practiceId is demo', async () => {
    mockHealthcarePath.mockImplementation(() => ({
      basePath: '/portfolios/healthcare/demo',
      practiceId: 'demo',
    }));
    api.getDemoData.mockResolvedValue(mockUserData);

    renderHome();

    await waitFor(() => {
      expect(api.getDemoData).toHaveBeenCalled();
    });
    expect(api.getPracticeData).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Your Health First')).toBeInTheDocument();
    });
  });

  test('should display secondary hero button (Learn More)', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(/Learn More/i)).toBeInTheDocument();
    });
  });
});