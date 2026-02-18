import React, { useContext, useState } from "react";
import { useVendor } from "../../../context/VendorContext.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { logPortfolioAction } from "../../../utils/portfolioEditLogger";
import handymanAPI from "../../../pages/portfolios/handyman/api.js";
import { toast } from "react-toastify";
import axios from "axios";
import axiosAuth from "../../../utils/axiosAuth.js";
import { useNavigate } from "react-router-dom";
import { api } from "../../portfolios/healthcare/lib/api.js";

export default function PortfolioTemplateOptions() {
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [creatingHealthcare, setCreatingHealthcare] = useState(false);
  const { setVendorId } = useVendor();
  const { pendingFile, setPendingFile, user, refreshUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;

  // ✅ Helper to count healthcare portfolios
  const getHealthcarePortfolioCount = () => {
    if (!user || !user.portfolios) return 0;
    return user.portfolios.filter((p) => p.portfolioType === "Healthcare").length;
  };

  const handleCardClick = async (index) => {
    switch (index) {
      case 0:
        try {
          const portfolio = user;
          console.log("00100210102010 portfolio: ", portfolio);
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
            toast.success("Added portfolio ID to User");
          } else {
            toast.error("could not add potfolioID to User:", response.message);
          }
          navigate(`/portfolios/ProjectManager/${id}`);
        } catch (error) {
          console.log("error creating portfolio: ", error);
        }
        break;

      // case 3: // Local Food Vendor
      //   try {
      //     setCreatingVendor(true);
      //     let res;
      //     const fileToSend = user?.file || pendingFile;
      //     if (fileToSend) {
      //       console.log("Injecting vendor file:", fileToSend.name);
      //       const formData = new FormData();
      //       formData.append("file", fileToSend);

      //       formData.append("name", `${user.firstName} ${user.lastName}`);
      //       formData.append("email", user.email);
      //       formData.append("phone", user.phone || "");
      //       formData.append("description", user.bio || "My business portfolio");

      //       toast.info("We're generating your site using your uploaded file. This may take a few moments...");

      //       res = await axios.post(`${backendUrl}/vendor/inject`, formData, {
      //         headers: { "Content-Type": "multipart/form-data" },
      //       });
      //       if (res.status === 201 || res.status === 200) {
      //         toast.success("Vendor portfolio created successfully!");
      //       }

      //       console.log("inject response:", res.data);
      //     } else {
      //       const vendorData = {
      //         name: `${user.firstName} ${user.lastName}`,
      //         email: user.email,
      //         phone: user.phone || "",
      //         description: user.bio || "My business portfolio",
      //       };
      //       res = await axios.post(`${backendUrl}/vendor`, vendorData);
      //       toast.info("Vendor created without uploaded file.");
      //     }

        //   if (res.status === 200 || res.status === 201) {
        //     const vendor = res.data.vendor || res.data;
        //     const username = vendor.username || vendor.name.toLowerCase().replace(/\s+/g, "-");

        //     setVendorId(vendor._id);
        //     setPendingFile(null);

        //     toast.success("Vendor portfolio created successfully!");
        //     navigate(`/portfolios/vendor/${username}/${vendor._id}`);

        //     const response = await axiosAuth.patch("/user/addPortfolioId", {
        //       portfolioId: vendor._id,
        //       portfolioType: "LocalVendor",
        //       isPublic: false,
        //     });

        //     if (response.status === 200) {
        //       toast.success("Portfolio successfully linked to user");
        //     } else {
        //       toast.error("Unexpected response from server");
        //       console.log(response.message);
        //     }
        //   }
        // } catch (err) {
        //   console.error("Vendor portfolio creation failed:", err);
        //   toast.error("Could not create vendor portfolio");
        // } finally {
        //   setCreatingVendor(false);
        // }
        // break;

      case 2:
        try {
          const handyman_portfolio = user;
          const res = await handymanAPI.post(`/api/handyman-template`, {
            hero: { phoneNumber: user?.phone ?? user?.hero?.phoneNumber ?? "" },
            contact: {
              phone: user?.phone ?? "",
              email: user?.email ?? "",
            },
          });

          console.log("response: ", res.data);
          const id = res.data._id;
          const response = await axiosAuth.patch("/user/addPortfolioId", {
            portfolioId: id,
            portfolioType: "Handyman",
            isPublic: false,
          });

          if (response.status === 200) {
            toast.success("Portfolio successfully linked to user");
          } else {
            toast.error("Unexpected response from server");
            console.log(response.message);
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

          navigate(`/portfolios/handyman/${id}`);
        } catch (error) {
          console.log("error creating portfolio: ", error);
        }
        break;

      // case 6: // Cleaning Lady Portfolio
      //   try {
      //     const token = localStorage.getItem("token");

      //     const createResponse = await axios.post(
      //       `${backendUrl}/api/portfolios/new-portfolio`,
      //       {
      //         slug: `${user.firstName?.toLowerCase() || "user"}-cleaning-${Date.now()}`,
      //         templateType: "cleaning-service",
      //         businessName: `${user.firstName || "My"} Cleaning Service`,
      //         contactInfo: {
      //           phone: user.phone || "",
      //           email: user.email || "",
      //         },
      //         roomPricing: [
      //           { roomType: "bedroom", price: 50 },
      //           { roomType: "kitchen", price: 70 },
      //           { roomType: "bathroom", price: 40 },
      //           { roomType: "livingRoom", price: 60 },
      //         ],
      //       },
      //       { headers: { Authorization: `Bearer ${token}` } }
      //     );

      //     const newPortfolioId = createResponse.data.portfolio._id;
      //     const response = await axiosAuth.patch("/user/addPortfolioId", {
      //       portfolioId: newPortfolioId,
      //       portfolioType: "CleaningLady",
      //       isPublic: false,
      //     });

      //     if (response.status === 200) {
      //       toast.success("Portfolio successfully linked to user");
      //     } else {
      //       toast.error("Unexpected response from server");
      //       console.log(response.message);
      //     }
      //     navigate(`/portfolios/cleaningService/${newPortfolioId}/about`);
      //     toast.success("Your cleaning portfolio has been created!");
      //   } catch (error) {
      //     console.error("Error creating cleaning portfolio:", error);
      //     toast.error(error.response?.data?.message || "Could not create portfolio");
      //   }
      //   break;

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

          // ✅ Use new API endpoint that integrates with main platform
          const createResponse = await api.createHealthcarePortfolio();

          console.log("✅ Healthcare portfolio created:", createResponse);

          const { practiceId, portfolio, subdomain } = createResponse;

          if (!practiceId) {
            throw new Error("No practice ID returned from server");
          }

          // ✅ Link portfolio to user
          try {
            const portfolioResponse = await axiosAuth.patch("/user/addPortfolioId", {
              portfolioId: practiceId, // This is the MongoDB _id
              portfolioType: "Healthcare",
              isPublic: false,
              portfolioName: portfolio?.portfolioName || `Healthcare Portfolio #${currentCount + 1}`,
            });

            if (portfolioResponse.status === 200) {
              console.log("✅ Healthcare portfolio linked to user successfully");
              toast.success("Healthcare portfolio linked to your account");
            } else {
              console.warn("⚠️ Unexpected response when linking portfolio:", portfolioResponse.status);
              toast.warning("Portfolio created but linking had issues");
            }
          } catch (linkError) {
            console.error("❌ Error linking healthcare portfolio to user:", linkError);
            toast.error("Portfolio created but could not link to your account");
          }

          // ✅ Refresh user to get updated portfolios
          await refreshUser();

          const newCount = getHealthcarePortfolioCount();
          console.log("📊 User now has", newCount, "healthcare portfolio(s)");

          toast.success(`Healthcare portfolio created successfully!`);

          // ✅ Log portfolio creation
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
            console.log("✅ Portfolio action logged");
          } catch (logError) {
            console.log("⚠️ Could not log action:", logError);
          }

          // ✅ Navigate to admin dashboard
          navigate(`/portfolios/healthcare/${practiceId}/admin/dashboard`);
          
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
    // {
    //   name: "Data Scientist",
    //   description: "Highlight your data projects, analyses, and machine learning experience.",
    // },
    // {
    //   name: "Software Engineer",
    //   description: "Display your coding projects, apps, and technical expertise.",
    // },
    // {
    //   name: "Local Food Vendor",
    //   description: "Share your menu, business story, and customer favorites.",
    // },
    // {
    //   name: "Photographer",
    //   description: "Showcase your portfolio, shoots, and artistic style.",
    // },
    
    // {
    //   name: "Cleaning Lady Portfolio",
    //   description: "Demonstrate your services, skills and expand your business.",
    // },
    
  ];

  const cards = [
    { bg: "bg-slate-600 border-slate-900", text: "text-slate-100" },
    { bg: "bg-slate-500 border-slate-700", text: "text-slate-100" },
    { bg: "bg-slate-400 border-slate-600", text: "text-slate-100" },
    { bg: "bg-slate-300 border-slate-500", text: "text-slate-800" },
    { bg: "bg-slate-200 border-slate-400", text: "text-slate-800" },
    { bg: "bg-slate-100 border-slate-300", text: "text-slate-800" },
  ];

  if (creatingVendor || creatingHealthcare) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-700 animate-pulse">
          {creatingVendor ? "Creating your vendor site..." : "Creating your healthcare practice..."}
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          {creatingVendor
            ? "This may take up to a minute as we process your file."
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