/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaPlus: () => <span data-testid="icon-plus">+</span>,
  FaEdit: () => <span data-testid="icon-edit">Edit</span>,
  FaTrash: () => <span data-testid="icon-trash">Delete</span>,
  FaSave: () => <span data-testid="icon-save">Save</span>,
  FaTimes: () => <span data-testid="icon-times">X</span>,
  FaEye: () => <span data-testid="icon-eye">View</span>,
  FaImage: () => <span data-testid="icon-image">Img</span>,
  FaCamera: () => <span data-testid="icon-camera">Cam</span>,
}));

const BlogEditor = require('../components/admin/BlogEditor').default;

const mockBlogPosts = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    content: 'Test content',
    category: 'Health',
    publishDate: '2024-01-01',
    readTime: '5 min read',
    author: { name: 'Dr. Smith' },
    tags: ['health', 'wellness'],
    featured: false,
    image: ''
  }
];

const mockOnUpdate = jest.fn();

describe('BlogEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render blog posts list', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
  });

  test('should render Blog Posts Management heading', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Blog Posts Management')).toBeInTheDocument();
  });

  test('should render empty state when no posts', () => {
    render(
      <BlogEditor 
        blogPosts={[]}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/No blog posts yet/i)).toBeInTheDocument();
  });

  test('should show add new post button', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Add Blog Post/i)).toBeInTheDocument();
  });

  test('should call onUpdate when add button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    const addButton = screen.getByText(/Add Blog Post/i);
    await user.click(addButton);
    
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  test('should display post category', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  test('should display author information', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });

  test('should display tags', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('#health')).toBeInTheDocument();
    expect(screen.getByText('#wellness')).toBeInTheDocument();
  });

  test('should show edit button for each post', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    const editButtons = screen.getAllByTestId('icon-edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test('should show delete button for each post', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    const deleteButtons = screen.getAllByTestId('icon-trash');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('should handle multiple posts', () => {
    const multiplePosts = [
      ...mockBlogPosts,
      {
        id: 2,
        title: 'Second Post',
        excerpt: 'Second excerpt',
        content: 'Second content',
        category: 'Wellness',
        publishDate: '2024-01-02',
        readTime: '3 min read',
        author: { name: 'Dr. Jones' },
        tags: [],
        featured: false
      }
    ];
    
    render(
      <BlogEditor 
        blogPosts={multiplePosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  test('should display featured badge if post is featured', () => {
    const featuredPost = [{
      ...mockBlogPosts[0],
      featured: true
    }];
    
    render(
      <BlogEditor 
        blogPosts={featuredPost}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  test('should open edit form when edit button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    const editButtons = screen.getAllByTestId('icon-edit');
    await user.click(editButtons[0].closest('button'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter blog post title/i)).toBeInTheDocument();
    });
  });

  test('should handle posts without optional fields', () => {
    const minimalPost = [{
      id: 3,
      title: 'Minimal Post',
      excerpt: 'Minimal excerpt',
      content: 'Minimal content'
    }];
    
    render(
      <BlogEditor 
        blogPosts={minimalPost}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
  });

  test('should display publish date', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  test('should render blog post tips section', () => {
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Blog Post Tips/i)).toBeInTheDocument();
  });

  test('should show Create Your First Blog Post button when empty', () => {
    render(
      <BlogEditor 
        blogPosts={[]}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Create Your First Blog Post/i)).toBeInTheDocument();
  });

  test('should save and close edit form', async () => {
    const user = userEvent.setup();
    
    render(
      <BlogEditor 
        blogPosts={mockBlogPosts}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Click edit
    const editButtons = screen.getAllByTestId('icon-edit');
    await user.click(editButtons[0].closest('button'));
    
    // Wait for form to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Form should close
    await waitFor(() => {
      expect(screen.queryByLabelText(/Excerpt/i)).not.toBeInTheDocument();
    });
  });
});