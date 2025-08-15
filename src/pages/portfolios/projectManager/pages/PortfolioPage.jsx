import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import SummaryCard from "../components/projectManager/SummaryCard";
import EducationCard from "../components/projectManager/EducationCard";
import ExperienceCard from "../components/projectManager/ExperienceCard";
import ProjectsCard from "../components/projectManager/ProjectsCard";
import SkillsCard from "../components/projectManager/SkillsCard";
import FileUploader from "../components/FileUploader";
import { FaCamera } from "react-icons/fa";
import { useParams } from "react-router-dom";
import "../style.css";

const PortfolioPage = () => {
  const [activeSection, setActiveSection] = useState("summary");
  const [animating, setAnimating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_BACKEND_API;
  const userPortfolioId = localStorage.getItem("portfolioId");

  const fetchPortfolio = async (id) => {
    // const res = await axios.get(
    //   `${apiUrl}/portfolio/me?email=janedoe@example.com`
    // );
    const res = await axios.get(`${apiUrl}/portfolio/id/${id}`);
    return res.data;
  };

  //get portfolio id from the url parameters
  //const id = "689b833c90c7ecc042b7b2ac"; //useParams();
  const { id } = useParams();

  const {
    data: portfolio,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => fetchPortfolio(id),
  });

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [activeSection]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // placeholder - we need to handle the actual upload later
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading)
    return (
      <div className="projectManagerStyles">
        <div className="loading-container">
          <div className="page-background-effects">
            <div className="background-blur-1"></div>
            <div className="background-blur-2"></div>
            <div className="background-blur-3"></div>
          </div>
          <div className="flex flex-col items-center z-10">
            <div className="loading-spinner">
              <div className="loading-spinner-base"></div>
              <div className="loading-spinner-active"></div>
            </div>
            <p className="text-body-primary text-lg font-medium">
              Loading portfolio...
            </p>
          </div>
        </div>
        ); if (error) return (
        <div className="loading-container">
          <div className="page-background-effects">
            <div className="background-blur-1"></div>
            <div className="background-blur-2"></div>
            <div className="background-blur-3"></div>
          </div>
          <div className="error-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="error-icon-container">
                <svg
                  className="error-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-heading-section">Error</h2>
                <p className="text-body-muted">Unable to load portfolio data</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  const renderSection = () => {
    switch (activeSection) {
      case "education":
        return <EducationCard portfolio={portfolio} />;
      case "experience":
        return <ExperienceCard portfolio={portfolio} />;
      case "projects":
        return <ProjectsCard portfolio={portfolio} />;
      case "skills":
        return <SkillsCard portfolio={portfolio} />;
      case "fileUpload":
        return <FileUploader portfolio={portfolio} />;
      default:
        return <SummaryCard portfolio={portfolio} />;
    }
  };

  return (
    <div className="projectManagerStyles bg-slate-700">
      <div className="page-background">
        <div className="page-background-effects">
          <div className="background-blur-1"></div>
          <div className="background-blur-2"></div>
          <div className="background-blur-3"></div>
        </div>

        <header className="header-sticky">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-5 px-8">
            <Link
              //to={userPortfolioId ? `/portfolio/${userPortfolioId}` : "/login"}
              className="nav-brand"
            >
              <div className="nav-logo">
                <span className="text-xs font-medium text-white">PM</span>
              </div>
              <span>Portfolio</span>
            </Link>
            <NavBar onSelect={setActiveSection} />
          </div>
        </header>

        <main className="container-main">
          {activeSection === "summary" && (
            <div className="grid-main-layout">
              {/* Profile Card */}
              <div className="col-span-profile group">
                <div className="card-glassmorphism p-8 hover-scale-md">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div
                      className="relative w-24 h-24 group cursor-pointer profile-avatar"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {/* Profile Image or Fallback */}
                      <div className="w-full h-full rounded-full overflow-hidden border border-blue-400/30 shadow-lg">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt={portfolio?.name || "Profile"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-200 font-bold text-4xl">
                            {portfolio?.name?.[0] || "P"}
                          </div>
                        )}
                      </div>

                      {/* Upload overlay */}
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <FaCamera className="text-white text-xl" />
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-1 text-white tracking-tight drop-shadow-sm">
                      {portfolio?.name || "Portfolio Name"}
                    </h2>
                    <p className="text-blue-300 drop-shadow-sm">
                      {portfolio?.title || "Professional Title"}
                    </p>
                  </div>

                  <div className="divider-blue">
                    <h3 className="text-heading-blue mb-3">About</h3>
                    <p className="text-body-secondary mb-7">
                      {portfolio?.bio || "Professional bio and description"}
                    </p>

                    <h3 className="text-heading-blue mb-4">Connect</h3>
                    <div className="flex justify-center gap-4">
                      <a href="#" className="social-icon" aria-label="LinkedIn">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.225 0h-20.45c-0.975 0-1.775 0.8-1.775 1.775v20.45c0 0.975 0.8 1.775 1.775 1.775h20.45c0.975 0 1.775-0.8 1.775-1.775v-20.45c0-0.975-0.8-1.775-1.775-1.775zM7.8 20.425h-3.55v-10.65h3.55v10.65zM6.025 8.175c-1.175 0-2.125-0.95-2.125-2.125s0.95-2.125 2.125-2.125 2.125 0.95 2.125 2.125-0.95 2.125-2.125 2.125zM20.425 20.425h-3.55v-5.875c0-1.325-0.025-3.025-1.85-3.025-1.85 0-2.125 1.425-2.125 2.9v6h-3.55v-10.65h3.4v1.55h0.05c0.475-0.9 1.625-1.85 3.35-1.85 3.6 0 4.275 2.375 4.275 5.475v5.475z"></path>
                        </svg>
                      </a>
                      <a href="#" className="social-icon" aria-label="GitHub">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main info card */}
              <div className="col-span-main group">
                <div className="card-glassmorphism p-8 hover-scale-sm">
                  <h1 className="text-heading-main mb-8">
                    Professional Summary
                  </h1>
                  <p className="text-body-secondary mb-10 text-lg">
                    {portfolio?.summary ||
                      "Summary of your professional experience and goals"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-heading-blue flex items-center mb-4">
                        <span className="section-icon-container">
                          <svg
                            className="section-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                        Contact Information
                      </h3>
                      <ul className="space-y-3 pl-11 pt-4">
                        <li className="contact-item">
                          <span className="contact-emoji">✉️</span>
                          {portfolio?.email || "email@example.com"}
                        </li>
                        <li className="contact-item">
                          <span className="contact-emoji">📱</span>
                          {portfolio?.phone || "+1 234 567 8900"}
                        </li>
                        <li className="contact-item">
                          <span className="contact-emoji">📍</span>
                          {portfolio?.location || "City, Country"}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-heading-blue flex items-center mb-4">
                        <span className="section-icon-container">
                          <svg
                            className="section-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </span>
                        Quick Skills
                      </h3>
                      <div className="flex flex-wrap gap-2 pl-11 pt-4">
                        {portfolio?.skills?.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="badge-skill">
                            {skill}
                          </span>
                        ))}
                        {portfolio?.skills?.length > 5 && (
                          <span className="px-4 py-2 bg-slate-200/90 text-slate-700 rounded-md text-sm font-medium border border-white/50 shadow-md">
                            +{portfolio.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={animating ? "animate-fade-out" : "animate-fade-in"}>
            <div className="card-main-section">{renderSection()}</div>
          </div>
        </main>

        <footer className="footer-base">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center shadow-sm">
                    <span className="text-xs font-medium text-white">PM</span>
                  </div>
                  <span className="text-body-primary font-medium">
                    Portfolio Management
                  </span>
                </div>
                <p className="text-body-muted text-sm">
                  Showcase your professional journey ©{" "}
                  {new Date().getFullYear()}
                </p>
              </div>
              <div className="flex gap-8">
                <a href="#" className="nav-link">
                  Terms
                </a>
                <a href="#" className="nav-link">
                  Privacy
                </a>
                <a href="#" className="nav-link">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PortfolioPage;
