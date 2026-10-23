
// import React, { useState, useEffect } from 'react';
// import { NavLink, useNavigate, useParams } from 'react-router-dom';
// import { MdAccountCircle } from "react-icons/md";

// export default function Navbar() {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [initials, setInitials] = useState('DOM');
//   const [isVisitorLoggedIn, setIsVisitorLoggedIn] = useState(false);
//   const [visitorName, setVisitorName] = useState('');

//   const navigate = useNavigate();
//   const { portfolioId } = useParams();
  
//   const BASE = portfolioId 
//     ? `/portfolios/cleaningService/${portfolioId}`
//     : `/portfolios/cleaningService`;

//   const checkAuthStatus = () => {
//     try {
//       // Check portfolio owner
//       const user = localStorage.getItem('user');
//       if (user) {
//         const userData = JSON.parse(user);
//         const userInitials = userData?.name 
//           ? userData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase() 
//           : 'DOM';
//         setInitials(userInitials);
//       } else {
//         setInitials('DOM');
//       }
      
//       // Check visitor
//       const visitor = localStorage.getItem('visitor');
//       if (visitor) {
//         const visitorData = JSON.parse(visitor);
//         setIsVisitorLoggedIn(true);
//         setVisitorName(visitorData.name || '');
//       } else {
//         setIsVisitorLoggedIn(false);
//         setVisitorName('');
//       }
//     } catch (error) {
//       console.error('Error checking auth:', error);
//       setInitials('DOM');
//       setIsVisitorLoggedIn(false);
//       setVisitorName('');
//     }
//   };

//   useEffect(() => {
//     checkAuthStatus();
    
//     const handleAuthChange = () => {
//       checkAuthStatus();
//     };
    
//     window.addEventListener('visitor-auth-change', handleAuthChange);
    
//     return () => {
//       window.removeEventListener('visitor-auth-change', handleAuthChange);
//     };
//   }, []);

//   const handleVisitorLogout = () => {
//     localStorage.removeItem('visitor');
//     localStorage.removeItem('visitorToken');
//     setIsVisitorLoggedIn(false);
//     setVisitorName('');
//     setShowDropdown(false);
//     window.dispatchEvent(new Event('visitor-auth-change'));
//   };

//   const handleViewProfile = () => {
//     setShowDropdown(false);
//     navigate(`${BASE}/visitor-profile`);
//   };

//   const handleSignIn = () => {
//     setShowDropdown(false);
//     navigate(`${BASE}/visitor-login`);
//   };

//   const handleSignUp = () => {
//     setShowDropdown(false);
//     navigate(`${BASE}/visitor-signup`);
//   };

//   return (
//     <div className="navbar">
//       <div className="nav-left">
//         <div className="initials-circle">
//           {initials}
//         </div>
//       </div>

//       <div className="nav-center">
//         <NavLink to={`${BASE}/about`}>About</NavLink>
//         <NavLink to={`${BASE}/services`}>Services</NavLink>
//         <NavLink to={`${BASE}/charges`}>Pricing</NavLink>
//       </div>

//       <div className="nav-right">
//         <div
//           className="account-icon"
//           onClick={() => setShowDropdown(!showDropdown)}
//           title="Account"
//         >
//           <MdAccountCircle size={40} color="#5b3cd9" />
//         </div>

//         {showDropdown && (
//           <div className="dropdown-menu">
//             <button className="close-btn" onClick={() => setShowDropdown(false)}>×</button>
            
//             {isVisitorLoggedIn ? (
//               <>
//                 <div className="dropdown-user-info">
//                   <p className="welcome-text">Welcome, {visitorName}!</p>
//                 </div>
//                 <button className="dropdown-item" onClick={handleViewProfile}>
//                   👤 View Profile
//                 </button>
//                 <button className="dropdown-item logout-btn" onClick={handleVisitorLogout}>
//                   🚪 Log Out
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button className="dropdown-item" onClick={handleSignIn}>
//                   🔐 Sign In
//                 </button>
//                 <button className="dropdown-item" onClick={handleSignUp}>
//                   ✍️ Sign Up
//                 </button>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { MdAccountCircle } from "react-icons/md";
import "./cleanNavbar.css";
export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [initials, setInitials] = useState('DOM');
  const [isVisitorLoggedIn, setIsVisitorLoggedIn] = useState(false);
  const [visitorName, setVisitorName] = useState('');
const [showVisitorsTab, setShowVisitorsTab] = useState(false);
const [isOwner, setIsOwner] = useState(false); 

  const navigate = useNavigate();
  const { portfolioId } = useParams();
  
  const BASE = portfolioId 
    ? `/portfolios/cleaningService/${portfolioId}`
    : `/portfolios/cleaningService`;


const checkAuthStatus = () => {
  console.log('🔍 NAVBAR - portfolioId from useParams:', portfolioId);
  try {
    const visitor = localStorage.getItem('visitor');
    const visitorToken = localStorage.getItem('visitorToken');
    
    if (visitor && visitorToken) {
      // This is a VISITOR, not an owner
      const visitorData = JSON.parse(visitor);
      setIsVisitorLoggedIn(true);
      setVisitorName(visitorData.name || '');
      setIsOwner(false);
      setInitials('DOM');
    } else {
      // Not a visitor - check if portfolio in array
      setIsVisitorLoggedIn(false);
      setVisitorName('');
      
      const userPortfolios = localStorage.getItem('userPortfolios');
      console.log('📦 userPortfolios from localStorage:', userPortfolios);
      
      if (userPortfolios && portfolioId) {
        const portfoliosList = JSON.parse(userPortfolios);
        console.log('📁 User portfolios array:', portfoliosList);
        console.log('🔍 Current portfolioId:', portfolioId);
        
        if (portfoliosList.includes(portfolioId)) {
          setIsOwner(true);
          setInitials('OWN');
          console.log('✅ Portfolio IS in array - showing toggle');
        } else {
          setIsOwner(false);
          setInitials('DOM');
          console.log('❌ Portfolio NOT in array - hiding toggle');
        }
      } else {
        setIsOwner(false);
        setInitials('DOM');
        console.log('⚠️ No userPortfolios or no portfolioId');
      }
    }
    
    // Load toggle state from localStorage
    const savedToggleState = localStorage.getItem(`showVisitors_${portfolioId}`);
    setShowVisitorsTab(savedToggleState === 'true');
  } catch (error) {
    console.error('Error checking auth:', error);
    setInitials('DOM');
    setIsVisitorLoggedIn(false);
    setVisitorName('');
    setIsOwner(false);
  }
};
  useEffect(() => {
    checkAuthStatus();
    
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('visitor-auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('visitor-auth-change', handleAuthChange);
    };
  }, []);
  const handleToggleVisitors = () => {
    const newState = !showVisitorsTab;
    setShowVisitorsTab(newState);
    // Save to localStorage
    localStorage.setItem(`showVisitors_${portfolioId}`, newState.toString());
  };
  const handleVisitorLogout = () => {
    localStorage.removeItem('visitor');
    localStorage.removeItem('visitorToken');
    setIsVisitorLoggedIn(false);
    setVisitorName('');
    setShowDropdown(false);
    window.dispatchEvent(new Event('visitor-auth-change'));
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    navigate(`${BASE}/visitor-profile`);
  };

  const handleSignIn = () => {
    setShowDropdown(false);
    navigate(`${BASE}/visitor-login`);
  };

  const handleSignUp = () => {
    setShowDropdown(false);
    navigate(`${BASE}/visitor-signup`);
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <div className="initials-circle">
          {initials}
        </div>
      </div>

      <div className="nav-center">
        <NavLink to={`${BASE}/about`}>About</NavLink>
        <NavLink to={`${BASE}/services`}>Services</NavLink>
        <NavLink to={`${BASE}/charges`}>Pricing</NavLink>
        {showVisitorsTab &&  isOwner &&(
          <NavLink to={`${BASE}/visitors`}>Visitors</NavLink>
        )}
      </div>

      <div className="nav-right">
        {isOwner && portfolioId && (
          <div className="visitor-toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showVisitorsTab}
                onChange={handleToggleVisitors}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Visitors</span>
          </div>
        )}
        <div
          className="account-icon"
          onClick={() => setShowDropdown(!showDropdown)}
          title="Account"
        >
          <MdAccountCircle size={40} color="#5b3cd9" />
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            <button className="close-btn" onClick={() => setShowDropdown(false)}>×</button>
            
            {isVisitorLoggedIn ? (
              <>
                <div className="dropdown-user-info">
                  <p className="welcome-text">Welcome, {visitorName}!</p>
                </div>
                <button className="dropdown-item" onClick={handleViewProfile}>
                  👤 View Profile
                </button>
                <button className="dropdown-item logout-btn" onClick={handleVisitorLogout}>
                  🚪 Log Out
                </button>
              </>
            ) : portfolioId ? (
              <>
                <button className="dropdown-item" onClick={handleSignIn}>
                  🔐 Sign In
                </button>
                <button className="dropdown-item" onClick={handleSignUp}>
                  ✍️ Sign Up
                </button>
              </>
            ) : (
              <div style={{ padding: '15px', color: '#666', fontSize: '0.9em' }}>
                Visitor login available on published portfolios only
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}