import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./components/About";
import Dashboard from "./components/Dashboard";
import Tip from "./components/Tip";
import Footer from "./components/Footer";
import "./App.css";
import ResumeUpload from "./components/ResumeUpload";
import CleaningPage from "./pages/portfolios/cleaningService/src/App.jsx";

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
import ITForm from "./components/ITForm"; // Make sure this import is present
import OnboardingFlow from "./pages/onboarding/components/OnboardingFlow";
import UserProfile from "./components/UserProfile/UserProfile.jsx";
import OnboardingInfoPage from "./pages/onboarding/OnboardingInfoPage";
import ITAdminPage from "./components/ITAdminPage.jsx";
import TicketingPage from "./pages/ticketing/TicketingPage.jsx";
import { VendorProvider } from "./context/VendorContext.jsx";
import Solutions from "./components/Solutions/Solutions.jsx";
import Vendors from "./components/Solutions/Vendors";
import Restaurant from "./components/Solutions/Restaurant";
import Property from "./components/Solutions/Property";
import Farmers from "./components/Solutions/Farmers";
import AdminRoute from "./components/AdminRoute.jsx";

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
      <Routes>
        <Route path="/" element={<About onGetStarted={handleGetStarted} />} />
        <Route
          path="/dashboard"
          element={<Dashboard onRequestAdmin={handleRequestAdmin} />}
        />
        <Route path={"/signup"} element={<SignUp />} />
        <Route path="/occupations" element={<Occupations />} />
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/portfolios" element={<ExamplePortfolios />} />
        <Route
          path="/portfolios/project-manager/:username/:id"
          element={<PortfolioPage />}
        />
        <Route path="/portfolios/software-engineer" />
        <Route
          path="/portfolios/data-scientist/*"
          element={<DataScientistPage />}
        />
        {/* <Route path="/portfolios/localVendor/*" element={<LocalVendorApp />} /> */}
        <Route
          path="/portfolios/cleaningService/*"
          element={<CleaningPage />}
        />
        <Route
          path="/portfolios/localVendor"
          element={
            <VendorProvider forceDefault={true}>
              <LocalVendorApp />
            </VendorProvider>
          }
        />
        <Route
          path="/portfolios/photographer/*"
          element={<PhotographerPage />}
        />
        <Route
          path="/portfolios/cleaningService/*"
          element={<CleaningPage />}
        />
        <Route path="/portfolios/photographer/*" element={<PhotographerPage />} />
        <Route path="/portfolios/handyman" element={<HandymanShowcasePage />} />
        {/* Route 2: The dynamic, data-driven page for a specific user's portfolio */}
        <Route path="/portfolios/handyman/:id" element={<HandymanPage />} />
        {/* Route 3: The page where a logged-in user can edit their portfolio */}
        <Route
          path="/portfolios/handyman/:id/edit"
          element={<EditHandymanPortfolio />}
        />
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
          path="/portfolios/vendor/:username/:id"
          element={
            <VendorProvider>
              <LocalVendorApp />
            </VendorProvider>
          }
        />
        <Route path="/admin_page" element={<ITAdminPage />} />
        <Route path="/itadmin/ticketing-system" element={<AdminRoute><TicketingPage /></AdminRoute>} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/vendors" element={<Vendors />} />
        <Route path="/solutions/restaurant" element={<Restaurant />} />
        <Route path="/solutions/property" element={<Property />} />
        <Route path="/solutions/farmers" element={<Farmers />} />
      </Routes>
      <FloatingHelpButton />
      {adminRequested && (
        <Tip message="Request received! Our admin team will contact you shortly." />
      )}
      <Footer />
      <CookieConsent />
      <CookieSettings />
      <TelemetryVisit />
    </Layout>
  );
}
