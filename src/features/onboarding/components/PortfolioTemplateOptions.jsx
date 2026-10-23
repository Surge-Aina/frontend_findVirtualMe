import React, { useContext, useState } from "react";
import { AuthContext } from "@/shared/context/AuthContext.jsx";
import { logPortfolioAction } from "@/shared/utils/portfolioEditLogger";
import { toast } from "react-toastify";
import axiosAuth from "@/shared/api/axiosAuth.js";
import { portfolioApi } from "@/shared/api/portfolioApi.js";
import { useNavigate } from "react-router-dom";

export default function PortfolioTemplateOptions() {
  const [creatingHealthcare, setCreatingHealthcare] = useState(false);
  const [creatingHandyman, setCreatingHandyman] = useState(false);
  const [creatingDataScientist, setCreatingDataScientist] = useState(false);
  const [creatingAgentPortfolio, setCreatingAgentPortfolio] = useState(false);
  const { user, refreshUser } = useContext(AuthContext);

  const navigate = useNavigate();

  // ✅ Helper to count healthcare portfolios
  const getHealthcarePortfolioCount = () => {
    if (!user || !user.portfolios) return 0;
    return user.portfolios.filter((p) => p.portfolioType === "Healthcare").length;
  };

  const handleCardClick = async (index) => {
    switch (index) {
      case 0: {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please log in to create a portfolio");
            navigate("/login");
            return;
          }

          const title =
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.name || "My portfolio";

          const createRes = await portfolioApi.create("projectManager", {
            title,
          });

          const created = createRes.data?.portfolio;
          const id = created?._id;
          if (!id) {
            throw new Error(createRes.data?.error || "No portfolio returned");
          }

          try {
            const response = await axiosAuth.patch("/api/users/portfolio-id", {
              portfolioId: id,
              portfolioType: "ProjectManager",
              isPublic: false,
            });
            if (response.status === 200) {
              toast.success("Portfolio created and linked to your account");
            }
          } catch (linkErr) {
            console.warn("addPortfolioId:", linkErr);
            toast.success("Portfolio created");
          }

          navigate(`/portfolios/view/${id}/edit`);
        } catch (error) {
          console.error("error creating portfolio: ", error);
          const msg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Could not create portfolio";
          toast.error(msg);
        }
        break;
      }

      case 2: {
        try {
          setCreatingHandyman(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please log in to create a portfolio");
            navigate("/login");
            return;
          }

          const title =
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.name || "My handyman portfolio";

          const createRes = await portfolioApi.create("handyman", {
            title,
            socialLinks: {},
          });

          const created = createRes.data?.portfolio;
          const id = created?._id;
          if (!id) {
            throw new Error(createRes.data?.error || "No portfolio returned");
          }

          try {
            const response = await axiosAuth.patch("/api/users/portfolio-id", {
              portfolioId: id,
              portfolioType: "Handyman",
              isPublic: false,
            });
            if (response.status === 200) {
              toast.success("Handyman portfolio created and linked to your account");
            }
          } catch (linkErr) {
            console.warn("addPortfolioId:", linkErr);
            toast.success("Handyman portfolio created");
          }

          const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
          await logPortfolioAction("created", {
            sessionId: sessionId,
            userId: user?.id || user?._id || "anonymous",
            portfolioID: id,
            portfolioType: "handyman",
            name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || null,
            email: user?.email || null,
          });

          navigate(`/portfolios/view/${id}/edit`);
        } catch (error) {
          console.error("error creating handyman portfolio: ", error);
          const msg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Could not create portfolio";
          toast.error(msg);
        } finally {
          setCreatingHandyman(false);
        }
        break;
      }

      case 3: {
        try {
          setCreatingDataScientist(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please log in to create a portfolio");
            navigate("/login");
            return;
          }

          const title =
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : user?.name || "My data science portfolio";

          const createRes = await portfolioApi.create("dataScientist", {
            title,
            socialLinks: {},
          });

          const created = createRes.data?.portfolio;
          const id = created?._id;
          if (!id) {
            throw new Error(createRes.data?.error || "No portfolio returned");
          }

          try {
            const response = await axiosAuth.patch("/api/users/portfolio-id", {
              portfolioId: id,
              portfolioType: "DataScientist",
              isPublic: false,
            });
            if (response.status === 200) {
              toast.success("Data science portfolio created and linked to your account");
            }
          } catch (linkErr) {
            console.warn("addPortfolioId:", linkErr);
            toast.success("Data science portfolio created");
          }

          const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
          await logPortfolioAction("created", {
            sessionId: sessionId,
            userId: user?.id || user?._id || "anonymous",
            portfolioID: id,
            portfolioType: "dataScientist",
            name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || null,
            email: user?.email || null,
          });

          navigate(`/portfolios/view/${id}/edit`);
        } catch (error) {
          console.error("error creating data science portfolio: ", error);
          const msg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Could not create portfolio";
          toast.error(msg);
        } finally {
          setCreatingDataScientist(false);
        }
        break;
      }

      case 4: {
        try {
          setCreatingAgentPortfolio(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please log in to create a portfolio");
            navigate("/login");
            return;
          }
          navigate("/portfolios/create/ai", { state: { source: "onboarding" } });
        } catch (error) {
          console.error("error opening AI portfolio creator: ", error);
          const msg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Could not open AI portfolio creator";
          toast.error(msg);
        } finally {
          setCreatingAgentPortfolio(false);
        }
        break;
      }

      case 1: // ✅ Healthcare Professional - UPDATED
        try {
          setCreatingHealthcare(true);
          const token = localStorage.getItem("token");

          if (!token) {
            toast.error("Please log in to create a healthcare portfolio");
            navigate("/login");
            return;
          }

          const currentCount = getHealthcarePortfolioCount();
          console.log("🏥 Creating healthcare portfolio for user:", user.email);
          console.log("📊 User currently has", currentCount, "healthcare portfolio(s)");

          toast.info("Creating your healthcare practice website...");

          const portfolioTitle =
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName} — Practice`
              : `Healthcare Portfolio #${currentCount + 1}`;

          const createRes = await portfolioApi.create("healthcare", {
            title: portfolioTitle,
            socialLinks: {},
          });

          const created = createRes.data?.portfolio;
          const practiceId = created?._id;

          if (!practiceId) {
            throw new Error(createRes.data?.error || "No portfolio returned from server");
          }

          try {
            const portfolioResponse = await axiosAuth.patch("/api/users/portfolio-id", {
              portfolioId: practiceId,
              portfolioType: "Healthcare",
              isPublic: false,
              portfolioName: portfolioTitle,
            });

            if (portfolioResponse.status === 200) {
              toast.success("Healthcare portfolio linked to your account");
            } else {
              toast.warning("Portfolio created but linking had issues");
            }
          } catch (linkError) {
            console.error("Error linking healthcare portfolio to user:", linkError);
            toast.error("Portfolio created but could not link to your account");
          }

          await refreshUser();

          toast.success("Healthcare portfolio created successfully!");

          try {
            const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
            await logPortfolioAction("created", {
              sessionId: sessionId,
              userId: user?.id || user?._id || "anonymous",
              portfolioID: practiceId,
              portfolioType: "Healthcare",
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            });
          } catch (logError) {
            console.log("Could not log action:", logError);
          }

          navigate(`/portfolios/view/${practiceId}/edit`);
          
        } catch (error) {
          console.error("❌ Error creating healthcare portfolio:", error);
          console.error("Error details:", error.response?.data || error.message);

          const errorMessage =
            error.response?.data?.error || 
            error.response?.data?.message || 
            error.message ||
            "Could not create healthcare portfolio";

          toast.error(errorMessage);

          // If authentication error, redirect to login
          if (error.message.includes("Authentication required")) {
            toast.info("Please log in to create a healthcare portfolio");
            navigate("/login");
          }
        } finally {
          setCreatingHealthcare(false);
        }
        break;

      default:
        toast.info("Template coming soon!");
    }

    // ✅ Refresh user data to get updated portfolios
    await refreshUser();
  };

  const portfolioTemplates = [
    {
      name: "Product Manager",
      description: "Showcase your product management skills, roadmaps, and project successes.",
    },
    {
      name: "Healthcare Professional",
      description:
        "Showcase your qualifications, specialties, and patient testimonials. You can create multiple practices!",
      badge: getHealthcarePortfolioCount() > 0 ? `${getHealthcarePortfolioCount()} Created` : null,
    },
    {
      name: "Handyman / Local Repair Services",
      description: "Demonstrate your skills, previous jobs, and customer testimonials.",
    },
    {
      name: "Data Scientist",
      description: "Highlight your analysis, modeling, projects, and dashboards in a terminal-inspired layout.",
    },
    {
      name: "AI Portfolio Creator",
      description: "Describe the portfolio you want and generate an editable block-based portfolio from your prompt.",
    },
  ];

  const cards = [
    { bg: "bg-slate-600 border-slate-900", text: "text-slate-100" },
    { bg: "bg-slate-500 border-slate-700", text: "text-slate-100" },
    { bg: "bg-slate-400 border-slate-600", text: "text-slate-100" },
    { bg: "bg-slate-300 border-slate-500", text: "text-slate-800" },
    { bg: "bg-slate-200 border-slate-400", text: "text-slate-800" },
    { bg: "bg-slate-100 border-slate-300", text: "text-slate-800" },
  ];

  if (creatingHealthcare || creatingHandyman || creatingDataScientist || creatingAgentPortfolio) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-700 animate-pulse">
          {creatingHandyman
            ? "Creating your handyman portfolio..."
            : creatingDataScientist
              ? "Creating your data science portfolio..."
              : creatingAgentPortfolio
                ? "Opening AI portfolio creator..."
                : "Creating your healthcare practice..."}
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          {creatingHandyman
            ? "Setting up your services and contact sections..."
            : creatingDataScientist
              ? "Setting up sections, charts, and your contact block..."
              : creatingAgentPortfolio
                ? "Getting your prompt-based creator ready..."
                : "Setting up your professional healthcare website..."}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <h1 className="text-gray-900 text-2xl font-bold mb-6">Choose a Template</h1>
      {portfolioTemplates.map((template, index) => {
        const style = cards[index % cards.length];
        return (
          <div
            key={index}
            className={`mb-3 rounded-lg p-6 border ${style.bg} hover:shadow-md transition-shadow transition-transform duration-300 cursor-pointer hover:scale-105 relative`}
            onClick={() => handleCardClick(index)}
          >
            <div className={`font-semibold ${style.text} mb-2`}>
              {template.name}
              {template.badge && (
                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">{template.badge}</span>
              )}
            </div>
            <div className={`${style.text} text-opacity-70`}>{template.description}</div>
          </div>
        );
      })}
    </div>
  );
}