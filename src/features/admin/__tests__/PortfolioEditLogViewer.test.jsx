import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import PortfolioEditLogViewer from '@/features/admin/PortfolioEditLogViewer';

jest.mock('axios');

describe('PortfolioEditLogViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const mockLogs = [
    {
      _id: 'log1',
      timestamp: '2024-01-15T10:30:00Z',
      action: 'created',
      userId: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      portfolioID: 'portfolio1',
      portfolioType: 'handyman',
      sessionId: 'session123',
      mouseInfo: [
        {
          x: 100,
          y: 200,
          event: 'click',
          element: 'BUTTON#save-btn.btn.primary',
          timestamp: '2024-01-15T10:30:05Z',
        },
        {
          x: 150,
          y: 250,
          event: 'hover',
          element: 'DIV.container',
          timestamp: '2024-01-15T10:30:10Z',
        },
      ],
    },
    {
      _id: 'log2',
      timestamp: '2024-01-15T11:00:00Z',
      action: 'updated',
      userId: 'user456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      portfolioID: 'portfolio2',
      portfolioType: 'photographer',
      sessionId: 'session456',
      mouseInfo: [],
    },
    {
      _id: 'log3',
      timestamp: '2024-01-15T12:00:00Z',
      action: 'deleted',
      userId: 'user789',
      name: null,
      email: null,
      portfolioID: 'portfolio3',
      portfolioType: 'vendor',
      sessionId: 'session789',
      mouseInfo: [
        {
          x: 200,
          y: 300,
          event: 'move',
          element: 'INPUT.text-field',
          timestamp: '2024-01-15T12:00:05Z',
        },
      ],
    },
  ];

  describe('Initial Load', () => {
    test('displays loading state initially', async () => {
      axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<PortfolioEditLogViewer />);

      expect(screen.getByText('Loading logs...')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Edit Logs')).toBeInTheDocument();
    });

    test('fetches and displays logs on mount', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/portfolios/edit-log?page=1&limit=50'),
          expect.objectContaining({ headers: {} })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('user789')).toBeInTheDocument();
      });
    });

    test('displays empty state when no logs found', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: [],
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('No logs found')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {

    test('displays filter dropdown with all options', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.queryByText('Loading logs...')).not.toBeInTheDocument();
      });

      // Use getByRole to find the select element
      const filterSelect = screen.getByRole('combobox');
      expect(filterSelect).toBeInTheDocument();
      expect(within(filterSelect).getByText('All Logs')).toBeInTheDocument();
      expect(within(filterSelect).getByText('By User ID')).toBeInTheDocument();
      expect(within(filterSelect).getByText('By Portfolio ID')).toBeInTheDocument();
      expect(within(filterSelect).getByText('By Session ID')).toBeInTheDocument();
    });

    test('shows input field when filter type is not "all"', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.queryByText('Loading logs...')).not.toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(filterSelect, 'userId');

      expect(screen.getByText('User ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter userId')).toBeInTheDocument();
    });

    test('filters by userId when filter is applied', async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.queryByText('Loading logs...')).not.toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(filterSelect, 'userId');

      const input = screen.getByPlaceholderText('Enter userId');
      await userEvent.type(input, 'user123');

      const searchButton = screen.getByText('Search');
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/portfolios/edit-log/user/user123'),
          expect.any(Object)
        );
      });
    });

  });

  describe('Log Display', () => {
    beforeEach(() => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });
    });

    test('displays all log columns correctly', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Type')).toBeInTheDocument();
      expect(screen.getByText('Session ID')).toBeInTheDocument();
      expect(screen.getByText('Mouse Events')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    test('displays action badges with correct colors', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('created')).toBeInTheDocument();
      });

      const createdBadge = screen.getByText('created');
      expect(createdBadge).toHaveClass('bg-green-100', 'text-green-800');

      const updatedBadge = screen.getByText('updated');
      expect(updatedBadge).toHaveClass('bg-blue-100', 'text-blue-800');

      const deletedBadge = screen.getByText('deleted');
      expect(deletedBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    test('displays user information correctly', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // User with name and email
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();

      // User with only userId
      expect(screen.getByText('user789')).toBeInTheDocument();
    });

    test('displays portfolio type', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('handyman')).toBeInTheDocument();
      });

      expect(screen.getByText('photographer')).toBeInTheDocument();
      expect(screen.getByText('vendor')).toBeInTheDocument();
    });

    test('displays session ID', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('session123')).toBeInTheDocument();
      });

      expect(screen.getByText('session456')).toBeInTheDocument();
      expect(screen.getByText('session789')).toBeInTheDocument();
    });

    test('displays mouse events count', async () => {
      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('2 events')).toBeInTheDocument();
      });

      expect(screen.getByText('0 events')).toBeInTheDocument();
      expect(screen.getByText('1 events')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    test('does not display pagination when totalPages = 1', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.queryByText('Page 1 of 1')).not.toBeInTheDocument();
      });
    });

    test('navigates to previous page', async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 3,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Go to page 2 first
      const nextButton = screen.getByText('Next');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Previous')).not.toBeDisabled();
      });

      const prevButton = screen.getByText('Previous');
      await userEvent.click(prevButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });

    test('disables Previous button on first page', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 3,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
      });
    });

    test('disables Next button on last page', async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 3,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });

      // Navigate to page 2
      let nextButton = screen.getByText('Next');
      await userEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Navigate to page 3 (last page)
      nextButton = screen.getByText('Next');
      await userEvent.click(nextButton);
      
      // Wait for page 3 to be displayed and Next button to be disabled
      await waitFor(() => {
        const pageText = screen.getByText('Page 3 of 3');
        expect(pageText).toBeInTheDocument();
        
        const nextButtonOnLastPage = screen.getByText('Next');
        expect(nextButtonOnLastPage).toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API call fails', async () => {
      const errorMessage = 'Failed to fetch logs';
      axios.get.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('displays generic error message when error has no response', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('displays default error message when error has no message', async () => {
      axios.get.mockRejectedValueOnce({});

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch logs')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    test('includes Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token-123');
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer test-token-123',
            },
          })
        );
      });
    });

    test('does not include Authorization header when token is missing', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {},
          })
        );
      });
    });
  });

  describe('Date Formatting', () => {
    test('formats dates correctly', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: [mockLogs[0]],
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        // The date should be formatted, check for parts of the formatted date
        const dateText = screen.getByText(/Jan|January/);
        expect(dateText).toBeInTheDocument();
      });
    });

    test('displays N/A for missing timestamp', async () => {
      const logWithoutTimestamp = {
        ...mockLogs[0],
        timestamp: null,
      };

      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: [logWithoutTimestamp],
          totalPages: 1,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty mouseInfo array', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          logs: [mockLogs[1]], // This log has empty mouseInfo
          totalPages: 1,
      },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('0 events')).toBeInTheDocument();
      });

      const viewButton = screen.getByText('View');
      await userEvent.click(viewButton);

      await waitFor(() => {
        // Table header "Mouse Events" column should still be visible in the main table
        expect(screen.getByText('Mouse Events')).toBeInTheDocument();
        
        // Log details should be expanded
        expect(screen.getByText('Log Details')).toBeInTheDocument();
        
        // But the mouse events details section should not be rendered in expanded view
        // (it only shows when mouseInfo.length > 0)
        // The label "Mouse Events (X)" should not be present in expanded details
        const mouseEventsWithCount = screen.queryByText(/Mouse Events \(\d+\)/);
        expect(mouseEventsWithCount).not.toBeInTheDocument();
      });
    });

    test('refetches logs when page changes', async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          logs: mockLogs,
          totalPages: 2,
        },
      });

      render(<PortfolioEditLogViewer />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenLastCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

  });
});

