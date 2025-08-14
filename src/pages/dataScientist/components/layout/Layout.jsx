import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SocialLinks from '../common/SocialLinks';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'Home', path: '/portfolios/data-scientist' },
    { title: 'Projects', path: '/portfolios/data-scientist/projects' },
    { title: 'Reviews', path: '/portfolios/data-scientist/testimonials' },
    { title: 'Contact', path: '/portfolios/data-scientist/contact' },
    { title: 'Admin', path: '/portfolios/data-scientist/admin' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-terminal border-b border-terminal-border sticky top-16 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/portfolios/data-scientist"
              className="text-lg sm:text-xl font-bold text-terminal-accent tracking-wide hover:text-terminal-textDim transition-colors duration-200 font-mono"
              onClick={closeMobileMenu}
            >
              Gargi G.
            </Link>
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm lg:text-base font-medium transition-colors duration-200 hover:text-terminal-accent font-mono ${
                    location.pathname === item.path
                      ? 'text-terminal-accent border-b-2 border-terminal-accent'
                      : 'text-terminal-textDim'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-terminal-textDim hover:text-terminal-accent transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-terminal-border">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 font-mono rounded-md ${
                      location.pathname === item.path
                        ? 'text-terminal-accent bg-terminal-accent/10'
                        : 'text-terminal-textDim hover:text-terminal-accent hover:bg-terminal-accent/5'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-grow py-4 sm:py-6 lg:py-8 bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-terminal-card border-t border-terminal-border py-4 sm:py-6 mt-auto">
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <SocialLinks />
            <p style={{ 
              textAlign: 'center', 
              fontSize: '0.75rem', 
              color: 'var(--terminal-textMuted)', 
              fontFamily: 'JetBrains Mono, monospace' 
            }}>
              © {new Date().getFullYear()} Gargi Ghadigaonkar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
