import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { loggedIn, setLoggedIn, setIsAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    toast.success('Logged out!');
  navigate('/portfolios/photographer/');
    setIsMobileMenuOpen(false); // Close mobile menu after logout
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 sm:px-8 py-6">
        {/* Logo */}
        <div className="text-xl sm:text-2xl font-light tracking-wide text-gray-900">
          Jane Doe Photography
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/portfolios/photographer/" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
            Home
          </Link>
          <Link to="/portfolios/photographer/services" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
            Services
          </Link>
          <Link to="/portfolios/photographer/gallery" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
            Gallery
          </Link>
          <Link to="/portfolios/photographer/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
            Contact
          </Link>

          {/* Desktop Login/Logout Button */}
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-md transition-all duration-200 font-light"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/portfolios/photographer/login"
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-md transition-all duration-200 font-light"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/portfolios/photographer/"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
            >
              Home
            </Link>
            <Link
              to="/portfolios/photographer/services"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
            >
              Services
            </Link>
            <Link
              to="/portfolios/photographer/gallery"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
            >
              Gallery
            </Link>
            <Link
              to="/portfolios/photographer/contact"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
            >
              Contact
            </Link>

            {/* Mobile Login/Logout Button */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {loggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/portfolios/photographer/login"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 font-light"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}