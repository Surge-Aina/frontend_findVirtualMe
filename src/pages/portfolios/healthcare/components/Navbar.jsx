import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTooth, FaBars, FaTimes, FaSearch, FaHospital } from 'react-icons/fa';
import { MdHealthAndSafety } from "react-icons/md";
import { GiHealthNormal } from "react-icons/gi";
import { FaHospitalUser } from "react-icons/fa6";
import { RiMentalHealthFill } from "react-icons/ri";
import { useHealthcareBasePath } from '../../../../hooks/useHealthcareBasePath';

export default function Navbar({ userData, practiceId: _practiceId }) {
  const { basePath } = useHealthcareBasePath();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const homePath = basePath || '/';
  const navItems = [
    { href: homePath, label: 'Home' },
    { href: `${basePath}/services`, label: 'Services' },
    { href: `${basePath}/blog`, label: 'Blog' },
    { href: `${basePath}/gallery`, label: 'Gallery' },
    { href: `${basePath}/contact`, label: 'Contact' }
  ];

  const iconMap = {
    FaTooth,
    FaHospital,
    MdHealthAndSafety,
    GiHealthNormal,
    FaHospitalUser,
    RiMentalHealthFill
  }
  const SelectedIcon = iconMap[userData?.practice?.icon] || FaTooth;

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white shadow-md z-[1000] transition-all duration-300 px-0.5 ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="flex items-center justify-between max-w-7xl mx-auto py-3 px-3">
        <Link
          to={homePath}
          className="flex items-center no-underline text-blue-800 font-bold text-xl md:text-2xl gap-3" // Added gap and responsive text
        >
          {userData?.practice?.logoImage ? (
            <img
              src={userData.practice.logoImage}
              alt="Practice Logo"
              className="w-16 h-16 md:w-32 md:h-32 object-contain rounded-md" 
            />
          ) : (
            <div className="w-16 h-16 bg-blue-800 rounded-md flex items-center justify-center shrink-0">
              <SelectedIcon className="text-white text-5xl" />
            </div>
          )}

          <span className="">{userData?.practice?.name}</span>
        </Link>
        
        <div className="nav-links desktop">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        <Link
          to={`${basePath}/contact`}
          className="btn-contact desktop md:block hidden"
        >
          Contact Us
        </Link>
        
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`mobile-link ${location.pathname === item.href ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}