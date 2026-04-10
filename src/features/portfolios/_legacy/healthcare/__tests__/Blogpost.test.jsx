/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ practiceId: 'practice_123', id: '1' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the API
jest.mock('../lib/api', () => ({
  api: {
    getPracticeData: jest.fn()
  }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaArrowLeft: () => <span data-testid="icon-arrow">Arrow</span>,
  FaCalendarAlt: () => <span data-testid="icon-calendar">Calendar</span>,
  FaUser: () => <span data-testid="icon-user">User</span>,
  FaClock: () => <span data-testid="icon-clock">Clock</span>,
  FaBars: () => <span data-testid="icon-bars">Bars</span>,
  FaTimes: () => <span data-testid="icon-times">Times</span>,
  FaTooth: () => <span data-testid="icon-tooth">Tooth</span>,
  FaSearch: () => <span data-testid="icon-search">Search</span>,
  FaArrowUp: () => <span data-testid="icon-arrow-up">ArrowUp</span>,
}));

const BlogPost = require('../pages/blog/BlogPost').default;
const { api } = require('../lib/api');

const mockUserData = {
  practiceId: 'practice_123',
  practice: { name: 'Test Clinic' },
  blogPosts: [
    {
      id: 1,
      title: 'Health Tips for Winter',
      excerpt: 'Stay healthy during cold season',
      content: '<p>This is the full content of the blog post.</p>',
      category: 'Health Tips',
      publishDate: '2024-01-01',
      author: { name: 'Dr. Smith' },
      tags: ['health', 'winter'],
      readTime: '5 min read',
      image: 'https://example.com/blog-image.jpg'
    },
    {
      id: 2,
      title: 'Nutrition Guide',
      excerpt: 'Eat well for better health',
      content: '<p>Nutrition content...</p>',
      category: 'Nutrition',
      publishDate: '2024-01-15',
      author: { name: 'Dr. Jones' },
      tags: ['food'],
      readTime: '3 min read'
    }
  ]
};

const renderBlogPost = () => {
  return render(
    <BrowserRouter>
      <BlogPost />
    </BrowserRouter>
  );
};

describe('Healthcare BlogPost Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render loading state initially', () => {
    api.getPracticeData.mockImplementation(() => new Promise(() => {}));
    
    renderBlogPost();
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('should render blog post title', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
  });

  test('should render Back to Blog link', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      const backLinks = screen.getAllByText('Back to Blog');
      expect(backLinks.length).toBeGreaterThan(0);
    });
  });

  test('should render post category', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips')).toBeInTheDocument();
    });
  });

  test('should render author name', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
    });
  });

  test('should render read time', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });
  });

  test('should render tags', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('#health')).toBeInTheDocument();
      expect(screen.getByText('#winter')).toBeInTheDocument();
    });
  });

  test('should render post content', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText(/This is the full content/i)).toBeInTheDocument();
    });
  });

  test('should render Related Articles section when multiple posts exist', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Related Articles')).toBeInTheDocument();
    });
  });

  test('should show not found message when post does not exist', async () => {
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ practiceId: 'practice_123', id: '999' }),
      Link: ({ children, to }) => <a href={to}>{children}</a>
    }));
    
    api.getPracticeData.mockResolvedValue({
      ...mockUserData,
      blogPosts: []
    });
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText(/Blog Post Not Found/i)).toBeInTheDocument();
    });
  });

  test('should render publish date', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
  expect(screen.getByText(/2023/)).toBeInTheDocument();
});

  });

  test('should render featured image if available', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      const images = document.querySelectorAll('img');
      const featuredImage = Array.from(images).find(img => 
        img.src.includes('blog-image.jpg')
      );
      expect(featuredImage).toBeInTheDocument();
    });
  });

  test('should render related posts', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Nutrition Guide')).toBeInTheDocument();
    });
  });

  test('should not render Related Articles if only one post exists', async () => {
    api.getPracticeData.mockResolvedValue({
      ...mockUserData,
      blogPosts: [mockUserData.blogPosts[0]]
    });
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.queryByText('Related Articles')).not.toBeInTheDocument();
    });
  });

  test('should render related post excerpts', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Eat well for better health')).toBeInTheDocument();
    });
  });

  test('should limit related posts to 3', async () => {
    const manyPosts = {
      ...mockUserData,
      blogPosts: [
        ...mockUserData.blogPosts,
        { id: 3, title: 'Post 3', excerpt: 'Excerpt 3' },
        { id: 4, title: 'Post 4', excerpt: 'Excerpt 4' },
        { id: 5, title: 'Post 5', excerpt: 'Excerpt 5' }
      ]
    };
    
    api.getPracticeData.mockResolvedValue(manyPosts);
    
    renderBlogPost();
    
    await waitFor(() => {
      const relatedSection = screen.getByText('Related Articles').parentElement;
      const links = relatedSection.querySelectorAll('a');
      expect(links.length).toBeLessThanOrEqual(3);
    });
  });

  test('should render user icon', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByTestId('icon-user')).toBeInTheDocument();
    });
  });

  test('should render calendar icon', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByTestId('icon-calendar')).toBeInTheDocument();
    });
  });

  test('should render clock icon', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
    });
  });

  test('should render arrow icon in back link', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByTestId('icon-arrow')).toBeInTheDocument();
    });
  });

  test('should handle posts without author', async () => {
    const dataWithoutAuthor = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        author: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutAuthor);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Staff')).toBeInTheDocument();
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
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('#health')).not.toBeInTheDocument();
  });

  test('should handle posts without category', async () => {
    const dataWithoutCategory = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        category: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutCategory);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Health Tips')).not.toBeInTheDocument();
  });

  test('should handle posts without read time', async () => {
    const dataWithoutReadTime = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        readTime: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutReadTime);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('5 min read')).not.toBeInTheDocument();
  });

  test('should handle posts without image', async () => {
    const dataWithoutImage = {
      ...mockUserData,
      blogPosts: [{
        ...mockUserData.blogPosts[0],
        image: null
      }]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithoutImage);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText('Health Tips for Winter')).toBeInTheDocument();
    });
  });

  test('should handle API errors gracefully', async () => {
    api.getPracticeData.mockRejectedValue(new Error('API Error'));
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(screen.getByText(/Blog Post Not Found/i)).toBeInTheDocument();
    });
  });

  test('should render related post images if available', async () => {
    const dataWithImages = {
      ...mockUserData,
      blogPosts: [
        mockUserData.blogPosts[0],
        {
          ...mockUserData.blogPosts[1],
          image: 'https://example.com/related.jpg'
        }
      ]
    };
    
    api.getPracticeData.mockResolvedValue(dataWithImages);
    
    renderBlogPost();
    
    await waitFor(() => {
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(1);
    });
  });

  test('should call getPracticeData with correct practiceId', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    renderBlogPost();
    
    await waitFor(() => {
      expect(api.getPracticeData).toHaveBeenCalledWith('practice_123');
    });
  });
});