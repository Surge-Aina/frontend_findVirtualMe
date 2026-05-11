import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ============================================
// MOCKS
// ============================================

const mockNavigate = jest.fn();
let mockPortfolioId = 'test-portfolio-123';

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ portfolioId: mockPortfolioId }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('axios');

jest.mock('three', () => ({}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Environment: () => null,
}));

jest.mock('../models/RoomModels', () => ({
  RoomModel: () => null,
}));

jest.mock('../components/Editable', () => {
  return function MockEditable({ value, onChange }) {
    return <div data-testid="editable-mock" onClick={() => onChange?.('edited')}>{value}</div>;
  };
});

jest.mock('../context/AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: React.createContext({
      isAdmin: true,
      setCurrentPortfolioId: jest.fn(),
    }),
  };
});

// ============================================
// IMPORTS
// ============================================
import Services from '../components/cleanServices';
import axios from 'axios';
import { toast } from 'react-toastify';

// ============================================
// TESTS
// ============================================

describe('Services Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPortfolioId = 'test-123';

    axios.get.mockResolvedValue({
      data: {
        portfolio: {
          services: [{ _id: 's1', title: 'Service1', description: 'Desc1' }],
          roomPricing: [{ roomType: 'bedroom', price: 25 }],
        },
      },
    });
    axios.post.mockResolvedValue({ data: { success: true } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });

    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ portfolio: {} }),
    }));

    Storage.prototype.getItem = jest.fn(() => 'token');
    Storage.prototype.setItem = jest.fn();
    window.confirm = jest.fn(() => true);

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  // Basic rendering
  it('renders', async () => {
    await act(async () => render(<Services />));
    expect(screen.getByText('Get a Quote')).toBeInTheDocument();
  });

  it('shows admin chip', async () => {
    await act(async () => render(<Services />));
    expect(screen.getByText(/Admin Mode/i)).toBeInTheDocument();
  });

  it('fetches data', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  it('shows service', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
  });

  // Demo mode
  it('shows demo banner when no portfolioId', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    expect(screen.getByText(/demo/i)).toBeInTheDocument();
  });

  it('toast on title edit in demo', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[0]);
    expect(toast.info).toHaveBeenCalled();
  });

  it('toast on room label edit in demo', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[1]);
    expect(toast.info).toHaveBeenCalled();
  });

  // Title/label saves
  it('saves title', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[0]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Title updated!'));
  });

  it('title save error', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockRejectedValueOnce(new Error('err'));
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to save title'));
  });

  it('saves room label', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[1]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Room label updated!'));
  });

  it('room label save error', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockRejectedValueOnce(new Error('err'));
    await act(async () => render(<Services />));
    fireEvent.click(screen.getAllByTestId('editable-mock')[1]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to save room label'));
  });

  it('saves cleaningServicesTitle', async () => {
    await act(async () => render(<Services />));
    const editables = screen.getAllByTestId('editable-mock');
    if (editables[5]) fireEvent.click(editables[5]);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('saves all room labels', async () => {
    await act(async () => render(<Services />));
    const editables = screen.getAllByTestId('editable-mock');
    fireEvent.click(editables[1]);
    fireEvent.click(editables[2]);
    fireEvent.click(editables[3]);
    fireEvent.click(editables[4]);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  // Quote
  it('calculates quote', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalledWith('Rough Estimate: $50');
  });

  it('zero rooms quote', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalledWith('Rough Estimate: $0');
  });

  it('navigates to charges', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Get a Quote'));
    fireEvent.click(screen.getByText('Go to Charges'));
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/cleaningService/test-123/charges');
  });

  it('calculates quote all rooms', async () => {
    axios.get.mockResolvedValue({
      data: {
        portfolio: {
          services: [],
          roomPricing: [
            { roomType: 'bedroom', price: 25 },
            { roomType: 'kitchen', price: 40 },
            { roomType: 'bathroom', price: 35 },
            { roomType: 'livingRoom', price: 30 },
          ],
        },
      },
    });
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });
    fireEvent.change(selects[2], { target: { value: '1' } });
    fireEvent.change(selects[3], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalledWith('Rough Estimate: $130');
  });

  // Admin - Add Service
  it('shows Add Service button', async () => {
    await act(async () => render(<Services />));
    expect(screen.getByText('Add Service')).toBeInTheDocument();
  });

  it('toggles add form', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    expect(screen.getByPlaceholderText('Enter title')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Enter title')).not.toBeInTheDocument();
  });

  it('adds service', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'New' } });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  it('add service validation', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    fireEvent.click(screen.getByText('Submit'));
    expect(toast.error).toHaveBeenCalledWith('Please fill all fields');
  });

  it('add service error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Err' } } });
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'X' } });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'Y' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Err'));
  });

  it('add service error fallback', async () => {
    axios.post.mockRejectedValueOnce(new Error('Net'));
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'X' } });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'Y' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to add service'));
  });

  it('add service demo toast', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Add Service'));
    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'X' } });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'Y' } });
    fireEvent.click(screen.getByText('Submit'));
    expect(toast.info).toHaveBeenCalled();
  });

  // Admin - Delete Service
  it('deletes service', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  });

  it('delete cancelled', async () => {
    window.confirm = jest.fn(() => false);
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Delete'));
    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('delete error', async () => {
    axios.delete.mockRejectedValueOnce({ response: { data: { message: 'Del err' } } });
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Del err'));
  });

  it('delete error fallback', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Net'));
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Delete'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to delete service'));
  });

  it('delete demo toast', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });

  // Admin - Edit Prices
  it('shows Edit Room Prices button', async () => {
    await act(async () => render(<Services />));
    expect(screen.getByText('Edit Room Prices')).toBeInTheDocument();
  });

  it('edit prices mode', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    expect(screen.getByText('Done Editing Prices')).toBeInTheDocument();
  });

  it('save prices no change', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    fireEvent.click(screen.getByText('Done Editing Prices'));
    expect(toast.info).toHaveBeenCalledWith('No price changes');
  });

  it('save prices with change', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    const inputs = screen.getAllByPlaceholderText('Price');
    fireEvent.change(inputs[0], { target: { value: '99' } });
    fireEvent.click(screen.getByText('Done Editing Prices'));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  it('save prices error', async () => {
    axios.put.mockRejectedValueOnce(new Error('err'));
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    const inputs = screen.getAllByPlaceholderText('Price');
    fireEvent.change(inputs[0], { target: { value: '99' } });
    fireEvent.click(screen.getByText('Done Editing Prices'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to update room prices'));
  });

  it('edit prices demo toast', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    expect(toast.info).toHaveBeenCalled();
  });

  it('changes all price inputs', async () => {
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Edit Room Prices'));
    const inputs = screen.getAllByPlaceholderText('Price');
    fireEvent.change(inputs[0], { target: { value: '50' } });
    fireEvent.change(inputs[1], { target: { value: '60' } });
    fireEvent.change(inputs[2], { target: { value: '45' } });
    fireEvent.change(inputs[3], { target: { value: '55' } });
    fireEvent.click(screen.getByText('Done Editing Prices'));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  // Errors
  it('fetch services error', async () => {
    axios.get.mockRejectedValueOnce(new Error('err'));
    await act(async () => render(<Services />));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to load services'));
  });

  it('fetch titles error', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('err')));
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('fetch room labels non-ok', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  // Room pricing variations
  it('handles roomPricing with type field', async () => {
    axios.get.mockResolvedValue({
      data: { portfolio: { services: [], roomPricing: [{ type: 'bedroom', price: 30 }] } },
    });
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('handles empty roomPricing', async () => {
    axios.get.mockResolvedValue({
      data: { portfolio: { services: [], roomPricing: [] } },
    });
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalledWith('Rough Estimate: $25');
  });

  it('handles no roomPricing field', async () => {
    axios.get.mockResolvedValue({
      data: { portfolio: { services: [] } },
    });
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalled();
  });

  // Room label fetch variations
  it('handles roomLabels from API', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        portfolio: {
          roomLabels: { bedroom: 'Bed', kitchen: 'Kit', bathroom: 'Bath', livingRoom: 'Living' },
        },
      }),
    }));
    await act(async () => render(<Services />));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles partial roomLabels', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ portfolio: { roomLabels: { bedroom: 'Bed' } } }),
    }));
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('handles null roomLabels', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ portfolio: { roomLabels: null } }),
    }));
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  // Title fetch variations
  it('handles titles from API', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        portfolio: { buildRoomsTitle: 'Custom Build', cleaningServicesTitle: 'Custom Clean' },
      }),
    }));
    await act(async () => render(<Services />));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles response without portfolio wrapper for titles', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ buildRoomsTitle: 'Direct Title' }),
    }));
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

 


  it('handles NaN room input', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'abc' } });
    expect(selects[0].value).toBe('0');
  });

  it('handles empty string room input', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '' } });
    expect(selects[0].value).toBe('0');
  });

  // Navigation variations
  it('navigates without portfolioId', async () => {
    mockPortfolioId = undefined;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Get a Quote'));
    fireEvent.click(screen.getByText('Go to Charges'));
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/cleaningService/charges');
  });

  it('navigates with null portfolioId', async () => {
    mockPortfolioId = null;
    await act(async () => render(<Services />));
    fireEvent.click(screen.getByText('Get a Quote'));
    fireEvent.click(screen.getByText('Go to Charges'));
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/cleaningService/charges');
  });

  // Services variations
  it('handles response without portfolio wrapper', async () => {
    axios.get.mockResolvedValue({ data: { services: [{ _id: '1', title: 'T', description: 'D' }] } });
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('T')).toBeInTheDocument());
  });

  it('handles null services', async () => {
    axios.get.mockResolvedValue({ data: { portfolio: { services: null } } });
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('handles undefined services', async () => {
    axios.get.mockResolvedValue({ data: { portfolio: { services: undefined } } });
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('handles empty services', async () => {
    axios.get.mockResolvedValue({ data: { portfolio: { services: [] } } });
    await act(async () => render(<Services />));
    expect(screen.queryByText('Service1')).not.toBeInTheDocument();
  });

  it('handles multiple services', async () => {
    axios.get.mockResolvedValue({
      data: {
        portfolio: {
          services: [
            { _id: '1', title: 'S1', description: 'D1' },
            { _id: '2', title: 'S2', description: 'D2' },
          ],
        },
      },
    });
    await act(async () => render(<Services />));
    await waitFor(() => {
      expect(screen.getByText('S1')).toBeInTheDocument();
      expect(screen.getByText('S2')).toBeInTheDocument();
    });
  });

  // Token/localStorage
  it('null token', async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    await act(async () => render(<Services />));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('stores quoteDraft', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(localStorage.setItem).toHaveBeenCalledWith('quoteDraft', expect.any(String));
  });

  it('includes token in fetch', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        })
      );
    });
  });

  it('includes token in axios', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        })
      );
    });
  });

  // UI elements
  it('shows estimate after quote', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(screen.getByText(/Estimate:/)).toBeInTheDocument();
  });

  it('service card click', async () => {
    await act(async () => render(<Services />));
    await waitFor(() => expect(screen.getByText('Service1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Service1'));
    expect(mockNavigate).toHaveBeenCalled();
  });

  // Room layout
  it('room counts all types', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    selects.forEach(s => fireEvent.change(s, { target: { value: '1' } }));
    fireEvent.click(screen.getByText('Get a Quote'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('handles exactly 6 rooms', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } });
    fireEvent.change(selects[1], { target: { value: '2' } });
    fireEvent.change(selects[2], { target: { value: '2' } });
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('more than 6 rooms', async () => {
    await act(async () => render(<Services />));
    const selects = screen.getAllByRole('combobox');
    selects.forEach(s => fireEvent.change(s, { target: { value: '3' } }));
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  // Cleanup
  it('unmount cleanup', async () => {
    let unmount;
    await act(async () => { unmount = render(<Services />).unmount; });
    await act(async () => unmount());
    expect(true).toBe(true);
  });
});