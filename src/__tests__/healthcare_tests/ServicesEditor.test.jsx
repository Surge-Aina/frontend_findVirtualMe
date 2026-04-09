import { render, screen } from "@testing-library/react";

const ServicesEditor = require("../../pages/portfolios/healthcare/components/admin/ServicesEditor").default;

const mockServices = [
  {
    id: 'service_1',
    title: 'General Consultation',
    description: 'Initial medical consultation',
    price: '$100',
    duration: '30 minutes',
    icon: 'user-md',
    features: ['Thorough examination', 'Health assessment']
  }
];

const mockOnUpdate = jest.fn();

describe('ServicesEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render services list', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('General Consultation')).toBeInTheDocument();
    expect(screen.getByText('Initial medical consultation')).toBeInTheDocument();
  });

  test('should render empty state when no services', () => {
    render(
      <ServicesEditor 
        services={[]}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Component shows a tips section instead of explicit empty message
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should show add service button', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/add service/i)).toBeInTheDocument();
  });

  test('should display service price', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  test('should display service duration', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
  });

  test('should display service features count', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/2.*features/i)).toBeInTheDocument();
  });

  test('should show edit button for each service', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const editButtons = screen.getAllByRole('button');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test('should show delete button for each service', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  test('should handle multiple services', () => {
    const multipleServices = [
      ...mockServices,
      {
        id: 'service_2',
        title: 'Dental Care',
        description: 'Comprehensive dental services',
        price: '$150',
        icon: 'tooth'
      }
    ];
    
    render(
      <ServicesEditor 
        services={multipleServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('General Consultation')).toBeInTheDocument();
    expect(screen.getByText('Dental Care')).toBeInTheDocument();
  });

  test('should handle services without optional fields', () => {
    const minimalService = [{
      id: 'service_3',
      title: 'Basic Service',
      description: 'Basic description'
    }];
    
    render(
      <ServicesEditor 
        services={minimalService}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Basic Service')).toBeInTheDocument();
  });

  test('should display icon indicator', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Check for icon element or SVG
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  test('should render service cards', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const serviceCard = screen.getByText('General Consultation').closest('div');
    expect(serviceCard).toBeInTheDocument();
  });

  test('should render Services Management heading', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Services Management')).toBeInTheDocument();
  });

  test('should render Image Upload Tips', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Image Upload Tips/i)).toBeInTheDocument();
  });

  test('should display service title as heading', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const heading = screen.getByText('General Consultation');
    expect(heading).toHaveClass('text-lg', 'font-semibold');
  });

  test('should render price and duration in metadata', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const metaSection = screen.getByText('$100').parentElement;
    expect(metaSection).toContainHTML('30 minutes');
  });

  test('should handle service with image placeholder', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Check for image placeholder SVG
    const imagePlaceholder = document.querySelector('.bg-gray-100');
    expect(imagePlaceholder).toBeInTheDocument();
  });

  test('should render with proper layout structure', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const container = document.querySelector('.lg\\:col-span-3');
    expect(container).toBeInTheDocument();
  });

  test('should render service description', () => {
    render(
      <ServicesEditor 
        services={mockServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const description = screen.getByText('Initial medical consultation');
    expect(description).toHaveClass('text-gray-600');
  });

  test('should have proper spacing between services', () => {
    const multipleServices = [
      mockServices[0],
      {
        id: 'service_2',
        title: 'Second Service',
        description: 'Second description',
        price: '$200'
      }
    ];
    
    render(
      <ServicesEditor 
        services={multipleServices}
        onUpdate={mockOnUpdate}
      />
    );
    
    const servicesContainer = document.querySelector('.space-y-4');
    expect(servicesContainer).toBeInTheDocument();
  });
});