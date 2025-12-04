import { renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useHandleCardClick } from '../../utils/useHandleCardClick';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('useHandleCardClick', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns handleCardClick function', () => {
    const { result } = renderHook(() => useHandleCardClick());
    expect(typeof result.current.handleCardClick).toBe('function');
  });

  it('navigates to handyman portfolio', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ type: 'handyman', _id: '123' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/handyman/123');
  });

  it('navigates to cleaning service portfolio', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ type: 'cleaningLady', _id: '456' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/cleaningService/456/about');
  });

  it('navigates to vendor portfolio with formatted username', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ 
      type: 'vendor', 
      _id: '789', 
      name: 'John Doe' 
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/vendor/john-doe/789');
  });

  it('navigates to vendor portfolio using email when no name', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ 
      type: 'vendor', 
      _id: '789', 
      email: 'vendor@test.com' 
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/vendor/vendor@test.com/789');
  });

  it('navigates to vendor portfolio with default username', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ type: 'vendor', _id: '789' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/vendor/vendor/789');
  });

  it('navigates to project manager portfolio for other types', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ 
      type: 'other', 
      _id: '101', 
      email: 'user@example.com' 
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/project-manager/user/101');
  });

  it('handles missing email for project manager', () => {
    const { result } = renderHook(() => useHandleCardClick());
    
    result.current.handleCardClick({ type: 'other', _id: '101' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/portfolios/project-manager//101');
  });

  it('logs portfolio info', () => {
    const { result } = renderHook(() => useHandleCardClick());
    const portfolio = { type: 'handyman', _id: '123', portfolioType: 'handyman' };
    
    result.current.handleCardClick(portfolio);
    
    expect(console.log).toHaveBeenCalledWith('p in useHandleCardClick() ', portfolio);
  });
});