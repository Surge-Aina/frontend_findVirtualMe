/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const mockHealthcarePath = jest.fn(() => ({
  basePath: '/portfolios/healthcare/practice_123',
  practiceId: 'practice_123',
}));

jest.mock('@/features/portfolios/_legacy/healthcare/hooks/useHealthcareBasePath', () => ({
  useHealthcareBasePath: () => mockHealthcarePath(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
  FaImage: () => <span data-testid="icon-image">Image</span>,
  FaExpand: () => <span data-testid="icon-expand">Expand</span>,
  FaTimes: () => <span data-testid="icon-times">Times</span>,
  FaBars: () => <span data-testid="icon-bars">Bars</span>,
  FaTooth: () => <span data-testid="icon-tooth">Tooth</span>,
  FaSearch: () => <span data-testid="icon-search">Search</span>,
  FaArrowUp: () => <span data-testid="icon-arrow-up">ArrowUp</span>,
  FaCamera: () => <span data-testid="icon-camera">Camera</span>,
  FaSpinner: () => <span data-testid="icon-spinner">Spinner</span>,
}));

const Gallery = require('../pages/Gallery').default;
const { api } = require('../lib/api');

const mockUserData = {
  practiceId: 'practice_123',
  practice: { name: 'Test Clinic' },
  gallery: {
    facilityImages: [
      {
        url: 'https://example.com/image1.jpg',
        caption: 'Reception Area',
        description: 'Modern reception area'
      },
      {
        url: 'https://example.com/image2.jpg',
        caption: 'Treatment Room',
        description: 'State-of-the-art treatment room'
      }
    ],
    beforeAfterCases: [
      {
        title: 'Dental Whitening',
        treatment: 'Teeth Whitening',
        duration: '2 weeks',
        beforeImage: 'https://example.com/before.jpg',
        afterImage: 'https://example.com/after.jpg',
        description: 'Amazing results'
      }
    ]
  }
};

const renderGallery = () => {
  return render(
    <BrowserRouter>
      <Gallery />
    </BrowserRouter>
  );
};

describe('Healthcare Gallery Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHealthcarePath.mockImplementation(() => ({
      basePath: '/portfolios/healthcare/practice_123',
      practiceId: 'practice_123',
    }));
  });

  test('should render loading state initially', () => {
    api.getPracticeData.mockImplementation(() => new Promise(() => {}));
    
    renderGallery();
    
    expect(screen.getByTestId('icon-spinner')).toBeInTheDocument();
  });

  test('should render Gallery heading', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Our Facility & Results')).toBeInTheDocument();
    });
  });

  test('should render facility images', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Reception Area')).toBeInTheDocument();
    });
  });

  test('should render multiple facility images', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Reception Area')).toBeInTheDocument();
      expect(screen.getByText('Treatment Room')).toBeInTheDocument();
    });
  });

  test('should render Our Facilities heading', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Our Facilities')).toBeInTheDocument();
    });
  });

  test('should render Before & After section', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Before & After')).toBeInTheDocument();
    });
  });

  test('should render before/after case title', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Dental Whitening')).toBeInTheDocument();
    });
  });

  test('should render treatment information', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText(/Teeth Whitening/i)).toBeInTheDocument();
    });
  });

  test('should show empty state when no images', async () => {
    api.getPracticeData.mockResolvedValue({
      ...mockUserData,
      gallery: {
        facilityImages: [],
        beforeAfterCases: []
      }
    });
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText(/Gallery Coming Soon/i)).toBeInTheDocument();
    });
  });

  test('should render case description', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Amazing results')).toBeInTheDocument();
    });
  });

  test('should render Before and After labels', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderGallery();
    
    await waitFor(() => {
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
    });
  });

  test('loads demo data when practiceId is demo', async () => {
    mockHealthcarePath.mockImplementation(() => ({
      basePath: '/portfolios/healthcare/demo',
      practiceId: 'demo',
    }));
    api.getDemoData.mockResolvedValue(mockUserData);

    renderGallery();

    await waitFor(() => {
      expect(api.getDemoData).toHaveBeenCalled();
    });
    expect(api.getPracticeData).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Reception Area')).toBeInTheDocument();
    });
  });

  test('opens lightbox when a facility image card is clicked', async () => {
    const user = userEvent.setup();
    api.getPracticeData.mockResolvedValue(mockUserData);
    renderGallery();

    await waitFor(() => {
      expect(screen.getByAltText('Reception Area')).toBeInTheDocument();
    });

    await user.click(screen.getByAltText('Reception Area'));

    expect(screen.getAllByAltText('Reception Area')).toHaveLength(2);
  });
});