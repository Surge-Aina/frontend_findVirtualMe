import { render, screen } from "@testing-library/react";
import { BrowserRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ practiceId: 'practice_123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock("../lib/api", () => ({
  api: {
    getPracticeData: jest.fn()
  }
}));

const Services = require("../pages/Services").default;
const { api } = require("../lib/api");

const mockUserData = {
  practiceId: 'practice_123',
  practice: { name: 'Test Clinic' },
  services: [
    {
      id: 'service_1',
      title: 'General Consultation',
      description: 'Initial medical consultation',
      price: '$100',
      features: ['Thorough examination', 'Health assessment']
    }
  ]
};

describe('Healthcare Services Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render services grid', async () => {
    api.getPracticeData.mockResolvedValue(mockUserData);
    
    render(
      <BrowserRouter>
        <Services />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('General Consultation')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});