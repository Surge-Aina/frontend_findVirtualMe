import React from "react";

export default function ProgressBar({ currentStep, totalSteps, stepLabels }) {
  const progressPercentage = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8" data-cy="progress-bar">
      {/* step labels */}
      <div className="flex justify-between mb-2 px-2">
        {stepLabels.map((label, index) => (
          <span
            key={index}
            className={`text-xs font-medium transition-colors ${
              index === currentStep - 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      {/* progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 relative">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      {/* percentage */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% complete</span>
      </div>
    </div>
  );
}
