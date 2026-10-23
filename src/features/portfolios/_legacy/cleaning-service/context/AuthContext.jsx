
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPortfolioId, setCurrentPortfolioId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const checkPortfolioOwnership = async (portfolioId) => {
    console.log('🔍 checkPortfolioOwnership called:', { portfolioId, user });
    
    if (!user || !portfolioId) {
      console.log('❌ No user or portfolio ID');
      setIsOwner(false);
      return false;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Making API call to check ownership...');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/api/portfolios/${portfolioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Ownership check response:', response.data);
      
      // ✅ FIXED: Get isOwner from response.data
      const ownershipStatus = response.data.isOwner;
      console.log('🔍 Setting isOwner to:', ownershipStatus);
      setIsOwner(ownershipStatus);
      return ownershipStatus;
    } catch (error) {
      console.error('❌ Error checking portfolio ownership:', error);
      setIsOwner(false);
      return false;
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 Loading user, token exists?', !!token);
      
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Calling /api/portfolios/me-user...');
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/api/portfolios/me-user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ User loaded:', response.data.user);
        setUser(response.data.user);
      } catch (error) {
        console.error('❌ Error loading user:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Check ownership when portfolio ID changes
  useEffect(() => {
    console.log('🔍 AuthContext - Portfolio ID changed:', {
      currentPortfolioId,
      user,
      hasUser: !!user
    });
    
    if (currentPortfolioId && user) {
      console.log('🔍 Checking ownership for portfolio:', currentPortfolioId);
      checkPortfolioOwnership(currentPortfolioId);
    } else {
      console.log('🔍 Setting isOwner to false - no portfolio or user');
      setIsOwner(false);
    }
  }, [currentPortfolioId, user]);
const login = async (email, password) => {
  try {
    console.log('🔍 LOGIN FUNCTION CALLED');
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
      console.log('📁 Stored portfolio IDs:', portfolioIds);
    }
    
    setUser(user);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};
  // const login = async (email, password) => {
  //   try {
  //     console.log('🔍 LOGIN FUNCTION CALLED');
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_BACKEND_API}/api/auth/login`,
  //       { email, password }
  //     );
  //     const { token, user } = response.data;
      
  //     console.log('🔍 LOGIN RESPONSE USER:', user);
  //     console.log('🔍 USER EMAIL:', user.email);
  //     console.log('🔍 USER ID:', user._id || user.id);
      
  //     // Save to localStorage
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('email', user.email);
  //     localStorage.setItem('userId', user._id || user.id);
      
  //     console.log('🔍 SAVED TO LOCALSTORAGE');
  //     console.log('🔍 CHECK:', localStorage.getItem('email'), localStorage.getItem('userId'));
      
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