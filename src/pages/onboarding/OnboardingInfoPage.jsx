import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import PortfolioTemplateOptions from "./components/PortfolioTemplateOptions";

export default function OnboardingInfoPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

      <div className="mb-6">
        {/* Title and icon centered above the box */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800">AI Portfolio Creator</h3>
        </div>

        {/* Main content box */}
        <div className="rounded-lg p-6 border bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-left">
              <p className="text-slate-600 leading-relaxed mb-3">
                Describe the portfolio you want and generate a normal editable portfolio from your prompt. The result
                uses the same block system as your other portfolios.
              </p>
              <div className="flex items-center text-sm text-slate-500">
                <span className="flex items-center mr-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Prompt-driven generation
                </span>
                <span className="flex items-center mr-4">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Unified portfolio blocks
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Edit after creation
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/portfolios/create/ai", { state: { source: "onboarding" } })}
              className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 ml-6 whitespace-nowrap hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center">
                Open AI Creator
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <PortfolioTemplateOptions />
      </div>
    </div>
  );
}
