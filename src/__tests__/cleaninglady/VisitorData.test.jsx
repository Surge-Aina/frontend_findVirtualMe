import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VisitorsData from '../../pages/portfolios/cleaningService/components/VisitorData';

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ portfolioId: 'test-portfolio-123' }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockVisitors = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@test.com',
    phone: '123-456-7890',
    loyaltyPoints: 50
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@test.com',
    phone: '098-765-4321',
    loyaltyPoints: 100
  }
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <VisitorsData />
    </BrowserRouter>
  );
};

describe('VisitorData Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    fetch.mockClear();
  });

  describe('Initial Rendering and Data Fetching', () => {
    it('should show loading state initially', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderComponent();
      
      expect(screen.getByText(/Loading visitors data/i)).toBeInTheDocument();
    });

    it('should fetch and display visitors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display visitor email addresses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('should display loyalty points', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should show error message when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to load' })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should show message when no visitors exist', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/No visitors yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should redirect to portfolio when no token', () => {
      localStorage.removeItem('token');
      
      renderComponent();
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/test-portfolio-123/about'
      );
    });

    it('should include token in fetch headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('getAllUsers'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-token'
            })
          })
        );
      });
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });
    });

    it('should show edit button for each visitor', async () => {
      renderComponent();

      await waitFor(() => {
        const editButtons = screen.getAllByText(/Edit/i);
        expect(editButtons.length).toBe(2);
      });
    });

    it('should show input fields when edit is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });

    it('should show save and cancel buttons when editing', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      expect(screen.getByText(/Save/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('should allow changing email', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const emailInput = screen.getByDisplayValue('john@test.com');
      fireEvent.change(emailInput, { target: { value: 'newemail@test.com' } });

      expect(screen.getByDisplayValue('newemail@test.com')).toBeInTheDocument();
    });

    it('should allow changing phone', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const phoneInput = screen.getByDisplayValue('123-456-7890');
      fireEvent.change(phoneInput, { target: { value: '555-555-5555' } });

      expect(screen.getByDisplayValue('555-555-5555')).toBeInTheDocument();
    });

    it('should allow changing loyalty points', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const pointsInput = screen.getByDisplayValue('50');
      fireEvent.change(pointsInput, { target: { value: '75' } });

      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });

    it('should cancel edit and restore original values', async () => {
      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const emailInput = screen.getByDisplayValue('john@test.com');
      fireEvent.change(emailInput, { target: { value: 'newemail@test.com' } });

      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('newemail@test.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });
    });

    it('should save changes successfully', async () => {
      const updatedVisitor = {
        ...mockVisitors[0],
        email: 'updated@test.com'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedVisitor })
      });

      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const emailInput = screen.getByDisplayValue('john@test.com');
      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/editUser/1'),
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('updated@test.com')
          })
        );
      });
    });

    it('should show alert on save failure', async () => {
      global.alert = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: 'Update failed' })
      });

      renderComponent();

      await waitFor(() => {
        const editButton = screen.getAllByText(/Edit/i)[0];
        fireEvent.click(editButton);
      });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Update failed'));
      });
    });
  });

  describe('Back Navigation', () => {
    it('should show back to portfolio button', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Back to Portfolio/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to portfolio on button click', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        const backButton = screen.getByText(/Back to Portfolio/i);
        fireEvent.click(backButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/test-portfolio-123/about'
      );
    });
  });

  describe('Table Structure', () => {
    it('should render table headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Phone')).toBeInTheDocument();
        expect(screen.getByText('Loyalty Points')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    it('should render correct number of rows', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisitors })
      });

      renderComponent();

      await waitFor(() => {
        const rows = document.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(2);
      });
    });
  });
});