import React, { useContext, useState } from "react";
import { useVendor } from "../../../context/VendorContext.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { logPortfolioAction } from "../../../utils/portfolioEditLogger";
import handymanAPI from "../../../pages/portfolios/handyman/api.js";
import { toast } from "react-toastify";
import axios from "axios";
import axiosAuth from "../../../utils/axiosAuth.js";
import { useNavigate } from "react-router-dom";

export default function PortfolioTemplateOptions() {
  const [creatingVendor, setCreatingVendor] = useState(false);
  const { setVendorId } = useVendor();
  const { pendingFile, setPendingFile, user, refreshUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;

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
          navigate(`/portfolios/project-manager/${username}/${id}`); //navigate to newly created portfolio -- will be changed later on to navigate(`/${username}/${portfolioName}`) or navigate(`/${portfolioName}`)
        } catch (error) {
          console.log("error creating portfolio: ", error);
        }
        break;

      case 3: // Local Food Vendor
        try {
          setCreatingVendor(true); // ⏳ show loader
          let res;
          const fileToSend = user?.file || pendingFile;
          if (fileToSend) {
            console.log("Injecting vendor file:", fileToSend.name);
            const formData = new FormData();
            formData.append("file", fileToSend); // must match `upload.single("file")`

            // optionally extra metadata if uploaded doesn't have these values, so json doesnt fail
            formData.append("name", `${user.firstName} ${user.lastName}`);
            formData.append("email", user.email);
            formData.append("phone", user.phone || "");
            formData.append("description", user.bio || "My business portfolio");

            toast.info("We're generating your site using your uploaded file. This may take a few moments...");

            res = await axios.post(`${backendUrl}/vendor/inject`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.status === 201 || res.status === 200) {
              toast.success("Vendor portfolio created successfully!");
              // setPendingFile(null);
            }

            console.log("inject response:", res.data);
          } else {
            const vendorData = {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phone || "",
              description: user.bio || "My business portfolio",
            };
            res = await axios.post(`${backendUrl}/vendor`, vendorData);
            toast.info("Vendor created without uploaded file.");
          }

          if (res.status === 200 || res.status === 201) {
            const vendor = res.data.vendor || res.data;
            const username = vendor.username || vendor.name.toLowerCase().replace(/\s+/g, "-");

            // ✅ Store the vendor ID in context for global use
            setVendorId(vendor._id);

            // ✅ Clear pending file after successful injection
            setPendingFile(null);

            toast.success("Vendor portfolio created successfully!");
            navigate(`/portfolios/vendor/${username}/${vendor._id}`);

            const response = await axiosAuth.patch("/user/addPortfolioId", {
              portfolioId: vendor._id,
              portfolioType: "LocalVendor",
              isPublic: false,
            });

            if (response.status === 200) {
              toast.success("Portfolio successfully linked to user");
            } else {
              toast.error("Unexpected response from server");
              console.log(response.message);
            }
          }
        } catch (err) {
          console.error("Vendor portfolio creation failed:", err);
          toast.error("Could not create vendor portfolio");
        } finally {
          setCreatingVendor(false); // ✅ always stop loader
        }
        break;

      case 5:
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

          // Log portfolio creation action
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
      case 6: // Cleaning Lady Portfolio
        try {
          const token = localStorage.getItem("token");

          //   // Check if user already has a portfolio
          //   const checkResponse = await axios.get(`${backendUrl}/api/portfolios/my-portfolio`, {
          //     headers: { Authorization: `Bearer ${token}` },
          //   });

          //   if (checkResponse.data.portfolio) {
          //     // They already have one, navigate to it
          //     const portfolioId = checkResponse.data.portfolio._id;
          //     const response = await axiosAuth.patch("/user/addPortfolioId", {
          //       portfolioId: portfolioId,
          //       portfolioType: "CleaningLady",
          //       isPublic: false,
          //     });

          //     if (response.status === 200) {
          //       toast.success("Portfolio successfully linked to user");
          //     } else {
          //       toast.error("Unexpected response from server");
          //       console.log(response.message);
          //     }
          //     navigate(`/portfolios/cleaningService/${portfolioId}/about`);
          //     toast.info("Opening your portfolio");
          //     return;
          //   }

          // They don't have one - create it with defaults
          const createResponse = await axios.post(
            `${backendUrl}/api/portfolios/new-portfolio`,
            {
              slug: `${user.firstName?.toLowerCase() || "user"}-cleaning-${Date.now()}`,
              templateType: "cleaning-service",
              businessName: `${user.firstName || "My"} Cleaning Service`,
              contactInfo: {
                phone: user.phone || "",
                email: user.email || "",
              },
              roomPricing: [
                { roomType: "bedroom", price: 50 },
                { roomType: "kitchen", price: 70 },
                { roomType: "bathroom", price: 40 },
                { roomType: "livingRoom", price: 60 },
              ],
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newPortfolioId = createResponse.data.portfolio._id;
          const response = await axiosAuth.patch("/user/addPortfolioId", {
            portfolioId: newPortfolioId,
            portfolioType: "CleaningLady",
            isPublic: false,
          });

          if (response.status === 200) {
            toast.success("Portfolio successfully linked to user");
          } else {
            toast.error("Unexpected response from server");
            console.log(response.message);
          }
          navigate(`/portfolios/cleaningService/${newPortfolioId}/about`);
          toast.success("Your cleaning portfolio has been created!");
        } catch (error) {
          console.error("Error creating cleaning portfolio:", error);
          toast.error(error.response?.data?.message || "Could not create portfolio");
        }
        break;
      case 7: // Healthcare Professional
  try {
    const token = localStorage.getItem("token");
    
    // Create healthcare practice via backend
    const createResponse = await axios.post(
      `${backendUrl}/healthcare/auth/register`,
      {
        firstName: user.firstName || 'Doctor',
        lastName: user.lastName || 'Name',
        practiceName: `${user.firstName || 'Your'} Medical Practice`,
        email: user.email || 'doctor@example.com',
        password: 'temporaryPassword123', // Will be changed by user
        confirmPassword: 'temporaryPassword123'
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    const { practiceId, token: adminToken } = createResponse.data;
    
    // Store tokens
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
    }
    if (practiceId) {
      localStorage.setItem('practiceId', practiceId);
    }

    // Add portfolio to user
    const response = await axiosAuth.patch("/user/addPortfolioId", {
      portfolioId: practiceId,
      portfolioType: "Healthcare",
      isPublic: false,
    });

    if (response.status === 200) {
      toast.success("Healthcare portfolio successfully created!");
    } else {
      toast.error("Portfolio created but couldn't link to user");
      console.log(response.message);
    }

    // Log portfolio creation
    try {
      const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
      await logPortfolioAction("created", {
        sessionId: sessionId,
        userId: user?.id || user?._id || "anonymous",
        portfolioID: practiceId,
        portfolioType: "healthcare",
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      });
    } catch (logError) {
      console.log("Could not log action:", logError);
    }
    // Navigate to healthcare portfolio
    navigate(`/portfolios/healthcare/${practiceId}`);
    toast.success("Your healthcare practice website has been created!");
    
  } catch (error) {
    console.error("Error creating healthcare portfolio:", error);
    toast.error(error.response?.data?.error || "Could not create healthcare portfolio");
  }
  break;


      default:
        toast.info("Template comming soon!");
    }

    refreshUser();
  };

  const portfolioTemplates = [
    {
      name: "Product Manager",
      description: "Showcase your product management skills, roadmaps, and project successes.",
    },
    {
      name: "Data Scientist",
      description: "Highlight your data projects, analyses, and machine learning experience.",
    },
    {
      name: "Software Engineer",
      description: "Display your coding projects, apps, and technical expertise.",
    },
    {
      name: "Local Food Vendor",
      description: "Share your menu, business story, and customer favorites.",
    },
    {
      name: "Photographer",
      description: "Showcase your portfolio, shoots, and artistic style.",
    },
    {
      name: "Handyman / Local Repair Services",
      description: "Demonstrate your skills, previous jobs, and customer testimonials.",
    },
    {
      name: "Cleaning Lady Portfolio",
      description: "Demonstrate your services, skils and expand .",
    },
    {
      name: "Healthcare Professional",
      description: "Showcase your qualifications, specialties, and patient testimonials.",
    }
  ];

  // const borderColors = ["border-blue-400 bg-blue-100", "border-green-400 bg-green-100", "border-purple-400 bg-purple-100", "border-orange-400 bg-orange-100"];

  const cards = [
    { bg: "bg-slate-600 border-slate-900", text: "text-slate-100" },
    { bg: "bg-slate-500 border-slate-700", text: "text-slate-100" },
    { bg: "bg-slate-400 border-slate-600", text: "text-slate-100" },
    { bg: "bg-slate-300 border-slate-500", text: "text-slate-800" },
    { bg: "bg-slate-200 border-slate-400", text: "text-slate-800" },
    { bg: "bg-slate-100 border-slate-300", text: "text-slate-800" },
  ];

  if (creatingVendor) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-slate-700 animate-pulse">Creating your vendor site...</h2>
        <p className="text-slate-500 text-sm mt-2">This may take up to a minute as we process your file.</p>
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
            className={`mb-3 rounded-lg p-6 border ${style.bg} hover:shadow-md transition-shadow transition-transform duration-300 cursor-pointer hover:scale-105`}
            onClick={() => handleCardClick(index)}
          >
            <div className={`font-semibold ${style.text} mb-2`}>{template.name}</div>
            <div className={`${style.text} text-opacity-70`}>{template.description}</div>
          </div>
        );
      })}
    </div>
  );
}
