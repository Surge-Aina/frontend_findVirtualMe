/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaHospital: () => <span data-testid="icon-hospital">Hospital</span>,
  FaRocket: () => <span data-testid="icon-rocket">Rocket</span>,
  FaCheck: () => <span data-testid="icon-check">Check</span>,
  FaQuoteLeft: () => <span data-testid="icon-quote">Quote</span>,
  FaUserMd: () => <span data-testid="icon-usermd">UserMd</span>,
  FaHeart: () => <span data-testid="icon-heart">Heart</span>,
  FaEdit: () => <span data-testid="icon-edit">Edit</span>,
  FaPalette: () => <span data-testid="icon-palette">Palette</span>,
  FaFileAlt: () => <span data-testid="icon-file">File</span>,
  FaImages: () => <span data-testid="icon-images">Images</span>,
  FaEnvelope: () => <span data-testid="icon-envelope">Envelope</span>,
  FaSearch: () => <span data-testid="icon-search">Search</span>,
}));

const Landing = require('../pages/Landing').default;

const renderLanding = () => {
  return render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
};

describe('Healthcare Landing Page', () => {
  test('should render main heading', () => {
    renderLanding();
    
    expect(screen.getByText(/Build Your Practice Website/i)).toBeInTheDocument();
  });

  test('should render The Easy Way subheading', () => {
    renderLanding();
    
    expect(screen.getByText(/The Easy Way/i)).toBeInTheDocument();
  });

  test('should render Get Started Free button', () => {
    renderLanding();
    
    expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
  });

  test('should render Sign In button', () => {
    renderLanding();
    
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  test('should render Powerful Tools heading', () => {
    renderLanding();
    
    expect(screen.getByText(/Powerful Tools, Zero Hassle/i)).toBeInTheDocument();
  });

  test('should render features', () => {
    renderLanding();
    
    expect(screen.getByText(/Easy Content Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Branding/i)).toBeInTheDocument();
    expect(screen.getByText(/Blog & Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient Gallery/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Forms/i)).toBeInTheDocument();
    expect(screen.getByText(/SEO Optimized/i)).toBeInTheDocument();
  });

  test('should render testimonials section', () => {
    renderLanding();
    
    expect(screen.getByText(/Trusted by Professionals/i)).toBeInTheDocument();
  });

  test('should render testimonial quotes', () => {
    renderLanding();
    
    expect(screen.getByText(/Our new website was up in hours/i)).toBeInTheDocument();
  });

  test('should render CTA section', () => {
    renderLanding();
    
    expect(screen.getByText(/Ready to Launch Your Practice Online/i)).toBeInTheDocument();
  });

  test('should render Create My Website Now button', () => {
    renderLanding();
    
    expect(screen.getByText(/Create My Website Now/i)).toBeInTheDocument();
  });

  test('should render View Live Demo button', () => {
    renderLanding();
    
    expect(screen.getByText(/View Live Demo/i)).toBeInTheDocument();
  });

  test('should render feature descriptions', () => {
    renderLanding();
    
    expect(screen.getByText(/Update services, hours, and staff info instantly/i)).toBeInTheDocument();
  });
});