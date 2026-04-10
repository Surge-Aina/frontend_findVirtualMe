import { render, screen } from "@testing-library/react";
import { BrowserRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ practiceId: 'practice_123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock("../../features/portfolios/_legacy/healthcare/lib/api", () => ({
  api: {
    getPracticeData: jest.fn()
  }
}));

const Contact = require("../../features/portfolios/_legacy/healthcare/pages/Contact").default;
const { api } = require("../../features/portfolios/_legacy/healthcare/lib/api");

const mockUserData = {
  practiceId: 'practice_123',
  practice: { name: 'Test Clinic' },
  contact: {
    phone: '+1234567890',
    email: 'test@clinic.com',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    }
  }
};

describe('Healthcare Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render contact information', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('test@clinic.com')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should render contact form', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should allow filling out the form', async () => {
    const user = userEvent.setup();
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByPlaceholderText(/your name/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/your@email.com/i), 'john@test.com');
    
    // Verify inputs were filled
    expect(screen.getByPlaceholderText(/your name/i)).toHaveValue('John Doe');
    expect(screen.getByPlaceholderText(/your@email.com/i)).toHaveValue('john@test.com');
  });
});