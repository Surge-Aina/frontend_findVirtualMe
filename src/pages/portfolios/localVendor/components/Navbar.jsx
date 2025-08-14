import { Link } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { isAdminLoggedIn } from "../services/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Menu", href: "#menu" },
    { label: "Showcase", href: "#showcase" },
    { label: "Gallery", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
  ];

  return (
    <nav className="w-full bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
      {/* <h1 className="text-xl font-bold">Street Vendor</h1> */}
      <a href="#home" className="text-xl font-bold">
        Street Vendor
      </a>

      {/* Desktop Menu */}
      <div className="space-x-4 hidden sm:flex">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-gray-600 hover:text-black"
          >
            {link.label}
          </a>
        ))}
        {isAdminLoggedIn() && (
          <Link
            to="admin/tagged"
            className="text-green-600 font-semibold hover:underline"
          >
            Manage Tags
          </Link>
        )}
        <Link
          to="login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <button onClick={toggleMenu}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4 sm:hidden z-40">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="text-gray-600 hover:text-black"
            >
              {link.label}
            </a>
          ))}
          {isAdminLoggedIn() && (
            <Link
              to="admin/tagged"
              onClick={closeMenu}
              className="text-green-600 font-semibold hover:underline"
            >
              Manage Tags
            </Link>
          )}
          <Link
            to="login"
            onClick={closeMenu}
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
