
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { logApiError } from "@/shared/api/safeLog";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPortfolioId, setCurrentPortfolioId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const checkPortfolioOwnership = async (portfolioId) => {
    
    
    if (!user || !portfolioId) {
      
      setIsOwner(false);
      return false;
    }

    try {
      const token = localStorage.getItem('token');
      
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/api/portfolios/${portfolioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      
      // ✅ FIXED: Get isOwner from response.data
      const ownershipStatus = response.data.isOwner;
      
      setIsOwner(ownershipStatus);
      return ownershipStatus;
    } catch (error) {
      logApiError(error, "❌ Error checking portfolio ownership");
      setIsOwner(false);
      return false;
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      
      if (!token) {
        
        setLoading(false);
        return;
      }

      try {
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/api/portfolios/me-user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        
        setUser(response.data.user);
      } catch (error) {
        logApiError(error, "❌ Error loading user");
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Check ownership when portfolio ID changes
  useEffect(() => {
    
    
    if (currentPortfolioId && user) {
      
      checkPortfolioOwnership(currentPortfolioId);
    } else {
      
      setIsOwner(false);
    }
  }, [currentPortfolioId, user]);
const login = async (email, password) => {
  try {
    
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/api/auth/login`,
      { email, password }
    );
    const { token, user, portfolioIds } = response.data;  // ← ADD portfolioIds
    
    // ... existing code ...
    
    localStorage.setItem('token', token);
    localStorage.setItem('email', user.email);
    localStorage.setItem('userId', user._id || user.id);
    
    // ✅ ADD THIS:
    if (portfolioIds) {
      localStorage.setItem('userPortfolios', JSON.stringify(portfolioIds));
      
    }
    
    setUser(user);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};
  // const login = async (email, password) => {
  //   try {
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_API}/api/auth/login`,
  //       { email, password }
  //     );
  //     const { token, user } = response.data;
      
      
  //     // Save to localStorage
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('email', user.email);
  //     localStorage.setItem('userId', user._id || user.id);
      
      
  //     setUser(user);
  //     return { success: true };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || 'Login failed'
  //     };
  //   }
  // };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setUser(null);
    setIsOwner(false);
    setCurrentPortfolioId(null);
  };

  const value = {
    user,
    loading,
    isOwner,
    currentPortfolioId,
    setCurrentPortfolioId,
    checkPortfolioOwnership,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: isOwner
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;