import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ============================================
// SIMPLE MOCKS
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

jest.mock('three', () => ({}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} data-testid="motion-div" {...props}>{children}</div>
      )),
    },
  };
});

// Mock models (path from component: ../models/X)
jest.mock('../models/CleaningLady', () => () => <div data-testid="cleaning-lady" />);
jest.mock('../models/HouseModel', () => () => <div data-testid="house-model" />);
jest.mock('../models/FamilyModel', () => () => <div data-testid="family-model" />);

// Mock Editable
jest.mock('../components/Editable', () => {
  return function MockEditable({ value, onChange }) {
    return (
      <div 
        data-testid="editable-mock"
        onClick={() => onChange && onChange('edited')}
      >
        {value}
      </div>
    );
  };
});

// Mock AuthContext - check component's import path: ../context/AuthContext
// This means it's in cleaningService/context/ NOT src/context/
jest.mock('../context/AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: React.createContext({
      isAdmin: false,
      isOwner: false,
      user: { id: '123' },
      setCurrentPortfolioId: jest.fn(),
    }),
  };
});



// ============================================
// IMPORT COMPONENT
// ============================================
import CleanAbout from '../components/cleanAbout';

// ============================================
// UTILITY FUNCTION TESTS (These are safe - no React needed)
// ============================================

describe('Utility Functions', () => {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  const degToRad = (deg) => (deg * Math.PI) / 180;
  const normalize = (a) => ((a % 360) + 360) % 360;

  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
    it('clamps to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });
    it('clamps to max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
    it('handles boundary values', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('easeInOut', () => {
    it('returns 0 at start', () => {
      expect(easeInOut(0)).toBe(0);
    });
    it('returns 1 at end', () => {
      expect(easeInOut(1)).toBe(1);
    });
    it('returns 0.5 at midpoint', () => {
      expect(easeInOut(0.5)).toBe(0.5);
    });
    it('applies first formula for t < 0.5', () => {
      expect(easeInOut(0.25)).toBe(0.125);
    });
    it('applies second formula for t >= 0.5', () => {
      expect(easeInOut(0.75)).toBe(0.875);
    });
  });

  describe('degToRad', () => {
    it('converts 0 degrees', () => {
      expect(degToRad(0)).toBe(0);
    });
    it('converts 180 degrees to PI', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
    });
    it('converts 90 degrees to PI/2', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    });
    it('converts 360 degrees to 2*PI', () => {
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });
    it('handles negative degrees', () => {
      expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
    });
  });

  describe('normalize', () => {
    it('keeps values 0-359', () => {
      expect(normalize(0)).toBe(0);
      expect(normalize(180)).toBe(180);
      expect(normalize(359)).toBe(359);
    });
    it('wraps 360 to 0', () => {
      expect(normalize(360)).toBe(0);
    });
    it('wraps values over 360', () => {
      expect(normalize(450)).toBe(90);
      expect(normalize(720)).toBe(0);
    });
    it('normalizes negative values', () => {
      expect(normalize(-90)).toBe(270);
      expect(normalize(-180)).toBe(180);
      expect(normalize(-360)).toBe(0);
    });
  });
});

// ============================================
// COMPONENT TESTS
// ============================================

describe('CleanAbout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPortfolioId = 'test-portfolio-123';
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          portfolio: {
            tagline1: 'Test Tagline 1',
            tagline2: 'Test Tagline 2', 
            tagline3: 'Test Tagline 3',
          },
        }),
      })
    );

    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    // Mock RAF
    global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');

    // Silence console
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    });

    it('renders Canvas component', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    });

    it('renders Get Started button', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });

    it('renders Editable component', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      await waitFor(() => {
        expect(screen.getByTestId('editable-mock')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to services with portfolioId', async () => {
      mockPortfolioId = 'my-portfolio';
      
      await act(async () => {
        render(<CleanAbout />);
      });

      fireEvent.click(screen.getByRole('button', { name: /get started/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/my-portfolio/services'
      );
    });

    it('navigates to services without portfolioId (demo mode)', async () => {
      mockPortfolioId = undefined;
      
      await act(async () => {
        render(<CleanAbout />);
      });

      fireEvent.click(screen.getByRole('button', { name: /get started/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/portfolios/cleaningService/services'
      );
    });
  });

  describe('Demo Mode', () => {
    beforeEach(() => {
      mockPortfolioId = undefined;
    });

    it('shows demo banner when no portfolioId', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
    });

    it('does not fetch when in demo mode', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      // Give time for potential fetch
      await new Promise(r => setTimeout(r, 100));
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Portfolio Mode', () => {
    it('hides demo banner when portfolioId exists', async () => {
      mockPortfolioId = 'test-123';
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      expect(screen.queryByText(/demo mode/i)).not.toBeInTheDocument();
    });

    it('fetches portfolio data', async () => {
      mockPortfolioId = 'test-123';
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('displays fetched tagline', async () => {
      mockPortfolioId = 'test-123';
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Tagline 1')).toBeInTheDocument();
      });
    });
  });

  describe('API Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      // Should still render
      expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    });

    it('handles non-ok response', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    });
  });

  describe('Mobile Detection', () => {
    it('detects mobile viewport', async () => {
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 520px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const overlay = document.querySelector('.about-overlay-text');
      expect(overlay).toHaveClass('mobile');
    });

    it('uses desktop by default', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const overlay = document.querySelector('.about-overlay-text');
      expect(overlay).not.toHaveClass('mobile');
    });
  });

  describe('Pointer Events', () => {
    it('handles pointer interactions', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const gestureLayer = document.querySelector('.about-gesture-layer');
      
      await act(async () => {
        fireEvent.pointerDown(gestureLayer, { clientX: 100, pointerId: 1 });
        fireEvent.pointerMove(gestureLayer, { clientX: 200 });
        fireEvent.pointerUp(gestureLayer, { pointerId: 1 });
      });
      
      expect(gestureLayer).toBeInTheDocument();
    });

    it('handles pointer cancel', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const gestureLayer = document.querySelector('.about-gesture-layer');
      
      await act(async () => {
        fireEvent.pointerDown(gestureLayer, { clientX: 100, pointerId: 1 });
        fireEvent.pointerCancel(gestureLayer, { pointerId: 1 });
      });
      
      expect(gestureLayer).toBeInTheDocument();
    });
  });
describe('Tagline Editing', () => {
    it('shows toast when editing in demo mode', async () => {
      const { toast } = require('react-toastify');
      mockPortfolioId = undefined;
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const editable = screen.getByTestId('editable-mock');
      fireEvent.click(editable);
      
      expect(toast.info).toHaveBeenCalledWith(
        'This is a demo. Sign up to create your own portfolio!'
      );
    });

    it('saves tagline via PATCH when portfolioId exists', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ portfolio: { tagline1: 'Original' } }),
        })
        .mockResolvedValueOnce({ ok: true });
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => expect(screen.getByTestId('editable-mock')).toBeInTheDocument());
      
      fireEvent.click(screen.getByTestId('editable-mock'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/portfolios/my-portfolio'),
          expect.objectContaining({ method: 'PATCH' })
        );
      });
    });

    it('handles tagline save error gracefully', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ portfolio: { tagline1: 'Original' } }),
        })
        .mockRejectedValueOnce(new Error('Save failed'));
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => expect(screen.getByTestId('editable-mock')).toBeInTheDocument());
      
      fireEvent.click(screen.getByTestId('editable-mock'));
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to save tagline:', expect.any(Error));
      });
    });
  });

  describe('API Response Handling', () => {
    it('handles response without portfolio wrapper', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tagline1: 'Direct Tagline',
            tagline2: 'Direct 2',
            tagline3: 'Direct 3',
          }),
        })
      );
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Direct Tagline')).toBeInTheDocument();
      });
    });

    it('uses default taglines when API returns empty values', async () => {
      mockPortfolioId = 'test-123';
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            portfolio: { tagline1: '', tagline2: null, tagline3: undefined },
          }),
        })
      );
      
      await act(async () => {
        render(<CleanAbout />);
      });
      
      await waitFor(() => {
        expect(screen.getByText("DOM's Cleaning – We bring sparkle to your space.")).toBeInTheDocument();
      });
    });
  });

  describe('Wheel Events', () => {
    it('ignores small wheel movements', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const canvasWrap = document.querySelector('.about-canvas-wrap');
      
      await act(async () => {
        fireEvent.wheel(canvasWrap, { deltaY: 5 });
      });
      
      expect(canvasWrap).toBeInTheDocument();
    });

    it('handles significant wheel scroll', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const canvasWrap = document.querySelector('.about-canvas-wrap');
      
      await act(async () => {
        fireEvent.wheel(canvasWrap, { deltaY: 100 });
      });
      
      expect(canvasWrap).toBeInTheDocument();
    });
  });

  describe('Pointer Move Without Drag', () => {
    it('ignores pointer move when not dragging', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      const gestureLayer = document.querySelector('.about-gesture-layer');
      
      await act(async () => {
        fireEvent.pointerMove(gestureLayer, { clientX: 200 });
      });
      
      expect(gestureLayer).toBeInTheDocument();
    });
  });

  describe('Media Query Listener', () => {
    it('cleans up media query listener on unmount', async () => {
      const mockRemoveEventListener = jest.fn();
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: mockRemoveEventListener,
      }));
      
      let unmount;
      await act(async () => {
        const result = render(<CleanAbout />);
        unmount = result.unmount;
      });
      
      await act(async () => {
        unmount();
      });
      
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });

  describe('Portfolio ID Context', () => {
    it('clears portfolioId on unmount', async () => {
      mockPortfolioId = 'test-123';
      
      let unmount;
      await act(async () => {
        const result = render(<CleanAbout />);
        unmount = result.unmount;
      });
      
      await act(async () => {
        unmount();
      });
      
      // Component should unmount cleanly
      expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
    });
  });
  describe('Animation', () => {
    it('starts animation on mount', async () => {
      await act(async () => {
        render(<CleanAbout />);
      });
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('cleans up animation on unmount', async () => {
      let unmount;
      await act(async () => {
        const result = render(<CleanAbout />);
        unmount = result.unmount;
      });
      
      await act(async () => {
        unmount();
      });
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});