import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../lib/api", () => ({
  api: {
    uploadImageToS3: jest.fn(),
  },
}));

const { api } = require("../lib/api");
const GalleryEditor = require("../components/admin/GalleryEditor").default;

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

  describe("stateful interactions", () => {
    function GalleryHarness({ initial }) {
      const [g, setG] = useState(initial);
      return <GalleryEditor gallery={g} onUpdate={setG} />;
    }

    beforeEach(() => {
      window.confirm = jest.fn(() => true);
      jest.clearAllMocks();
    });

    test("add facility image opens edit form with caption field", async () => {
      const user = userEvent.setup();
      render(
        <GalleryHarness initial={{ facilityImages: [], beforeAfterCases: [] }} />
      );
      await user.click(screen.getByRole("button", { name: /add facility image/i }));
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Image caption")).toBeInTheDocument();
      });
    });

    test("upload facility image calls api.uploadImageToS3", async () => {
      api.uploadImageToS3.mockResolvedValue("https://cdn.example/facility.jpg");
      const user = userEvent.setup();
      render(
        <GalleryHarness initial={{ facilityImages: [], beforeAfterCases: [] }} />
      );
      await user.click(screen.getByRole("button", { name: /add facility image/i }));
      const file = new File(["x"], "f.png", { type: "image/png" });
      fireEvent.change(document.querySelector('input[type="file"]'), {
        target: { files: [file] },
      });
      await waitFor(() => expect(api.uploadImageToS3).toHaveBeenCalledWith(file));
    });

    test("deleting facility image updates gallery when confirmed", async () => {
      const user = userEvent.setup();
      const initial = {
        facilityImages: [
          { url: "https://example.com/a.jpg", caption: "A", description: "d" },
        ],
        beforeAfterCases: [],
      };
      const { container } = render(<GalleryHarness initial={initial} />);
      const deleteBtn = container.querySelector("button.text-red-600");
      await user.click(deleteBtn);
      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByText("A")).not.toBeInTheDocument();
      });
    });

    test("does not delete facility image when confirm is cancelled", async () => {
      window.confirm = jest.fn(() => false);
      const user = userEvent.setup();
      const initial = {
        facilityImages: [
          { url: "https://example.com/a.jpg", caption: "KeepMe", description: "d" },
        ],
        beforeAfterCases: [],
      };
      const { container } = render(<GalleryHarness initial={initial} />);
      await user.click(container.querySelector("button.text-red-600"));
      expect(screen.getByText("KeepMe")).toBeInTheDocument();
    });

    test("add before/after case opens edit form with case title field", async () => {
      const user = userEvent.setup();
      render(<GalleryHarness initial={{ facilityImages: [], beforeAfterCases: [] }} />);
      await user.click(screen.getByRole("button", { name: /add before\/after case/i }));
      expect(screen.getByPlaceholderText("Case title")).toBeInTheDocument();
    });

    test("editing facility caption calls onUpdate with merged gallery", async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      const initial = {
        facilityImages: [{ url: "https://example.com/a.jpg", caption: "Old", description: "" }],
        beforeAfterCases: [],
      };
      render(<GalleryEditor gallery={initial} onUpdate={onUpdate} />);
      const card = screen.getByText("Old").closest(".bg-white");
      await user.click(card.querySelector("button.text-blue-600"));
      const caption = screen.getByPlaceholderText("Image caption");
      fireEvent.change(caption, { target: { value: "NewCap" } });
      expect(onUpdate).toHaveBeenCalled();
      const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(last.facilityImages[0].caption).toBe("NewCap");
    });

    test("upload before image on case calls uploadImageToS3 and updates case field", async () => {
      api.uploadImageToS3.mockResolvedValue("https://cdn.example/before.png");
      const user = userEvent.setup();
      render(<GalleryHarness initial={{ facilityImages: [], beforeAfterCases: [] }} />);
      await user.click(screen.getByRole("button", { name: /add before\/after case/i }));
      const file = new File(["x"], "b.png", { type: "image/png" });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBeGreaterThan(0);
      fireEvent.change(fileInputs[0], { target: { files: [file] } });
      await waitFor(() => expect(api.uploadImageToS3).toHaveBeenCalledWith(file));
    });

    test("save on new facility dismisses cancel without deleting when not isAddingFacility", async () => {
      window.confirm = jest.fn();
      const user = userEvent.setup();
      const initial = {
        facilityImages: [{ url: "https://example.com/a.jpg", caption: "Keep", description: "" }],
        beforeAfterCases: [],
      };
      render(<GalleryEditor gallery={initial} onUpdate={mockOnUpdate} />);
      const card = screen.getByText("Keep").closest(".bg-white");
      await user.click(card.querySelector("button.text-blue-600"));
      const cancelButtons = screen.getAllByRole("button", { name: /cancel/i });
      await user.click(cancelButtons[0]);
      expect(window.confirm).not.toHaveBeenCalled();
      expect(screen.getByText("Keep")).toBeInTheDocument();
    });
  });
});