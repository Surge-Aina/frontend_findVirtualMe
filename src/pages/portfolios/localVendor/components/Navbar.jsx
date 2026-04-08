import { Link, useParams } from "react-router-dom";
import { useState, useContext } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { canEditPortfolio } from "../services/auth";
import VendorSelector from "./VendorSelector";
import { AuthContext } from "../../../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const { user } = useContext(AuthContext);
  const { username, id } = useParams(); //capture vendor route params

  const basePath = `/portfolios/vendor/${username}/${id}`;

  const canEdit = canEditPortfolio(user, id);

  const navLinks = [
    { label: "Home", href: `${basePath}#home` },
    { label: "About", href: `${basePath}#about` },
    { label: "Menu", href: `${basePath}#menu` },
    { label: "Showcase", href: `${basePath}#showcase` },
    { label: "Gallery", href: `${basePath}#gallery` },
    { label: "Reviews", href: `${basePath}#reviews` },
  ];

  return (
    <nav
      data-testid="vendor-navbar"
      className="w-full bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50"
    >
      <a href="#home" className="text-xl font-bold">
        Street Vendor
      </a>

      {/* Desktop Menu */}
      <div className="space-x-4 hidden sm:flex items-center flex-wrap">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} className="text-gray-600 hover:text-black">
            {link.label}
          </a>
        ))}

        <div className="hidden md:flex items-center gap-3">{user?.role === "admin" && <VendorSelector />}</div>

        {canEdit && (
          <Link to="admin/tagged" className="text-green-600 font-semibold hover:underline">
            Manage Tags
          </Link>
        )}
        <Link to="login" className="text-blue-600 font-semibold hover:underline">
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <button data-testid="vendor-mobile-menu-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4 sm:hidden z-40 z-40 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={closeMenu} className="text-gray-600 hover:text-black">
              {link.label}
            </a>
          ))}

          {/* 🔹 Vendor Selector also in mobile view */}
          {user?.role === "admin" && <VendorSelector />}

          {canEdit && (
            <Link
              to="admin/tagged"
              onClick={closeMenu}
              data-testid="manage-tags"
              className="text-green-600 font-semibold hover:underline"
            >
              Manage Tags
            </Link>
          )}
          <Link to="login" onClick={closeMenu} className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
