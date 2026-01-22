import React, { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { logPortfolioAction } from "../../../utils/portfolioEditLogger";
import { toast } from "react-toastify";
import axios from "axios";
import axiosAuth from "../../../utils/axiosAuth.js";
import { useNavigate } from "react-router-dom";

export default function PortfolioTemplateOptions() {
  const [creatingHealthcare, setCreatingHealthcare] = useState(false);
  const { user, refreshUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  // ✅ Helper to count healthcare portfolios
  const getHealthcarePortfolioCount = () => {
    if (!user || !user.portfolios) return 0;
    return user.portfolios.filter((p) => p.portfolioType === "Healthcare").length;
  };

  const handleCardClick = async (index) => {
    switch (index) {
      // 0 → Project Manager portfolio
      case 0:
        try {
          const portfolio = user;
          console.log("Creating Project Manager portfolio with user: ", portfolio);

          const res = await axios.post(`${backendUrl}/portfolio/add`, {
            portfolio,
          });

          const username = res.data.username;
          const id = res.data._id;

          const response = await axiosAuth.patch("/user/addPortfolioId", {
            portfolioId: id,
            portfolioType: "ProjectManager",
            isPublic: false,
          });

          if (response.status === 200) {
            toast.success("Added portfolio ID to user");
          } else {
            toast.error("Could not add portfolio ID to user:", response.message);
          }

          navigate(`/portfolios/project-manager/${username}/${id}`);
        } catch (error) {
          console.log("Error creating project manager portfolio: ", error);
          toast.error("Could not create project manager portfolio");
        }
        break;

      // 1 → Healthcare Professional portfolio (allows multiple)
      case 1: // Healthcare Professional - ALLOWS MULTIPLE
        try {
          setCreatingHealthcare(true);
          const token = localStorage.getItem("token");

          const currentCount = getHealthcarePortfolioCount();
          console.log("🏥 Creating healthcare portfolio for user:", user.email);
          console.log("📊 User currently has", currentCount, "healthcare portfolio(s)");

          // ✅ Always create a new portfolio (no duplicate check)
          const createResponse = await axiosAuth.post(`/healthcare/auth/register`, {
            firstName: user.firstName || "Doctor",
            lastName: user.lastName || "Name",
            practiceName: `${user.firstName || "Your"} Medical Practice ${
              currentCount > 0 ? `#${currentCount + 1}` : ""
            }`,
            email: user.email || "doctor@example.com",
            password: "temporaryPassword123",
            confirmPassword: "temporaryPassword123",
          });

          console.log("✅ Healthcare registration response:", createResponse.data);

          const { practiceId, token: adminToken, portfolio } = createResponse.data;

          if (adminToken) {
            localStorage.setItem("adminToken", adminToken);
            console.log("✅ Admin token stored");
          }
          if (practiceId) {
            localStorage.setItem("practiceId", practiceId);
            console.log("✅ Practice ID stored:", practiceId);
          }

          // 🔗 Link portfolio to user
          try {
            const portfolioResponse = await axiosAuth.patch("/user/addPortfolioId", {
              portfolioId: portfolio._id,
              portfolioType: "Healthcare",
              isPublic: false,
            });

            if (portfolioResponse.status === 200) {
              console.log("✅ Healthcare portfolio added to user successfully");
              toast.success("Healthcare portfolio linked to your account");
            } else {
              console.warn(
                "⚠️ Unexpected response when adding portfolio:",
                portfolioResponse.status
              );
              toast.warning("Portfolio created but linking had issues");
            }
          } catch (linkError) {
            console.error(
              "❌ Error linking healthcare portfolio to user:",
              linkError
            );
            toast.error("Portfolio created but could not link to your account");
          }

          // ✅ Refresh user to get updated portfolios
          await refreshUser();

          const newCount = getHealthcarePortfolioCount();
          console.log("📊 User now has", newCount, "healthcare portfolio(s)");

          toast.success(`Healthcare portfolio #${newCount} created successfully!`);

          try {
            const sessionId =
              localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
            await logPortfolioAction("created", {
              sessionId: sessionId,
              userId: user?.id || user?._id || "anonymous",
              portfolioID: practiceId,
              portfolioType: "Healthcare",
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            });
            console.log("✅ Portfolio action logged");
          } catch (logError) {
            console.log("⚠️ Could not log action:", logError);
          }

          navigate(`/portfolios/healthcare/${portfolio._id}`);
          toast.success("Your healthcare practice website has been created!");
        } catch (error) {
          console.error("❌ Error creating healthcare portfolio:", error);
          console.error("Error details:", error.response?.data);

          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Could not create healthcare portfolio";

          toast.error(errorMessage);

          if (errorMessage.includes("already registered")) {
            toast.info("Please login to create additional healthcare portfolios");
          }
        } finally {
          setCreatingHealthcare(false);
        }
        break;

      default:
        toast.info("Template coming soon!");
    }

    // ✅ Always refresh user data to get updated portfolios
    await refreshUser();
  };

  const portfolioTemplates = [
    {
      name: "Project Manager",
      description:
        "Showcase your project management skills, roadmaps, and project successes.",
    },
    {
      name: "Healthcare Professional",
      description:
        "Showcase your qualifications, specialties, and patient testimonials. You can create multiple practices!",
      // ✅ Show count if user has healthcare portfolios
      badge:
        getHealthcarePortfolioCount() > 0
          ? `${getHealthcarePortfolioCount()} Created`
          : null,
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

  if (creatingHealthcare) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-700 animate-pulse">
          Creating your healthcare practice...
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Setting up your professional healthcare website...
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
                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  {template.badge}
                </span>
              )}
            </div>
            <div className={`${style.text} text-opacity-70`}>
              {template.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
