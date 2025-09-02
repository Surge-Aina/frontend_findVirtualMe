import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE = '/portfolios/cleaningService'; // nested app base

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    setLoggedIn(!!token);
    setIsAdmin(adminFlag);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/cleaning/user/login', {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', form.email);
      localStorage.setItem('isAdmin', String(res.data.isAdmin));

      
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;

      setLoggedIn(true);
      setIsAdmin(res.data.isAdmin);

      // compute redirect each submit using current location; sanitize to BASE
      const from = location.state?.from?.pathname;
      const target = (from && from.startsWith(BASE)) ? from : `${BASE}/services`;

      toast.success('Login successful!');
      navigate(target, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials';
      setError(msg);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    setLoggedIn(false);
    setIsAdmin(false);
    setForm({ email: '', password: '' });
    toast.success('Logged out!');
    navigate(`${BASE}/login`, { replace: true });
  };

  return (
    <section className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Login</h1>

        {!loggedIn ? (
          <p className="auth-subtitle">Please log in</p>
        ) : (
          <p className="auth-subtitle">{isAdmin ? 'Hello Admin' : 'Hello Customer'}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            disabled={loading}
          />

          <div className="input-with-action">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              minLength={6}
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              className="btn icon-btn"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((s) => !s)}
              title={showPw ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPw ? 'Hide Password' : 'Show Password'}
            </button>
          </div>

          {error && <p style={{ color: 'red', margin: '6px 0' }}>{error}</p>}

          {loggedIn && (
            <button type="button" onClick={handleLogout} style={{ marginTop: 8 }}>
              Log Out
            </button>
          )}
        </form>
      </div>
    </section>
  );
};

export default Login;
