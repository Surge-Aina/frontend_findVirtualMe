import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../pages/portfolios/cleaningService/components/cleanNavbar';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ portfolioId: 'test-portfolio-123' }),
}));

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdAccountCircle: () => <div data-testid="account-icon">Account</div>,
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render navigation links', () => {
      renderNavbar();
      
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should display initials circle', () => {
      renderNavbar();
      
      const initialsCircle = document.querySelector('.initials-circle');
      expect(initialsCircle).toBeInTheDocument();
    });

    it('should display account icon', () => {
      renderNavbar();
      
      expect(screen.getByTestId('account-icon')).toBeInTheDocument();
    });
  });

  describe('Visitor Authentication', () => {
    it('should show sign in/sign up options when not logged in', () => {
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

    it('should show visitor name when logged in', () => {
      localStorage.setItem('visitor', JSON.stringify({ name: 'John Doe' }));
      localStorage.setItem('visitorToken', 'fake-token');
      
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
    });

    it('should show logout option when logged in', () => {
      localStorage.setItem('visitor', JSON.stringify({ name: 'John Doe' }));
      localStorage.setItem('visitorToken', 'fake-token');
      
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
    });

    it('should handle visitor logout', () => {
      // Set up localStorage with data
      localStorage.setItem('visitor', JSON.stringify({ name: 'John Doe' }));
      localStorage.setItem('visitorToken', 'fake-token');
      
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      const logoutBtn = screen.getByText(/Log Out/i);
      fireEvent.click(logoutBtn);
      
      // Check that items were removed
      expect(localStorage.getItem('visitor')).toBeNull();
      expect(localStorage.getItem('visitorToken')).toBeNull();
    });
  });

  describe('Owner Features', () => {
    it('should show visitors toggle when user is owner', () => {
      localStorage.setItem('userPortfolios', JSON.stringify(['test-portfolio-123']));
      
      renderNavbar();
      
      const toggle = document.querySelector('.toggle-switch');
      expect(toggle).toBeInTheDocument();
    });

    it('should not show visitors toggle when user is not owner', () => {
      localStorage.setItem('userPortfolios', JSON.stringify(['different-portfolio-id']));
      
      renderNavbar();
      
      const toggle = document.querySelector('.toggle-switch');
      expect(toggle).not.toBeInTheDocument();
    });

    it('should toggle visitors tab visibility', () => {
      localStorage.setItem('userPortfolios', JSON.stringify(['test-portfolio-123']));
      
      renderNavbar();
      
      const toggleInput = document.querySelector('input[type="checkbox"]');
      fireEvent.click(toggleInput);
      
      // Check the value was set (not using toHaveBeenCalledWith)
      expect(localStorage.getItem('showVisitors_test-portfolio-123')).toBe('true');
    });

    it('should show Visitors link when toggle is on', () => {
      localStorage.setItem('userPortfolios', JSON.stringify(['test-portfolio-123']));
      localStorage.setItem('showVisitors_test-portfolio-123', 'true');
      
      renderNavbar();
      
      // Use getAllByText and check that at least one exists
      const visitorsLinks = screen.getAllByText('Visitors');
      expect(visitorsLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown Menu', () => {
    it('should open dropdown on account icon click', () => {
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      const dropdown = document.querySelector('.dropdown-menu');
      expect(dropdown).toBeInTheDocument();
    });

    it('should close dropdown on close button click', () => {
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      const closeBtn = screen.getByText('×');
      fireEvent.click(closeBtn);
      
      const dropdown = document.querySelector('.dropdown-menu');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to sign in page', () => {
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      const signInBtn = screen.getByText(/Sign In/i);
      fireEvent.click(signInBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/test-portfolio-123/visitor-login'
      );
    });

    it('should navigate to sign up page', () => {
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      const signUpBtn = screen.getByText(/Sign Up/i);
      fireEvent.click(signUpBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/test-portfolio-123/visitor-signup'
      );
    });
  });

  describe('Demo Mode', () => {
    it('should show demo mode message when no portfolioId', () => {
      jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({});
      
      renderNavbar();
      
      const accountIcon = screen.getByTestId('account-icon');
      fireEvent.click(accountIcon);
      
      expect(screen.getByText(/Visitor login available on published portfolios only/i))
        .toBeInTheDocument();
    });
  });
});