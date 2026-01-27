import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import Tip from "./components/Tip";
import Footer from "./components/Footer";
import "./App.css";
import EmailMvpApp from "./emailmvp/App";
import ResumeUpload from "./components/ResumeUpload";
import ErrorBoundary from "./components/ErrorBoundary";
import CleaningPage from "./pages/portfolios/cleaningService/src/App.jsx";
import VisitorLogin from "./components/GuestAuth/VisitorLogin.jsx";
import VisitorSignup from "./components/GuestAuth/VisitorSignup.jsx";
import VisitorProfile from "./components/GuestAuth/VisitorProfile.jsx";
import VisitorData from "./pages/portfolios/cleaningService/components/VisitorData";
// import EmailLogin from './components/email/EmailLogin.jsx';
import PortfolioPage from "./pages/portfolios/projectManager/pages/PortfolioPage";
import PhotographerPage from "./pages/portfolios/photographer/PhotographerApp.jsx";
import ExamplePortfolios from "./components/examplePortfolios";
import DataScientistPage from "./pages/dataScientist/pages/DataScientistPage";
import SignUp from "./pages/login/SignUp";
import HandymanShowcasePage from "./pages/portfolios/handyman/HandyManShowcasePage.jsx";
import HandymanPage from "./pages/portfolios/handyman/HandyManPage.jsx";
import EditHandymanPortfolio from "./pages/portfolios/handyman/EditHandymanPortfolio.jsx";
import Occupations from "./components/Occupations";
import LocalVendorApp from "./pages/portfolios/localVendor/LocalVendorApp.jsx";
import CookieConsent from "./components/CookieConsent";
import CookieSettings from "./components/CookieSettings";
import TelemetryVisit from "./components/TelemetryVisit";
import Payment from "./components/Payment";
import SuccessPage from "./components/SuccessPage.jsx";
import FloatingHelpButton from "./components/FloatingHelpButton";
import ITForm from "./components/ITForm";
import OnboardingFlow from "./pages/onboarding/components/OnboardingFlow";
import UserProfile from "./components/UserProfile/UserProfile.jsx";
import OnboardingInfoPage from "./pages/onboarding/OnboardingInfoPage";
import ITAdminPage from "./components/ITAdminPage.jsx";
import TicketingPage from "./pages/ticketing/TicketingPage.jsx";
import PortfolioEditLogViewer from "./components/PortfolioEditLogViewer.jsx";
import { VendorProvider } from "./context/VendorContext.jsx";
import Solutions from "./components/Solutions/Solutions.jsx";
import Vendors from "./components/Solutions/Vendors";
import Restaurant from "./components/Solutions/Restaurant";
import Property from "./components/Solutions/Property";
import Farmers from "./components/Solutions/Farmers";
import AdminRoute from "./components/AdminRoute.jsx";

// ✅ HEALTHCARE CHANGE 1: Removed HealthcareRegister and HealthcareLogin imports
import HealthcareHome from "./pages/portfolios/healthcare/pages/Home.jsx";
import HealthcareServices from "./pages/portfolios/healthcare/pages/Services.jsx";
import HealthcareBlog from "./pages/portfolios/healthcare/pages/blog/Blog.jsx";
import HealthcareBlogPost from "./pages/portfolios/healthcare/pages/blog/BlogPost.jsx";
import HealthcareContact from "./pages/portfolios/healthcare/pages/Contact.jsx";
import HealthcareGallery from "./pages/portfolios/healthcare/pages/Gallery.jsx";
import HealthcareSearch from "./pages/portfolios/healthcare/pages/SearchResults.jsx";
import HealthcareAdminDashboard from "./pages/portfolios/healthcare/pages/admin/AdminDashboard.jsx";
import Landing from "./pages/portfolios/healthcare/pages/Landing.jsx";

import OnlineEditor from "./pages/onlineEditor/onlineEditor.jsx";
import AdminChoicePanel from "./components/AdminChoicePanel.jsx";
import FullStackEditor from "./pages/onlineEditor/webContainerTest.jsx";
import TestPage from "./pages/testPage.jsx";

// ✅ HEALTHCARE CHANGE 2: Added Protected Route Component
function ProtectedHealthcareRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/signup" replace />;
  }
  
  return children;
}

export default function App() {
  const [adminRequested, setAdminRequested] = useState(false);

  const handleGetStarted = () => {
    if (loggedIn) return;
    // Show tip/suggestion for plus button
  };

  const handleRequestAdmin = () => {
    setAdminRequested(true);
  };

  return (
    <Layout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<About onGetStarted={handleGetStarted} />} />
        <Route path="/dashboard" element={<Dashboard onRequestAdmin={handleRequestAdmin} />} />
        <Route path={"/signup"} element={<SignUp />} />
        <Route path="/occupations" element={<Occupations />} />
        <Route
          path="/resume"
          element={
            <VendorProvider>
              <ResumeUpload />
            </VendorProvider>
          }
        />
        <Route path="/portfolios" element={<ExamplePortfolios />} />
        <Route path="/portfolios/ProjectManager/:id" element={<PortfolioPage />} />
        <Route path="/portfolios/software-engineer" />
        <Route path="/portfolios/data-scientist/*" element={<DataScientistPage />} />
        {/* <Route path="/portfolios/localVendor/*" element={<LocalVendorApp />} /> */}
        <Route path="/portfolios/cleaningService/*" element={<CleaningPage />} />
        <Route
          path="/portfolios/localVendor"
          element={
            <VendorProvider forceDefault={true}>
              <LocalVendorApp />
            </VendorProvider>
          }
        />
        //email mvp 
         {/* <Route path="/email/login" element={<EmailLogin />} /> */}
         <Route path="/mvp/*" element={<EmailMvpApp />} />
        <Route path="/portfolios/photographer/*" element={<PhotographerPage />} />
        <Route path="/portfolios/cleaningService/*" element={<CleaningPage />} />
        <Route path="/portfolios/photographer/*" element={<PhotographerPage />} />
        <Route path="/portfolios/handyman" element={<HandymanShowcasePage />} />
        {/* Route 2: The dynamic, data-driven page for a specific user's portfolio */}
        <Route path="/portfolios/handyman/:id" element={<HandymanPage />} />
        {/* Route 3: The page where a logged-in user can edit their portfolio */}
        <Route path="/portfolios/handyman/:id/edit" element={<EditHandymanPortfolio />} />
        {/*successfull subscription page} */}
        <Route path={"/success"} element={<SuccessPage />} />
        <Route path="/support" element={<ITForm />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route
          path="/onboarding_info"
          element={
            <VendorProvider>
              <OnboardingInfoPage />
            </VendorProvider>
          }
        />
        <Route
          path="/portfolios/vendor/:username/:id/*"
          element={
            <VendorProvider>
              <LocalVendorApp />
            </VendorProvider>
          }
        />
        <Route path="/admin_page" element={<ITAdminPage />} />
        <Route
          path="/admin-choice"
          element={
            <AdminRoute>
              <AdminChoicePanel />
            </AdminRoute>
          }
        />
        <Route
          path="/itadmin/logs"
          element={
            <AdminRoute>
              <PortfolioEditLogViewer />
            </AdminRoute>
          }
        />
        <Route
          path="/itadmin/ticketing-system"
          element={
            <AdminRoute>
              <TicketingPage />
            </AdminRoute>
          }
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/vendors" element={<Vendors />} />
        <Route path="/solutions/restaurant" element={<Restaurant />} />
        <Route path="/solutions/property" element={<Property />} />
        <Route path="/solutions/farmers" element={<Farmers />} />
        
        {/* ✅ HEALTHCARE CHANGE 3: Updated healthcare routes */}
        
        {/* Public Routes - No Auth */}
        <Route path="/portfolios/healthcare" element={<Landing />} />
        <Route path="/portfolios/healthcare/search" element={<HealthcareSearch />} />
        
        {/* Demo Routes - No Auth */}
        <Route path="/portfolios/healthcare/demo" element={<HealthcareHome />} />
        <Route path="/portfolios/healthcare/demo/services" element={<HealthcareServices />} />
        <Route path="/portfolios/healthcare/demo/blog" element={<HealthcareBlog />} />
        <Route path="/portfolios/healthcare/demo/blog/:id" element={<HealthcareBlogPost />} />
        <Route path="/portfolios/healthcare/demo/gallery" element={<HealthcareGallery />} />
        <Route path="/portfolios/healthcare/demo/contact" element={<HealthcareContact />} />
        
        {/* User Portfolio Routes - Protected */}
        <Route 
          path="/portfolios/healthcare/:practiceId" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareHome />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/services" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareServices />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/blog" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareBlog />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/blog/:id" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareBlogPost />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/gallery" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareGallery />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/contact" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareContact />
            </ProtectedHealthcareRoute>
          } 
        />
        <Route 
          path="/portfolios/healthcare/:practiceId/admin/dashboard" 
          element={
            <ProtectedHealthcareRoute>
              <HealthcareAdminDashboard />
            </ProtectedHealthcareRoute>
          } 
        />
        
        {/* ❌ REMOVED: These old healthcare auth routes
        <Route path="/portfolios/healthcare/auth/register" element={<HealthcareRegister />} />
        <Route path="/portfolios/healthcare/auth/login" element={<HealthcareLogin />} />
        */}
        
        <Route path="/editor/*" element={<OnlineEditor />} />{" "}
        <Route path="/portfolios/cleaningService/:portfolioId/visitor-login" element={<VisitorLogin />} />
        <Route path="/portfolios/cleaningService/visitor-login" element={<VisitorLogin />} />
        <Route path="/portfolios/cleaningService/:portfolioId/visitor-signup" element={<VisitorSignup />} />
        <Route path="/portfolios/cleaningService/visitor-signup" element={<VisitorSignup />} />
        <Route path="/portfolios/cleaningService/:portfolioId/visitor-profile" element={<VisitorProfile />} />
        <Route path="/portfolios/cleaningService/visitor-profile" element={<VisitorProfile />} />
        <Route path="/portfolios/cleaningService/:portfolioId/visitors" element={<VisitorData />} />
        <Route path="/testPage" element={<FullStackEditor />} />
      </Routes>
      </ErrorBoundary>
      <FloatingHelpButton />
      {adminRequested && <Tip message="Request received! Our admin team will contact you shortly." />}
      <Footer />
      <CookieConsent />
      <CookieSettings />
      <TelemetryVisit />
    </Layout>
  );
}