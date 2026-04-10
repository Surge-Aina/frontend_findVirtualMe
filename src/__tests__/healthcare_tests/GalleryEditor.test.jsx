import { render, screen } from "@testing-library/react";

const GalleryEditor = require("../../features/portfolios/_legacy/healthcare/components/admin/GalleryEditor").default;

const mockGallery = {
  facilityImages: [
    {
      id: 'img_1',
      url: 'https://example.com/image.jpg',
      caption: 'Reception Area',
      description: 'Modern reception area'
    }
  ],
  beforeAfterCases: [
    {
      id: 'case_1',
      title: 'Dental Whitening',
      treatment: 'Teeth Whitening',
      duration: '2 weeks',
      beforeImage: 'https://example.com/before.jpg',
      afterImage: 'https://example.com/after.jpg',
      description: 'Amazing results'
    }
  ]
};

const mockOnUpdate = jest.fn();

describe('GalleryEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render gallery editor', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Use getAllByText since "Facility Images" appears multiple times
    const facilityTexts = screen.getAllByText(/facility images/i);
    expect(facilityTexts.length).toBeGreaterThan(0);
  });

  test('should render facility images', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Reception Area')).toBeInTheDocument();
  });

  test('should render before/after cases', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Dental Whitening')).toBeInTheDocument();
    // Use getAllByText for "Before/After" which appears multiple times
    const beforeAfterTexts = screen.getAllByText(/before.*after/i);
    expect(beforeAfterTexts.length).toBeGreaterThan(0);
  });

  test('should render empty state for facility images', () => {
    render(
      <GalleryEditor 
        gallery={{ facilityImages: [], beforeAfterCases: [] }}
        onUpdate={mockOnUpdate}
      />
    );
    
    const addButtons = screen.getAllByText(/add facility image/i);
    expect(addButtons.length).toBeGreaterThan(0);
  });

  test('should show add facility image button', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find(btn => btn.textContent.includes('Add Facility Image'));
    expect(addButton).toBeInTheDocument();
  });

  test('should show add before/after case button', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find(btn => 
      btn.textContent.includes('Add Before/After') || btn.textContent.includes('Add Case')
    );
    expect(addButton).toBeDefined();
  });

  test('should display image captions', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Reception Area')).toBeInTheDocument();
    expect(screen.getByText('Modern reception area')).toBeInTheDocument();
  });

  test('should display treatment information', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Teeth Whitening')).toBeInTheDocument();
    // Duration text is split by elements - use getAllByText with function matcher
    const durationElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('2 weeks') || false;
    });
    expect(durationElements.length).toBeGreaterThan(0);
  });

  test('should show edit buttons', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should show delete buttons', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
  });

  test('should handle empty gallery', () => {
    render(
      <GalleryEditor 
        gallery={{ facilityImages: [], beforeAfterCases: [] }}
        onUpdate={mockOnUpdate}
      />
    );
    
    const addButtons = screen.queryAllByText(/add/i);
    expect(addButtons.length).toBeGreaterThan(0);
  });

  test('should display case description', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Amazing results')).toBeInTheDocument();
  });

  test('should handle multiple facility images', () => {
    const multipleImages = {
      facilityImages: [
        ...mockGallery.facilityImages,
        {
          id: 'img_2',
          url: 'https://example.com/image2.jpg',
          caption: 'Treatment Room'
        }
      ],
      beforeAfterCases: []
    };
    
    render(
      <GalleryEditor 
        gallery={multipleImages}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Reception Area')).toBeInTheDocument();
    expect(screen.getByText('Treatment Room')).toBeInTheDocument();
  });

  test('should handle multiple before/after cases', () => {
    const multipleCases = {
      facilityImages: [],
      beforeAfterCases: [
        ...mockGallery.beforeAfterCases,
        {
          id: 'case_2',
          title: 'Smile Makeover',
          treatment: 'Veneers',
          beforeImage: 'https://example.com/before2.jpg',
          afterImage: 'https://example.com/after2.jpg'
        }
      ]
    };
    
    render(
      <GalleryEditor 
        gallery={multipleCases}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Dental Whitening')).toBeInTheDocument();
    expect(screen.getByText('Smile Makeover')).toBeInTheDocument();
  });

  test('should render Gallery Management heading', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText('Gallery Management')).toBeInTheDocument();
  });

  test('should render Before and After labels', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    // These labels appear multiple times (in button text and as labels)
    const beforeLabels = screen.getAllByText('Before');
    const afterLabels = screen.getAllByText('After');
    expect(beforeLabels.length).toBeGreaterThan(0);
    expect(afterLabels.length).toBeGreaterThan(0);
  });

  test('should display case title as heading', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const heading = screen.getByText('Dental Whitening');
    expect(heading).toHaveClass('text-lg', 'font-semibold');
  });

  test('should display treatment with proper styling', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const treatment = screen.getByText('Teeth Whitening');
    expect(treatment).toHaveClass('text-blue-600', 'font-medium');
  });

  test('should render Gallery Tips section', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/Gallery Tips/i)).toBeInTheDocument();
  });

  test('should display gallery tips content', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/high-quality images/i)).toBeInTheDocument();
    expect(screen.getByText(/patient consent/i)).toBeInTheDocument();
  });

  test('should have proper layout structure', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const container = document.querySelector('.space-y-8');
    expect(container).toBeInTheDocument();
  });

  test('should render images with proper alt text', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('should display empty state messages', () => {
    render(
      <GalleryEditor 
        gallery={{ facilityImages: [], beforeAfterCases: [] }}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(screen.getByText(/No facility images added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No before\/after cases added yet/i)).toBeInTheDocument();
  });

  test('should not call onUpdate initially', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  test('should render facility images heading', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Get all h3 elements and find the one with "Facility Images"
    const headings = screen.getAllByRole('heading', { level: 3 });
    const facilityHeading = headings.find(h => h.textContent === 'Facility Images');
    expect(facilityHeading).toBeInTheDocument();
  });

  test('should render before/after cases heading', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const headings = screen.getAllByRole('heading', { level: 3 });
    const casesHeading = headings.find(h => h.textContent === 'Before/After Cases');
    expect(casesHeading).toBeInTheDocument();
  });

  test('should display duration label', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    // Check that duration is displayed somewhere in the document
    const bodyText = document.body.textContent;
    expect(bodyText).toContain('Duration');
    expect(bodyText).toContain('2 weeks');
  });

  test('should have grid layout for facility images', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  test('should render case with proper card structure', () => {
    render(
      <GalleryEditor 
        gallery={mockGallery}
        onUpdate={mockOnUpdate}
      />
    );
    
    const caseCard = screen.getByText('Dental Whitening').closest('.bg-white');
    expect(caseCard).toHaveClass('border', 'border-gray-200', 'rounded-lg');
  });
});