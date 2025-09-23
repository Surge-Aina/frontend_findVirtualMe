import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_API;
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function OnboardingInfoPage() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
=======
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${backendUrl}/onboarding/getUser/${id}`);
        setUser(res.data.user);
        console.log("user: ", res.data.user);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
>>>>>>> 20e9cf4 (Initial commit for feature one)

  const handleCardClick = async (index) => {
    switch (index) {
      case 0:
        try {
          const portfolio = user;
          const res = await axios.post(`${backendUrl}/portfolio/add`, {
            portfolio,
          });
          const username = res.data.username;
          const id = res.data._id;
          navigate(`/portfolios/project-manager/${username}/${id}`); //navigate to newly created portfolio -- will be changed later on to navigate(`/${username}/${portfolioName}`) or navigate(`/${portfolioName}`)
        } catch (error) {
          console.log("error creating portfolio: ", error);
        }
        break;

        case 5:
        try {
          const handyman_portfolio = user;
          const res = await axios.post(`${backendUrl}/api/handyman-template`, {
            handyman_portfolio,
          });
          console.log("response: ", res.data);
          const id = res.data._id;
          navigate(`/portfolios/handyman/${id}`)
        } catch (error) {
          console.log("error creating portfolio: ", error);
        }
        break;

      default:
        toast.info("Template comming soon!");
    }
  };

  const borderColors = [
    "border-blue-200",
    "border-green-200",
    "border-purple-200",
    "border-orange-200",
  ];

  const portfolioTemplates = [
    {
      name: "Product Manager",
      description:
        "Showcase your product management skills, roadmaps, and project successes.",
    },
    {
      name: "Data Scientist",
      description:
        "Highlight your data projects, analyses, and machine learning experience.",
    },
    {
      name: "Software Engineer",
      description:
        "Display your coding projects, apps, and technical expertise.",
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
      description:
        "Demonstrate your skills, previous jobs, and customer testimonials.",
    },
  ];

  if (user === null) return <p className="text-gray-600">No user found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-left border border-blue-200 rounded-md p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">
          {user.firstName} {user.lastName}
        </h2>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        {user.phone && (
          <p className="mb-2">
            <strong>Phone:</strong> {user.phone}
          </p>
        )}
        {user.location && (
          <p className="mb-2">
            <strong>Location:</strong> {user.location}
          </p>
        )}
        {user.bio && (
          <p className="mb-2">
            <strong>Bio:</strong>
            {user.bio}
          </p>
        )}
        <p className="mb-2">
          <strong>Goal:</strong> {user.goal}
        </p>
        <p className="mb-2">
          <strong>Industry:</strong> {user.industry}
        </p>
        <p className="mb-2">
          <strong>Experience Level:</strong> {user.experienceLevel}
        </p>
        {user.skills && user.skills.length > 0 && (
          <p className="mb-2">
            <strong>Skills:</strong> {user.skills.join(", ")}
          </p>
        )}
      </div>
      <div>
        <h1 className="text-gray-900 text-2xl font-bold mb-6">
          Choose a Template
        </h1>
        {portfolioTemplates.map((template, index) => (
          <div
            key={index}
            className={`mb-3 rounded-lg p-6 border ${
              borderColors[index % 4]
            } hover:shadow-md hover:border-blue-400 transition-shadow transition-transform duration-300 cursor-pointer hover:scale-105`}
            onClick={() => handleCardClick(index)}
          >
            <div className="font-semibold text-slate-800 mb-2">
              {template.name}
            </div>
            <div className="text-slate-600">{template.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
