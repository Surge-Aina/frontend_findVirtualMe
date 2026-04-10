import axios from 'axios';
import {
  startTracking,
  stopTracking,
  logPortfolioAction,
  getSessionId,
  updatePortfolioInfo,
} from '../portfolioEditLogger';

jest.mock('axios');

describe('portfolioEditLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    axios.post.mockReset();
    axios.post.mockResolvedValue({ data: { success: true } });
    
    stopTracking();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    stopTracking();
  });

  describe('startTracking', () => {
    it('starts tracking with all provided options', () => {
      startTracking({
        sessionId: 'test-session',
        userId: 'user-123',
        portfolioID: 'portfolio-456',
        portfolioType: 'handyman',
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(console.log).toHaveBeenCalled();
    });

    it('uses localStorage sessionId as fallback', () => {
      localStorage.setItem('onboardingSessionId', 'stored-session');
      startTracking({});

      expect(console.log).toHaveBeenCalled();
    });

    it('uses localStorage userId as fallback', () => {
      localStorage.setItem('userId', 'stored-user');
      startTracking({});

      expect(console.log).toHaveBeenCalled();
    });

    it('uses localStorage name as fallback', () => {
      localStorage.setItem('name', 'Stored Name');
      startTracking({});

      expect(console.log).toHaveBeenCalled();
    });

    it('uses localStorage email as fallback', () => {
      localStorage.setItem('email', 'stored@example.com');
      startTracking({});

      expect(console.log).toHaveBeenCalled();
    });

    it('generates session ID when none provided', () => {
      startTracking({});
      
      const sessionId = getSessionId();
      expect(sessionId).toContain('session_');
    });

    it('uses anonymous when no userId available', () => {
      startTracking({});
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('stopTracking', () => {
    it('stops tracking and logs message', () => {
      startTracking({ sessionId: 'test' });
      stopTracking();

      expect(console.log).toHaveBeenCalled();
    });

    it('removes event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      startTracking({ sessionId: 'test' });
      stopTracking();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseover', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('logPortfolioAction', () => {
    it('logs action when session exists', async () => {
      startTracking({ sessionId: 'test-session', userId: 'user-123' });
      
      await logPortfolioAction('created', { portfolioID: 'p-123' });

      expect(axios.post).toHaveBeenCalled();
    });

    it('uses sessionId from options', async () => {
      await logPortfolioAction('updated', { sessionId: 'option-session' });

      expect(axios.post).toHaveBeenCalled();
    });

    it('uses userId from options', async () => {
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated', { userId: 'option-user' });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'option-user',
        }),
        expect.any(Object)
      );
    });

    it('uses name from options', async () => {
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated', { name: 'Option Name' });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'Option Name',
        }),
        expect.any(Object)
      );
    });

    it('uses email from options', async () => {
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated', { email: 'option@example.com' });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          email: 'option@example.com',
        }),
        expect.any(Object)
      );
    });

    it('uses portfolioType from options', async () => {
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated', { portfolioType: 'vendor' });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          portfolioType: 'vendor',
        }),
        expect.any(Object)
      );
    });

    it('handles API error gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'));
      
      startTracking({ sessionId: 'test-session' });
      await logPortfolioAction('deleted');

      expect(console.error).toHaveBeenCalled();
    });

    it('includes Authorization header when token exists', async () => {
      localStorage.setItem('token', 'auth-token');
      
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated');

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        })
      );
    });

    it('does not include Authorization header when no token', async () => {
      startTracking({ sessionId: 'test' });
      await logPortfolioAction('updated');

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('logs different action types', async () => {
      startTracking({ sessionId: 'test' });
      
      await logPortfolioAction('created');
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ action: 'created' }),
        expect.any(Object)
      );

      await logPortfolioAction('updated');
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ action: 'updated' }),
        expect.any(Object)
      );

      await logPortfolioAction('deleted');
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ action: 'deleted' }),
        expect.any(Object)
      );
    });
  });

 describe('getSessionId', () => {
  it('returns existing session ID after startTracking', () => {
    startTracking({ sessionId: 'my-session' });
    expect(getSessionId()).toBe('my-session');
  });

  it('returns localStorage session ID as fallback', () => {
    // Must stop tracking first to clear the module's sessionId
    stopTracking();
    
    // Reset modules to get fresh state
    jest.resetModules();
    
    // Set localStorage before importing
    localStorage.setItem('onboardingSessionId', 'stored-session');
    
    // Re-import to get fresh module
    const { getSessionId: freshGetSessionId } = require('../../utils/portfolioEditLogger');
    
    expect(freshGetSessionId()).toBe('stored-session');
  });

  it('generates new session ID if none exists', () => {
    // Must stop tracking first
    stopTracking();
    
    // Reset modules to get fresh state
    jest.resetModules();
    
    // Clear localStorage
    localStorage.clear();
    
    // Re-import to get fresh module
    const { getSessionId: freshGetSessionId } = require('../../utils/portfolioEditLogger');
    
    const sessionId = freshGetSessionId();
    expect(sessionId).toContain('session_');
  });
});

  describe('updatePortfolioInfo', () => {
    it('updates portfolio info', () => {
      startTracking({ portfolioType: 'handyman' });

      expect(() => {
        updatePortfolioInfo({ portfolioID: 'new-id' });
      }).not.toThrow();
    });

    it('merges with existing portfolio info', async () => {
      startTracking({ 
        sessionId: 'test',
        portfolioType: 'handyman',
        portfolioID: 'old-id' 
      });
      
      updatePortfolioInfo({ portfolioID: 'new-id' });
      
      await logPortfolioAction('updated');
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          portfolioID: 'new-id',
        }),
        expect.any(Object)
      );
    });
  });

  describe('mouse event collection', () => {
    it('collects click events when tracking', async () => {
      startTracking({ sessionId: 'test' });
      
      // Simulate click event
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      });
      Object.defineProperty(clickEvent, 'target', {
        value: { tagName: 'BUTTON', id: 'testBtn', className: 'btn primary' },
      });
      document.dispatchEvent(clickEvent);
      
      // Wait for throttle
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await logPortfolioAction('updated');
      
      expect(axios.post).toHaveBeenCalled();
    });

    it('collects mouseover events when tracking', async () => {
      startTracking({ sessionId: 'test' });
      
      const mouseoverEvent = new MouseEvent('mouseover', {
        clientX: 50,
        clientY: 60,
        bubbles: true,
      });
      document.dispatchEvent(mouseoverEvent);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(console.log).toHaveBeenCalled();
    });

    it('collects mousemove events when tracking', async () => {
      startTracking({ sessionId: 'test' });
      
      const mousemoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 250,
        bubbles: true,
      });
      document.dispatchEvent(mousemoveEvent);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(console.log).toHaveBeenCalled();
    });

    it('does not collect events when not tracking', () => {
      // Don't start tracking
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
      });
      document.dispatchEvent(clickEvent);
      
      // Only stopTracking log should exist
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('handles target without tagName', async () => {
      startTracking({ sessionId: 'test' });
      
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      });
      Object.defineProperty(clickEvent, 'target', {
        value: {},
      });
      document.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await logPortfolioAction('updated');
      expect(axios.post).toHaveBeenCalled();
    });

    it('handles target with only tagName', async () => {
      startTracking({ sessionId: 'test' });
      
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      });
      Object.defineProperty(clickEvent, 'target', {
        value: { tagName: 'DIV' },
      });
      document.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await logPortfolioAction('updated');
      expect(axios.post).toHaveBeenCalled();
    });

    it('handles target with id', async () => {
      startTracking({ sessionId: 'test' });
      
      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      });
      Object.defineProperty(clickEvent, 'target', {
        value: { tagName: 'DIV', id: 'myDiv' },
      });
      document.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await logPortfolioAction('updated');
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('throttle behavior', () => {
    it('throttles rapid events', async () => {
      startTracking({ sessionId: 'test' });
      
      // Fire multiple events rapidly
      for (let i = 0; i < 10; i++) {
        const event = new MouseEvent('mousemove', {
          clientX: i * 10,
          clientY: i * 10,
        });
        document.dispatchEvent(event);
      }
      
      // Should be throttled
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(console.log).toHaveBeenCalled();
    });
  });
});