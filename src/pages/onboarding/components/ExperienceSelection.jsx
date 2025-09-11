import React from "react";

const experienceLevels = [
  {
    id: "student",
    title: "Student / Entry Level",
    description: "Just starting out or in school",
  },
  {
    id: "junior",
    title: "Junior (1-3 years)",
    description: "Some professional experience",
  },
  {
    id: "mid",
    title: "Mid-level (3-7 years)",
    description: "Established in your field",
  },
  {
    id: "senior",
    title: "Senior (7+ years)",
    description: "Extensive experience and expertise",
  },
];

export default function ExperienceSelection({ onSelect, onBack }) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* fade-in animation for header */}
      <div
        className="text-center mb-12 opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="mb-4 text-gray-900">Experience</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your experience level and background
        </p>
      </div>

      {/* experience levels with fade-in-up animation */}
      <div className="space-y-4">
        {experienceLevels.map((level, idx) => (
          <div
            key={level.id}
            onClick={() => onSelect(level.id)}
            className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer opacity-0 -translate-y-8 animate-fade-in-up"
            style={{ animationDelay: `${300 + idx * 120}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 mb-1">{level.title}</h3>
                <p className="text-sm text-gray-600">{level.description}</p>
              </div>
              <div className="w-6 h-6 border border-gray-300 rounded-full group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors"></div>
            </div>
          </div>
        ))}
      </div>

      {/* footer actions */}
      <div className="flex justify-between items-center mt-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "900ms" }}>
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <span className="text-sm text-gray-500">50% complete</span>
      </div>
      {/* custom animation styles */}
      <style>
        {`
          @keyframes fade-in {
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 1s cubic-bezier(.8,0,.2,1) forwards;
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