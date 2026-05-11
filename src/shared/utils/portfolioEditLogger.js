import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';

// Store mouse events buffer
let mouseEventsBuffer = [];
let isTracking = false;
let sessionId = null;
let userId = null;
let portfolioInfo = null;

// Throttle function to limit event frequency
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Collect mouse event
const collectMouseEvent = (event) => {
  if (!isTracking) return;

  const target = event.target;
  const element = target.tagName 
    ? `${target.tagName}${target.id ? `#${target.id}` : ''}${target.className ? `.${target.className.split(' ').join('.')}` : ''}`
    : 'unknown';

  const mouseInfo = {
    x: event.clientX,
    y: event.clientY,
    event: event.type === 'click' ? 'click' : event.type === 'mouseover' || event.type === 'mouseenter' ? 'hover' : 'move',
    element: element.substring(0, 100), // Limit element string length
    timestamp: new Date()
  };

  mouseEventsBuffer.push(mouseInfo);

  // Limit buffer size to prevent memory issues
  if (mouseEventsBuffer.length > 1000) {
    mouseEventsBuffer.shift(); // Remove oldest events
  }
};

// Throttled mouse event handler
const throttledMouseHandler = throttle(collectMouseEvent, 100); // Limit to 10 events per second

/**
 * Start tracking portfolio edits
 * @param {Object} options - Tracking options
 * @param {String} options.sessionId - Session ID
 * @param {String} options.userId - User ID
 * @param {String} options.portfolioID - Portfolio ID
 * @param {String} options.portfolioType - Portfolio type (e.g., 'handyman', 'projectManager')
 * @param {String} options.name - User name
 * @param {String} options.email - User email
 */
export const startTracking = (options) => {
  const { sessionId: sid, userId: uid, portfolioID, portfolioType, name, email } = options;
  
  sessionId = sid || localStorage.getItem('onboardingSessionId') || `session_${Date.now()}`;
  userId = uid || localStorage.getItem('userId') || 'anonymous';
  portfolioInfo = {
    portfolioID: portfolioID || null,
    portfolioType: portfolioType || 'unknown',
    name: name || localStorage.getItem('name') || null,
    email: email || localStorage.getItem('email') || null,
  };

  isTracking = true;
  mouseEventsBuffer = [];

  // Add event listeners
  document.addEventListener('click', throttledMouseHandler);
  document.addEventListener('mousemove', throttledMouseHandler);
  document.addEventListener('mouseover', throttledMouseHandler);
  
  console.log('📊 Portfolio edit tracking started', { sessionId, userId, portfolioInfo });
};

/**
 * Stop tracking and clear event listeners
 */
export const stopTracking = () => {
  isTracking = false;
  document.removeEventListener('click', throttledMouseHandler);
  document.removeEventListener('mousemove', throttledMouseHandler);
  document.removeEventListener('mouseover', throttledMouseHandler);
  console.log('📊 Portfolio edit tracking stopped');
};

/**
 * Log portfolio action (created, updated, deleted)
 * @param {String} action - Action type: 'created', 'updated', 'deleted'
 * @param {Object} options - Additional options
 */
export const logPortfolioAction = async (action, options = {}) => {
  if (!sessionId && !options.sessionId) {
    console.warn('⚠️ No session ID available for logging');
    return;
  }

  const logData = {
    userId: options.userId || userId || 'anonymous',
    name: options.name || portfolioInfo?.name || null,
    email: options.email || portfolioInfo?.email || null,
    portfolioID: options.portfolioID || portfolioInfo?.portfolioID || null,
    portfolioType: options.portfolioType || portfolioInfo?.portfolioType || 'unknown',
    action: action,
    sessionId: options.sessionId || sessionId,
    mouseInfo: [...mouseEventsBuffer], // Copy buffer
    timestamp: new Date(),
  };

  try {
    // Send log to backend
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await axios.post(`${API_URL}/api/portfolios/edit-log`, logData, { headers });
    
    console.log('✅ Portfolio action logged:', action, logData);
    
    // Clear buffer after successful log
    mouseEventsBuffer = [];
  } catch (error) {
    console.error('❌ Error logging portfolio action:', error);
    // Optionally retry or store locally for later sync
  }
};

/**
 * Get current session ID
 */
export const getSessionId = () => {
  return sessionId || localStorage.getItem('onboardingSessionId') || `session_${Date.now()}`;
};

/**
 * Update portfolio info
 */
export const updatePortfolioInfo = (info) => {
  portfolioInfo = { ...portfolioInfo, ...info };
};


