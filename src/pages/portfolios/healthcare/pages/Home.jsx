import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  FaUserMd,
  FaHeartbeat,
  FaMicroscope,
  FaShieldAlt,
  FaProcedures,
  FaTooth,
  FaCalendarCheck,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/Footer";
import { usePortfolio } from "../../../../context/PortfolioContext";

export default function Home({ portfolioId }) {
  const { practiceId: urlId } = useParams();
  const practiceId = portfolioId || urlId;
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {setPortfolioId, setPortfolioType, setPortfolioOwner, clearPortfolio} = usePortfolio();

  useEffect(() => {
    // Handle demo vs user portfolio
    if (practiceId === "demo") {
      loadDemoData();
    } else {
      // ✅ Check auth for non-demo portfolios
      const token = localStorage.getItem("token");
      // if (!token) {
      //   navigate('/login');
      //   return;
      // }
      loadData();
    }
  }, [practiceId]);

  // set portfolio context for widgets
  useEffect(() => {
    //for demo dont set portfolio context
    if (practiceId === "demo") {
      clearPortfolio();
      return;
    } else {
      setPortfolioId(userData?._id || practiceId); // Use userId if available, otherwise fallback to practiceId
      setPortfolioType("HealthcarePortfolio");
      setPortfolioOwner({id: userData?.userId, name: userData?.practice.name, email: userData?.contact.email });
    }
  }, [practiceId, userData]);


  const loadDemoData = async () => {
    try {
      setLoading(true);
      const data = await api.getDemoData(); // No auth required
      setUserData(data);
    } catch (error) {
      console.error("Error loading demo data:", error);
      setError("Demo not available");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getPracticeData(practiceId);
      setUserData(data);
      console.log("Loaded practice data:", data);
    } catch (error) {
      console.error("Error loading practice data:", error);
      setError("Practice not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading practice...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Practice Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The practice you're looking for doesn't exist."}</p>
          <Link
            to="/portfolios/healthcare"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Back to Healthcare Home
          </Link>
        </div>
      </div>
    );
  }

  // Get visibility settings (default all to true)
  const statsVisibility = userData?.statsVisibility || {};
  const showStatsSection = statsVisibility.showStatsSection ?? true;

  // Stats data - all 4 fixed stats
  const statsData = [
    {
      key: "yearsExperience",
      icon: FaCalendarCheck,
      value: userData?.stats?.yearsExperience,
      label: "Years Experience",
    },
    { key: "patientsServed", icon: FaUsers, value: userData?.stats?.patientsServed, label: "Patients Served" },
    { key: "successRate", icon: FaChartLine, value: userData?.stats?.successRate, label: "Success Rate" },
    { key: "doctorsCount", icon: FaUserMd, value: userData?.stats?.doctorsCount, label: "Expert Doctors" },
  ];

  // Filter visible stats - only check visibility toggle, show even if value is '0' or empty
  const visibleStats = statsData.filter((stat) => {
    const isVisible = statsVisibility[stat.key] ?? true; // Check toggle (default true)
    const hasValue = stat.value !== undefined && stat.value !== null && stat.value !== ""; // Has any value (including '0')
    return isVisible && hasValue;
  });

  // Get grid classes based on number of visible stats - always centered
  const getGridClasses = () => {
    const count = visibleStats.length;
    if (count === 1) return "flex justify-center";
    if (count === 2) return "flex justify-center gap-16 md:gap-24";
    if (count === 3) return "flex justify-center gap-8 md:gap-16";
    return "grid grid-cols-2 lg:grid-cols-4 gap-8"; // 4 items - full grid
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={userData} practiceId={practiceId} />

      {/* ✅ Hero Section - Use UI customization */}
      <section
        className="relative text-white pt-30 pb-20 bg-gradient-to-br from-blue-700 to-blue-900"
        style={
          userData?.ui?.hero?.backgroundImage
            ? {
                backgroundImage: `url(${userData.ui.hero.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        {/* Optional overlay for readability */}
        {userData?.ui?.hero?.backgroundImage && <div className="absolute inset-0 bg-black/40"></div>}

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {userData?.practice?.tagline || "Your Health, Our Priority"}
          </h1>

          <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-3xl mx-auto">
            {userData?.practice?.description || "Providing quality healthcare services."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={`/portfolios/healthcare/${practiceId}/contact`}
              className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
            >
              {userData?.ui?.hero?.primaryButtonText || "Get Started"}
            </Link>

            <Link
              to={`/portfolios/healthcare/${practiceId}/services`}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              {userData?.ui?.hero?.secondaryButtonText || "Learn More"}
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Stats Section - Only show if enabled and has visible stats */}
      {showStatsSection && visibleStats.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className={getGridClasses()}>
              {visibleStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.key} className="text-center group">
                    <div className="bg-blue-50 group-hover:bg-blue-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center transition-all">
                      <Icon className="text-blue-600 group-hover:text-white text-3xl transition-colors" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {stat.value || "0"}
                      {stat.key === "successRate" ? "%" : "+"}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ✅ UPDATED: Admin Access Link - only show for portfolio owner */}
      {practiceId !== "demo" && (
        <Link
          to={`/portfolios/healthcare/${practiceId}/admin/dashboard`}
          className="fixed bottom-4 left-4 z-50 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 opacity-20 hover:opacity-100"
        >
          Admin
        </Link>
      )}

      <Footer userData={userData} practiceId={practiceId} />
      <ScrollToTop />
    </div>
  );
}
