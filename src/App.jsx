import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useParams, Outlet, useLocation } from "react-router-dom";
import Layout from "@/shared/components/Layout";
import About from "@/features/landing/About";
import Dashboard from "@/features/dashboard/Dashboard";
import Tip from "@/shared/components/Tip";
import Footer from "@/shared/components/Footer";
import "./App.css";
import EmailMvpApp from "./emailmvp/App";
import ResumeUpload from "./components/ResumeUpload";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import CleaningPage from "./pages/portfolios/cleaningService/src/App.jsx";
import VisitorLogin from "@/features/auth/GuestAuth/VisitorLogin.jsx";
import VisitorSignup from "@/features/auth/GuestAuth/VisitorSignup.jsx";
import VisitorProfile from "@/features/auth/GuestAuth/VisitorProfile.jsx";
import VisitorData from "./pages/portfolios/cleaningService/components/VisitorData";
import PortfolioPage from "./pages/portfolios/projectManager/pages/PortfolioPage";
import PhotographerPage from "./pages/portfolios/photographer/PhotographerApp.jsx";
import ExamplePortfolios from "@/features/landing/ExamplePortfolios";
import DataScientistPage from "./pages/dataScientist/pages/DataScientistPage";
import SignUp from "@/features/auth/SignUp";
import HandymanShowcasePage from "./pages/portfolios/handyman/HandyManShowcasePage.jsx";
import HandymanPage from "./pages/portfolios/handyman/HandyManPage.jsx";
import EditHandymanPortfolio from "./pages/portfolios/handyman/EditHandymanPortfolio.jsx";
import Occupations from "@/features/solutions/Occupations";
import LocalVendorApp from "./pages/portfolios/localVendor/LocalVendorApp.jsx";
import CookieConsent from "@/shared/components/CookieConsent";
import CookieSettings from "@/shared/components/CookieSettings";
import TelemetryVisit from "@/shared/components/TelemetryVisit";
import Payment from "@/features/payments/Payment";
import SuccessPage from "@/features/payments/SuccessPage.jsx";
import FloatingHelpButton from "@/shared/components/FloatingHelpButton";
import ITForm from "@/features/support/ITForm";
import OnboardingFlow from "@/features/onboarding/components/OnboardingFlow";
import UserProfile from "@/features/profile/UserProfile/UserProfile.jsx";
import OnboardingInfoPage from "@/features/onboarding/OnboardingInfoPage";
import TicketingPage from "@/features/support/ticketing/TicketingPage.jsx";
import PortfolioEditLogViewer from "@/features/admin/PortfolioEditLogViewer.jsx";
import { VendorProvider } from "./context/VendorContext.jsx";
import Solutions from "@/features/solutions/Solutions/Solutions.jsx";
import Vendors from "@/features/solutions/Solutions/Vendors";
import Restaurant from "@/features/solutions/Solutions/Restaurant";
import Property from "@/features/solutions/Solutions/Property";
import Farmers from "@/features/solutions/Solutions/Farmers";
import AdminRoute from "@/features/admin/AdminRoute.jsx";

// Healthcare imports
import HealthcareHome from "./pages/portfolios/healthcare/pages/Home.jsx";
import HealthcareServices from "./pages/portfolios/healthcare/pages/Services.jsx";
import HealthcareBlog from "./pages/portfolios/healthcare/pages/blog/Blog.jsx";
import HealthcareBlogPost from "./pages/portfolios/healthcare/pages/blog/BlogPost.jsx";
import HealthcareContact from "./pages/portfolios/healthcare/pages/Contact.jsx";
import HealthcareGallery from "./pages/portfolios/healthcare/pages/Gallery.jsx";
import HealthcareSearch from "./pages/portfolios/healthcare/pages/SearchResults.jsx";
import HealthcareAdminDashboard from "./pages/portfolios/healthcare/pages/admin/AdminDashboard.jsx";
import Landing from "./pages/portfolios/healthcare/pages/Landing.jsx";
import axios from "axios";
import AdminChoicePanel from "@/features/admin/AdminChoicePanel.jsx";
import WidgetOverlay from "./components/WidgetOverlay/WidgetOverlay.jsx";
import { PortfolioProvider } from "@/shared/context/PortfolioContext.jsx";
import AiPortfolioCreatorPage from "./pages/portfolios/AiPortfolioCreatorPage.jsx";
import PrivacyPolicyPage from "@/features/legal/PrivacyPolicyPage.jsx";
import TermsOfServicePage from "@/features/legal/TermsOfServicePage.jsx";

// Unified portfolio (sections/blocks architecture)
import PortfolioRenderer from "./components/PortfolioRenderer.jsx";
import PortfolioEditor from "./components/PortfolioEditor.jsx";
import ForgotPassword from "@/features/auth/PasswordReset/ForgotPassword";
import ResetPassword from "@/features/auth/PasswordReset/ResetPassword";

// ✅ Protected Route Component for Healthcare (uses _id from URL)
function ProtectedHealthcareRoute({ children }) {
  const { practiceId } = useParams(); // This is actually the MongoDB _id
  const [isPublic, setIsPublic] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const checkPublicStatus = async () => {
      if (!practiceId) {
        setIsPublic(false);
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch by _id (practiceId param is the MongoDB _id)
        const response = await axios.get(`${backendUrl}/healthcare/practice/${practiceId}`);
        setIsPublic(response.data.isPublic);
      } catch (error) {
        setIsPublic(false);
      } finally {
        setLoading(false);
      }
    };

    checkPublicStatus();
  }, [practiceId, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Public portfolio → Allow
  if (isPublic) return children;

  // Private + logged in → Allow
  if (token) return children;

  // Private + not logged in → Block
  return <Navigate to="/signup" replace />;
}

//wrapper for widget overaly
//must also wrap the portfolio page route with PortfolioProvider to provide context to the widgets
function WidgetOverlayWrapper() {
  return (
    <>
      {<WidgetOverlay />}
      <Outlet />
    </>
  );
}

export default function App() {
  const [adminRequested, setAdminRequested] = useState(false);
  const location = useLocation();
  const isPortfolioWithOwnFooter =
    location.pathname.startsWith("/portfolios/ProjectManager") ||
    location.pathname.startsWith("/portfolios/handyman") ||
    location.pathname.startsWith("/portfolios/healthcare/") ||
    location.pathname.startsWith("/portfolios/view/");

  const handleGetStarted = () => {
    // Show tip/suggestion for plus button
  };

  const handleRequestAdmin = () => {
    setAdminRequested(true);
  };

  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<About onGetStarted={handleGetStarted} />} />
          <Route path="/dashboard" element={<Dashboard onRequestAdmin={handleRequestAdmin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<SignUp />} />
          <Route path="/occupations" element={<Occupations />} />
          <Route path="/mvp/*" element={<EmailMvpApp />} />
          {/* payment */}
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          {/* Support */}
          <Route path="/support" element={<ITForm />} />
          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingFlow />} />
          {/* Profile */}
          <Route path="/profile" element={<UserProfile />} />
          {/* example portfolios */}
          <Route path="/portfolios" element={<ExamplePortfolios />} />
          <Route path="/portfolios/create/ai" element={<AiPortfolioCreatorPage />} />
          {/* ============ Unified portfolio route (sections/blocks) ============ */}
          <Route path="/portfolios/view" element={
            <PortfolioProvider>
              <WidgetOverlayWrapper />
            </PortfolioProvider>
          }>
            <Route path=":id" element={<PortfolioRenderer />} />
            <Route path=":id/edit" element={<PortfolioEditor />} />
          </Route>

          {/* Project manager =======================Widget Overlay========================= */}
          <Route
            path="/portfolios/ProjectManager"
            element={
              <PortfolioProvider>
                <WidgetOverlayWrapper />
              </PortfolioProvider>
            }
          >
            <Route path=":id" element={<PortfolioPage />} />
          </Route>
          {/* IT Admin Routes */}
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
          <Route path="/admin_page" element={<Navigate to="/admin-choice" replace />} />
          <Route
            path="/admin-choice"
            element={
              <AdminRoute>
                <AdminChoicePanel />
              </AdminRoute>
            }
          />
          {/* Solution Routes */}
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/vendors" element={<Vendors />} />
          <Route path="/solutions/restaurant" element={<Restaurant />} />
          <Route path="/solutions/property" element={<Property />} />
          <Route path="/solutions/farmers" element={<Farmers />} />
          {/* Data Scientist */}
          <Route path="/portfolios/data-scientist/*" element={<DataScientistPage />} />
          {/* Cleaning Service */}
          <Route path="/portfolios/cleaningService/*" element={<CleaningPage />} />
          {/* Local Vendor */}
          <Route
            path="/portfolios/localVendor"
            element={
              <VendorProvider forceDefault={true}>
                <LocalVendorApp />
              </VendorProvider>
            }
          />
          <Route
            path="/resume"
            element={
              <VendorProvider>
                <ResumeUpload />
              </VendorProvider>
            }
          />
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
          {/* Photographer */}
          <Route path="/portfolios/photographer/*" element={<PhotographerPage />} />
          {/* Handyman =======================Widget Overlay========================= */}
          <Route path="/portfolios/handyman" element={<HandymanShowcasePage />} />
          <Route
            path="/portfolios/handyman"
            element={
              <PortfolioProvider>
                <WidgetOverlayWrapper />
              </PortfolioProvider>
            }
          >
            <Route path=":id" element={<HandymanPage />} />
            <Route path=":id/edit" element={<EditHandymanPortfolio />} />
          </Route>

          {/* ==========================================
              HEALTHCARE ROUTES
              practiceId param = MongoDB _id (like other portfolios)
              ========================================== */}

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

          {/* ✅ User Portfolio Routes - :practiceId is the MongoDB _id */}
          {/* Healthcare ====================== Widget Overlay ========================= */}
          <Route
            path="/portfolios/healthcare/:practiceId"
            element={
              <ProtectedHealthcareRoute>
                <PortfolioProvider>
                  <WidgetOverlayWrapper />
                </PortfolioProvider>
              </ProtectedHealthcareRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareHome />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="services"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareServices />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="blog"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareBlog />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="blog/:id"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareBlogPost />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="gallery"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareGallery />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="contact"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareContact />
                </ProtectedHealthcareRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedHealthcareRoute>
                  <HealthcareAdminDashboard />
                </ProtectedHealthcareRoute>
              }
            />
          </Route>

          <Route path="/editor/*" element={<ResumeUpload />} />
          <Route path="/portfolios/cleaningService/:portfolioId/visitor-login" element={<VisitorLogin />} />
          <Route path="/portfolios/cleaningService/visitor-login" element={<VisitorLogin />} />
          <Route path="/portfolios/cleaningService/:portfolioId/visitor-signup" element={<VisitorSignup />} />
          <Route path="/portfolios/cleaningService/visitor-signup" element={<VisitorSignup />} />
          <Route path="/portfolios/cleaningService/:portfolioId/visitor-profile" element={<VisitorProfile />} />
          <Route path="/portfolios/cleaningService/visitor-profile" element={<VisitorProfile />} />
          <Route path="/portfolios/cleaningService/:portfolioId/visitors" element={<VisitorData />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </ErrorBoundary>
      <FloatingHelpButton />
      {adminRequested && <Tip message="Request received! Our admin team will contact you shortly." />}
      {!isPortfolioWithOwnFooter && <Footer />}
      <CookieConsent />
      <CookieSettings />
      <TelemetryVisit />
    </Layout>
  );
}
