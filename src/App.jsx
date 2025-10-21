//testing preview
import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import About from "./components/About";
import AdminRoute from "./components/AdminRoute.jsx";
import CookieConsent from "./components/CookieConsent";
import CookieSettings from "./components/CookieSettings";
import Dashboard from "./components/Dashboard";
import ExamplePortfolios from "./components/examplePortfolios";
import FloatingHelpButton from "./components/FloatingHelpButton";
import Footer from "./components/Footer";
import ITAdminPage from "./components/ITAdminPage.jsx";
import ITForm from "./components/ITForm"; // Make sure this import is present
import Layout from "./components/Layout";
import Occupations from "./components/Occupations";
import Payment from "./components/Payment";
import ResumeUpload from "./components/ResumeUpload";
import Farmers from "./components/Solutions/Farmers";
import Property from "./components/Solutions/Property";
import Restaurant from "./components/Solutions/Restaurant";
import Solutions from "./components/Solutions/Solutions.jsx";
import Vendors from "./components/Solutions/Vendors";
import SuccessPage from "./components/SuccessPage.jsx";
import TelemetryVisit from "./components/TelemetryVisit";
import Tip from "./components/Tip";
import UserProfile from "./components/UserProfile/UserProfile.jsx";
import { VendorProvider } from "./context/VendorContext.jsx";
import DataScientistPage from "./pages/dataScientist/pages/DataScientistPage";
import SignUp from "./pages/login/SignUp";
import OnboardingFlow from "./pages/onboarding/components/OnboardingFlow";
import OnboardingInfoPage from "./pages/onboarding/OnboardingInfoPage";
import CleaningPage from "./pages/portfolios/cleaningService/src/App.jsx";
import EditHandymanPortfolio from "./pages/portfolios/handyman/EditHandymanPortfolio.jsx";
import HandymanPage from "./pages/portfolios/handyman/HandyManPage.jsx";
import HandymanShowcasePage from "./pages/portfolios/handyman/HandyManShowcasePage.jsx";
import LocalVendorApp from "./pages/portfolios/localVendor/LocalVendorApp.jsx";
import PhotographerPage from "./pages/portfolios/photographer/PhotographerApp.jsx";
import PortfolioPage from "./pages/portfolios/projectManager/pages/PortfolioPage";
import TicketingPage from "./pages/ticketing/TicketingPage.jsx";

export default function App() {
  const [adminRequested, setAdminRequested] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  const primaryHostList = useMemo(() => {
    const envHosts = import.meta.env.VITE_PRIMARY_HOSTS;
    const defaults = [
      "localhost",
      "127.0.0.1",
      "findvirtualme.com",
      "www.findvirtualme.com",
      "findvirtual.me",
      "www.findvirtual.me",
    ];
    if (!envHosts) {
      return defaults;
    }
    return [
      ...defaults,
      ...envHosts
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean),
    ];
  }, []);
  const domainLookupAttemptedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !backendUrl) {
      return;
    }

    if (domainLookupAttemptedRef.current) {
      return;
    }

    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.endsWith(".vercel.app") ||
      primaryHostList.some((host) => host.toLowerCase() === hostname)
    ) {
      return;
    }

    domainLookupAttemptedRef.current = true;
    const controller = new AbortController();
    const encodedHost = encodeURIComponent(hostname);

    fetch(`${backendUrl}/api/domains/lookup/${encodedHost}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const message = await response.text();
          throw new Error(
            `Domain lookup failed: ${response.status} ${message}`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (!data || !data.success || !data.portfolioId) {
          return;
        }

        const targetPath =
          data.portfolioPath ||
          buildPortfolioPath({
            portfolioId: data.portfolioId,
            user: data.user,
          });

        const currentPath = window.location.pathname;

        if (targetPath && targetPath !== currentPath) {
          navigate(targetPath, { replace: true });
          if (currentPath === "/") {
            window.history.replaceState(null, "", "/");
          }
        }
      })
      .catch((error) => {
        console.warn("[custom-domain] lookup failed:", error.message);
      });

    return () => {
      domainLookupAttemptedRef.current = false;
      controller.abort();
    };
  }, [backendUrl, navigate, primaryHostList]);

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

function buildPortfolioPath({ portfolioId, user }) {
  if (!portfolioId) {
    return null;
  }

  const industry = (user?.industry || "").toLowerCase();
  const username = user?.username;

  switch (industry) {
    case "handyman":
      return `/portfolios/handyman/${portfolioId}`;
    case "photographer":
      return `/portfolios/photographer/${portfolioId}`;
    case "local_vendor":
    case "local-vendor":
    case "vendor":
      if (username) {
        return `/portfolios/vendor/${username}/${portfolioId}`;
      }
      return `/portfolios/localVendor`;
    case "project_manager":
    case "project-manager":
    case "project manager":
    default:
      if (username) {
        return `/portfolios/project-manager/${username}/${portfolioId}`;
      }
      return null;
  }
}
