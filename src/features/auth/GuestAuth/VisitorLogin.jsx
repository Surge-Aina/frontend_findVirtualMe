
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles/VisitorLogin.css';

export default function VisitorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { portfolioId } = useParams();

  // Redirect to demo if no portfolioId
  useEffect(() => {
    if (!portfolioId) {
      navigate('/portfolios/cleaningService/about');
    }
  }, [portfolioId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/auth/guest/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          portfolioType: 'cleaning_services',
          portfolioId: portfolioId,

        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('visitor', JSON.stringify(data.user));
        localStorage.setItem('visitorToken', data.token);
        window.dispatchEvent(new Event('visitor-auth-change'));
        
        setMessage('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate(`/portfolios/cleaningService/${portfolioId}/about`);
        }, 1000);
      } else {
        setMessage(data.message || 'Invalid email or password');
      }
    } catch (error) {
      setMessage('Could not connect to server. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate(`/portfolios/cleaningService/${portfolioId}/visitor-signup`);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {portfolioId && (
          <button 
            className="back-button"
            onClick={() => {
              navigate(`/portfolios/cleaningService/${portfolioId}/about`);
            }}
          >
            ← Back to Portfolio
          </button>
        )}
        
        <div className="login-header">
          <div className="login-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <span onClick={handleSignupClick} className="signup-link">Sign up</span></p>
        </div>
      </div>
    </div>
  );
}