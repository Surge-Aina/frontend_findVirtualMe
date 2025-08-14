import { useState, useEffect, useContext } from "react";
import Auth from "../pages/login/Auth.jsx";
import { motion } from "framer-motion"; // Make sure to install framer-motion
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);
  const { contextLoggedIn, contextLogout } = useContext(AuthContext);

  const navigate = useNavigate();
  const navigateHome = () => {
    navigate("/");
  };

  const logout = () => {
    contextLogout();
    navigate("/");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/40 border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={navigateHome}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">FV</span>
            </div>
            <span className="font-medium text-lg text-slate-800">
              FindVirtual.me
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              className="relative transition-colors text-slate-800 px-4 py-2 rounded-xl overflow-hidden group"
              onClick={navigateHome}
            >
              <span className="relative z-10">About</span>
              <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {contextLoggedIn ? (
              <button
                className="relative bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors overflow-hidden group"
                onClick={logout}
              >
                <span className="relative z-10">Logout</span>
                <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </button>
            ) : (
              <>
                <button
                  className="relative px-4 py-2 rounded-xl transition-colors text-slate-800 overflow-hidden group border border-blue-000"
                  onClick={() => setShowAuth(true)}
                >
                  <span className="relative z-10">Log in</span>
                  <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </button>
                <button
                  className="relative bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors overflow-hidden group"
                  onClick={() => setShowAuth(true)}
                >
                  <span className="relative z-10">Sign up</span>
                  <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </button>
                {showAuth && <Auth onClose={() => setShowAuth(false)} />}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
