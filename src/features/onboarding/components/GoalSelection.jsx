import React, { useState, useContext } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import { Search, TrendingUp, Briefcase, Users, ChevronRight } from "lucide-react";
const goals = [
  {
    id: "find-job",
    title: "Find a job",
    description: "Showcase your skills to employers",
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "grow-business",
    title: "Grow my brand/business",
    description: "Establish your professional identity",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    id: "showcase-work",
    title: "Showcase my work",
    description: "Display your best projects",
    icon: Briefcase,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    id: "attract-clients",
    title: "Attract freelance clients",
    description: "Build trust with potential clients",
    icon: Users,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

export default function GoalSelection({ onSelect, onFileUpload }) {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const loading = false;
  const [, setFile] = useState(null);
  const { setPendingFile } = useContext(AuthContext);

  const handleResumeChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResumeFileName(selectedFile.name);
    setResumeUploaded(false);
    setUploadError("");
    setPendingFile(selectedFile); // Store globally in context

    if (typeof onFileUpload === "function") {
      onFileUpload(selectedFile); // Pass to OnboardingFlow
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-cy="goal-selection">
      {/* fade-in animation for header */}
      <div className="text-center mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <h1 className="mb-4 text-gray-900 text-2xl md:text-3xl font-bold">What's your main goal?</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us personalize your experience by telling us what you want to achieve
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal, idx) => {
          const IconComponent = goal.icon;
          return (
            <div
              key={goal.id}
              data-cy={`goal-card-${goal.id}`}
              onClick={() => onSelect(goal.id)}
              className={`group relative bg-white rounded-lg p-6 border ${goal.border} hover:shadow-md hover:border-blue-400 transition-shadow transition-transform duration-300 cursor-pointer hover:scale-105 opacity-0 animate-fade-in`}
              style={{ animationDelay: `${300 + idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${goal.bg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${goal.color}`} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-1 font-semibold">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
      {/* resume upload section */}
      <div
        className="mt-16 text-center opacity-0 animate-fade-in-up"
        data-cy="resume-upload-section"
        style={{ animationDelay: "700ms" }}
      >
        <h2 className="mb-2 text-lg md:text-xl font-semibold text-gray-900" style={{ fontFamily: "inherit" }}>
          Upload Your Resume
        </h2>
        <p className="mb-4 text-gray-600 max-w-xl mx-auto text-sm">
          Easily upload your PDF resume to enhance your portfolio and showcase your experience.
        </p>
        <label htmlFor="resume-upload" className="inline-block">
          <input
            id="resume-upload"
            type="file"
            data-cy="resume-upload-input"
            accept="application/pdf"
            className="hidden"
            onChange={handleResumeChange}
            disabled={loading}
          />
          <span
            className={`px-6 py-2 bg-blue-900 text-white rounded-md shadow hover:bg-blue-800 cursor-pointer font-mono text-base font-semibold inline-block transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-400 border-r-2 border-blue-800"></span>
                <span className="text-blue-200 font-semibold animate-pulse">Uploading...</span>
              </span>
            ) : (
              "Choose PDF File"
            )}
          </span>
        </label>
        {resumeUploaded && (
          <>
            <div className="mt-4 text-green-600 font-semibold">Resume "{resumeFileName}" uploaded successfully!</div>
            <div className="mt-2 text-blue-700 text-sm font-medium">
              You can continue with onboarding while we process your resume in the background.
            </div>
          </>
        )}
        {uploadError && <div className="mt-4 text-red-600 font-semibold">{uploadError}</div>}
      </div>
      {/* tailwind animation */}
      <style>
        {`
          @keyframes fade-in {
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 1s cubic-bezier(.8,0,.3,1) forwards;
          }
          @keyframes fade-in-up {
            to {
              opacity: 1;
              transform: none;
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.7s cubic-bezier(.8,0,.2,1) forwards;
          }
        `}
      </style>
    </div>
  );
}
