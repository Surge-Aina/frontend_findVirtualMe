import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { portfolioUserApi } from '@/shared/api/portfolioUserApi';
import './styles/VisitorLogin.css';

export default function VisitorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { portfolioId } = useParams();

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
      const res = await portfolioUserApi.login({
        email,
        password,
        portfolioType: 'cleaning_services',
        portfolioId,
      });
      const { token, user } = res.data;

      // New per-portfolio keyed session (read by PortfolioUserContext).
      localStorage.setItem(`portfolioUserToken:${portfolioId}`, token);
      localStorage.setItem(`portfolioUser:${portfolioId}`, JSON.stringify(user));

      // Legacy keys kept for the existing cleaning-service pages.
      localStorage.setItem('visitor', JSON.stringify(user));
      localStorage.setItem('visitorToken', token);
      window.dispatchEvent(new Event('visitor-auth-change'));

      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate(`/portfolios/cleaningService/${portfolioId}/about`);
      }, 1000);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || 'Invalid email or password';
      setMessage(errMsg);
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
