import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loggedIn, setLoggedIn, setIsAdmin } = useContext(AuthContext);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoggedIn(!!token);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/user/login', {
        email: form.email,
        password: form.password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', res.data.isAdmin);
      setLoggedIn(true);
      setIsAdmin(res.data.isAdmin);
      toast.success('Login successful!');
      navigate('/portfolios/photographer/');
    } catch (err) {
      setError('Invalid credentials');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Save the Google Drive folder ID before clearing localStorage
    const savedFolderId = localStorage.getItem('adminDriveFolderId');
    
    // Clear all localStorage except the folder ID
    localStorage.clear();
    
    // Restore the folder ID if it exists
    if (savedFolderId) {
      localStorage.setItem('adminDriveFolderId', savedFolderId);
    }
    
    setLoggedIn(false);
    setIsAdmin(false);
    setForm({ email: '', password: '' });
    toast.success('Logged out!');
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-xl p-16 border border-gray-100 max-w-md w-full mx-8">
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-light text-gray-900 mb-4 tracking-wide">Welcome Back</h2>
                <p className="text-gray-600 font-light text-lg">You're successfully logged in</p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/portfolios/photographer/')}
                  className="w-full px-8 py-4 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl hover:from-black hover:to-gray-800 transition-all duration-500 font-light text-lg tracking-wide transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-500 font-light text-lg tracking-wide"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slow-float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-30px) rotate(180deg);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out forwards;
            opacity: 0;
          }

          .animate-slow-float {
            animation: slow-float 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 border border-gray-200 rounded-full opacity-30 animate-slow-float"></div>
        <div className="absolute bottom-40 left-10 w-24 h-24 border border-gray-300 rounded-full opacity-20 animate-slow-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-gray-200 rounded-full opacity-25 animate-slow-float" style={{animationDelay: '6s'}}></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-8 animate-fade-in-up">
        <div className="bg-white p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-light text-gray-900 mb-4 tracking-wide">Sign In</h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-600 font-light text-lg">Access your admin dashboard</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all duration-500 font-light text-lg hover:border-gray-300"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-black focus:outline-none transition-all duration-500 font-light text-lg hover:border-gray-300"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-center font-light">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-5 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl hover:from-black hover:to-gray-800 transition-all duration-500 font-light text-lg tracking-wide transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-500 font-light text-sm">
              Secure access to your photography dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slow-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slow-float {
          animation: slow-float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;