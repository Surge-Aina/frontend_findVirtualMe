import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../components/Sidebar'

/**
 * Test suite for Sidebar component
 * Tests rendering, navigation items, collapse functionality, and accessibility
 */
describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation items correctly', () => {
    render(<Sidebar />)

    // Check if all navigation items are present
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('My Skills')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('renders with correct initial state (expanded)', () => {
    render(<Sidebar />)

    // Check if sidebar is expanded by default (w-56 class)
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('w-56')
    expect(sidebar).not.toHaveClass('w-20')
  })

  it('toggles collapse state when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const toggleButton = screen.getByLabelText('Toggle sidebar')
    const sidebar = screen.getByRole('navigation')

    // Initially expanded
    expect(sidebar).toHaveClass('w-56')
    expect(sidebar).not.toHaveClass('w-20')

    // Click to collapse
    await user.click(toggleButton)
    expect(sidebar).toHaveClass('w-20')
    expect(sidebar).not.toHaveClass('w-56')

    // Click to expand again
    await user.click(toggleButton)
    expect(sidebar).toHaveClass('w-56')
    expect(sidebar).not.toHaveClass('w-20')
  })

  it('shows/hides navigation labels based on collapse state', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const toggleButton = screen.getByLabelText('Toggle sidebar')
    const homeLabel = screen.getByText('Home')

    // Initially expanded - labels should be visible
    expect(homeLabel).toHaveClass('opacity-100')
    expect(homeLabel).toHaveClass('w-auto')

    // Collapse sidebar
    await user.click(toggleButton)
    expect(homeLabel).toHaveClass('opacity-0')
    expect(homeLabel).toHaveClass('w-0')

    // Expand sidebar again
    await user.click(toggleButton)
    expect(homeLabel).toHaveClass('opacity-100')
    expect(homeLabel).toHaveClass('w-auto')
  })

  it('has correct href attributes for navigation links', () => {
    render(<Sidebar />)

    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '#home')
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '#about')
    expect(screen.getByText('My Skills').closest('a')).toHaveAttribute('href', '#skills')
    expect(screen.getByText('Experience').closest('a')).toHaveAttribute('href', '#experience')
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('href', '#projects')
    expect(screen.getByText('Education').closest('a')).toHaveAttribute('href', '#education')
  })

  it('applies correct CSS classes for styling', () => {
    render(<Sidebar />)

    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('fixed', 'top-0', 'left-0', 'h-full', 'bg-cream', 'shadow-lg', 'flex', 'flex-col', 'transition-all', 'duration-300', 'z-50')

    const toggleButton = screen.getByLabelText('Toggle sidebar')
    expect(toggleButton).toHaveClass('p-4', 'focus:outline-none', 'text-xl', 'text-gray-700', 'hover:text-blue-600')
  })

  it('has proper accessibility attributes', () => {
    render(<Sidebar />)

    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toBeInTheDocument()

    const toggleButton = screen.getByLabelText('Toggle sidebar')
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle sidebar')
  })

  it('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const toggleButton = screen.getByLabelText('Toggle sidebar')
    
    // Focus and press Enter
    toggleButton.focus()
    await user.keyboard('{Enter}')
    
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('w-20') // Should be collapsed
  })

  it('maintains hover effects on navigation items', () => {
    render(<Sidebar />)

    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveClass('hover:bg-blue-100', 'transition-colors')
  })

  it('renders icons for each navigation item', () => {
    render(<Sidebar />)

    // Check if icons are rendered (they should be present as spans with text-2xl class)
    const iconSpans = screen.getAllByText((content, element) => {
      return element?.tagName === 'SPAN' && element?.classList.contains('text-2xl')
    })
    
    // Should have 6 icons (one for each nav item)
    expect(iconSpans).toHaveLength(6)
  })
})
