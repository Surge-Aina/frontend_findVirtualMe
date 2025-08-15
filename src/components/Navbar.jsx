import { useState, useContext } from "react";
import Auth from "../pages/login/Auth.jsx";
import SignUp from "../pages/login/SignUp.jsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
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
            <span className="font-medium text-lg text-slate-800 hidden sm:inline">
              FindVirtual.me
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              className="relative transition-colors text-slate-800 px-4 py-2 rounded-xl overflow-hidden group"
              onClick={navigateHome}
            >
              <span className="relative z-10">Job Seekers</span>
              <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>

            <button
              className="relative transition-colors text-slate-800 px-4 py-2 rounded-xl overflow-hidden group"
              onClick={() => navigate("/occupations")}
            >
              <span className="relative z-10">Creators</span>
              <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>

            {
              <button
                className="relative transition-colors text-slate-800 px-4 py-2 rounded-xl overflow-hidden group"
                onClick={() => navigate("/dashboard")}
              >
                <span className="relative z-10">Dashboard</span>
                <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </button>
            }
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
                  className="relative px-4 py-2 rounded-xl transition-colors text-slate-800 overflow-hidden group border border-blue-300"
                  onClick={() => {
                    setShowAuth(true);
                    setAuthMode("login");
                  }}
                >
                  <span className="relative z-10">Log in / Sign up</span>
                  <span className="absolute inset-0 w-1/3 h-full bg-blue-200/40 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </button>
                {showAuth && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 min-h-screen"
                    style={{ backdropFilter: "blur(2px)" }}
                  >
                    <div className="relative max-w-md w-full mx-auto bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-300 rounded-2xl shadow-2xl px-4 py-8 sm:px-10 sm:py-12 z-10">
                      <button
                        onClick={() => setShowAuth(false)}
                        className="absolute top-4 right-4 text-slate-700 text-xl font-bold"
                        aria-label="Close"
                      >
                        ×
                      </button>
                      {authMode === "login" ? (
                        <>
                          <Auth
                            onSignUpClick={() => setAuthMode("signup")}
                            onClose={() => setShowAuth(false)}
                          />
                          <div className="mt-4 text-center">
                            <button
                              className="text-blue-600 font-semibold underline"
                              onClick={() => setAuthMode("signup")}
                            >
                              Don't have an account? Sign up
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <SignUp
                            onClose={() => setShowAuth(false)}
                            onLoginClick={() => setAuthMode("login")}
                          />
                          <div className="mt-4 text-center">
                            <button
                              className="text-blue-600 font-semibold underline"
                              onClick={() => setAuthMode("login")}
                            >
                              Already have an account? Log in
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
