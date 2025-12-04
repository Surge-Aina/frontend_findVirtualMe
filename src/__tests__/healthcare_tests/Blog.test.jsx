/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ practiceId: 'practice_123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the API
jest.mock('../../pages/portfolios/healthcare/lib/api', () => ({
  api: {
    getPracticeData: jest.fn()
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaImage: () => <span data-testid="icon-image">Image</span>,
  FaCalendar: () => <span data-testid="icon-calendar">Calendar</span>,
  FaUser: () => <span data-testid="icon-user">User</span>,
  FaClock: () => <span data-testid="icon-clock">Clock</span>,
  FaTag: () => <span data-testid="icon-tag">Tag</span>,
  FaBars: () => <span data-testid="icon-bars">Bars</span>,
  FaTimes: () => <span data-testid="icon-times">Times</span>,
  FaTooth: () => <span data-testid="icon-tooth">Tooth</span>,
  FaSearch: () => <span data-testid="icon-search">Search</span>,
  FaArrowUp: () => <span data-testid="icon-arrow-up">ArrowUp</span>,
}));

const Blog = require('../../pages/portfolios/healthcare/pages/blog/Blog').default;
const { api } = require('../../pages/portfolios/healthcare/lib/api');

const mockUserData = {
  practiceId: 'practice_123',
  practice: { name: 'Test Clinic' },
  blogPosts: [
    {
      id: 1,
      title: 'Health Tips for Winter',
      excerpt: 'Stay healthy during cold season',
      content: 'Full content here...',
      category: 'Health Tips',
      publishDate: '2024-01-01',
      author: { name: 'Dr. Smith' },
      tags: ['health', 'winter'],
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'Nutrition Guide',
      excerpt: 'Eat well for better health',
      content: 'Nutrition content...',
      category: 'Nutrition',
      publishDate: '2024-01-15',
      author: { name: 'Dr. Jones' },
      tags: ['food', 'health'],
      readTime: '3 min read',
      featured: false
    }
  ],
  ui: {
    blog: {
      readMoreText: 'Read More'
    }
  }
};

const renderBlog = () => {
  return render(
    <BrowserRouter>
      <Blog />
    </BrowserRouter>
  );
};

describe('Healthcare Blog Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading state initially', () => {
    api.getPracticeData.mockImplementation(() => new Promise(() => {}));
    
    renderBlog();
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('should render blog heading', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Blog & Articles')).toBeInTheDocument();
    });
  });

  test('should render hero description', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText(/Stay informed with expert medical advice/i)).toBeInTheDocument();
    });
  });

  test('should render blog posts', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should render multiple blog posts', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
      expect(screen.getByText('Nutrition Guide')).toBeInTheDocument();
    });
  });

  test('should render post excerpts', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Stay healthy during cold season')).toBeInTheDocument();
    });
  });

  test('should render category filters', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
      const healthTips = screen.getAllByText('Health Tips');
      expect(healthTips.length).toBeGreaterThan(0);
      const nutritionButton = screen.getByRole('button', { name: 'Nutrition' });
      expect(nutritionButton).toBeInTheDocument();

    });
  });

  test('should filter posts by category', async () => {
    const user = userEvent.setup();
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
      expect(screen.getByText('Nutrition Guide')).toBeInTheDocument();
    });
    
    const healthTipsButton = screen.getByRole('button', { name: 'Health Tips' });
    await user.click(healthTipsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
      expect(screen.queryByText('Nutrition Guide')).not.toBeInTheDocument();
    });
  });

  test('should show all posts when All category selected', async () => {
    const user = userEvent.setup();
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
    
    const nutritionButton = screen.getByRole('button', { name: 'Nutrition' });
    await user.click(nutritionButton);
    
    const allButton = screen.getByRole('button', { name: 'All' });
    await user.click(allButton);
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
      expect(screen.getByText('Nutrition Guide')).toBeInTheDocument();
    });
  });

  test('should render featured badge', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  test('should render read time', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });
  });

  test('should show empty state when no posts', async () => {
    api.getPracticeData.mockResolvedValue({
      ...mockUserData,
      blogPosts: []
    });
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText(/no blog posts yet/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should render Read More links', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      const readMoreLinks = screen.getAllByText('Read More');
      expect(readMoreLinks.length).toBeGreaterThan(0);
    });
  });

  test('should render author names', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });
  });

  test('should render publish dates', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    });
  });

  test('should render tags', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
  const healthTags = screen.getAllByText('health');
  expect(healthTags.length).toBeGreaterThan(0);
  expect(screen.getByText('winter')).toBeInTheDocument();
});
  });

  test('should limit tags display to 3', async () => {
    const manyTagsData = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      }]
    };
    
    api.getPracticeData.mockResolvedValue(manyTagsData);
    
    renderBlog();
    
    await waitFor(() => {
      const postCard = screen.getByText('Health Tips for Winter').closest('article');
      const tags = postCard.querySelectorAll('.text-xs');
      expect(tags.length).toBeLessThanOrEqual(3);
    });
  });

  test('should render Go to Admin Panel link when no posts', async () => {
    api.getPracticeData.mockResolvedValue({
      ...mockUserData,
      blogPosts: []
    });
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Go to Admin Panel')).toBeInTheDocument();
    });
  });

  test('should render post categories', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      const categories = screen.getAllByText('Health Tips');
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  test('should render image placeholders for posts without images', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('icon-image').length).toBeGreaterThan(0);
    });
  });

  test('should render post images if available', async () => {
    const dataWithImages = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        image: 'https://example.com/blog.jpg'
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithImages);
    
    renderBlog();
    
    await waitFor(() => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  test('should highlight active category', async () => {
    const user = userEvent.setup();
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton).toHaveClass('bg-blue-600');
    });
    
    const healthTipsButton = screen.getByRole('button', { name: 'Health Tips' });
    await user.click(healthTipsButton);
    
    expect(healthTipsButton).toHaveClass('bg-blue-600');
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('bg-blue-600');
  });

  test('should render clock icon for read time', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('icon-clock').length).toBeGreaterThan(0);
    });
  });

  test('should render user icon for authors', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('icon-user').length).toBeGreaterThan(0);
    });
  });

  test('should render calendar icon for dates', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('icon-calendar').length).toBeGreaterThan(0);
    });
  });

  test('should render tag icons', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('icon-tag').length).toBeGreaterThan(0);
    });
  });

  test('should handle posts without categories', async () => {
    const dataWithoutCategories = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        category: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutCategories);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
  });

  test('should handle posts without authors', async () => {
    const dataWithoutAuthors = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        author: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutAuthors);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
  });

  test('should handle posts without tags', async () => {
    const dataWithoutTags = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        tags: []
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutTags);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
  });

  test('should use custom read more text if available', async () => {
    const customTextData = {
      ...mockUserData,
      ui: {
        blog: {
          readMoreText: 'Continue Reading'
        }
      }
    };
    
    api.getPracticeData.mockResolvedValue(customTextData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getAllByText('Continue Reading').length).toBeGreaterThan(0);
    });
  });

  test('should handle API errors', async () => {
    api.getPracticeData.mockRejectedValue(new Error('API Error'));
    
    renderBlog();
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading blog/i)).toBeInTheDocument();
    });
  });

  test('should call getPracticeData with correct practiceId', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlog();
    
    await waitFor(() => {
      expect(api.getPracticeData).toHaveBeenCalledWith('practice_123');
    });
  });
});