import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import GoalSelection from "./GoalSelection";
import IndustrySelection from "./IndustrySelection";
import ExperienceSelection from "./ExperienceSelection";
import SkillsSelection from "./SkillsSelection";
import UserInfoForm from "./UserInfoForm";

// main onboarding flow component
// NOT CONNECTED TO BACKEND YET
export default function OnboardingFlow() {
  // track which step the user is on
  const [currentStep, setCurrentStep] = useState("goal");

  // store all user input data for onboarding
  const [data, setData] = useState({
    goal: null,
    industry: null,
    experience: null,
    skills: [],
    userInfo: null,
  });

  // handle selection of main goal
  const handleGoalSelect = (goal) => {
    setData((prev) => ({ ...prev, goal }));
    // if user is a business, skip to complete
    if (goal === "grow-business") {
      setCurrentStep("complete");
    } else {
      setCurrentStep("industry");
    }
  };

  // handle selection of industry
  const handleIndustrySelect = (industry) => {
    setData((prev) => ({ ...prev, industry }));
    // if tech, show experience step, else go to skills
    if (industry === "tech") {
      setCurrentStep("experience");
    } else {
      setCurrentStep("skills");
    }
  };

  // selection of experience level
  const handleExperienceSelect = (experience) => {
    setData((prev) => ({ ...prev, experience }));
    setCurrentStep("skills");
  };

  // completion of skills selection
  const handleSkillsComplete = (skills) => {
    setData((prev) => ({ ...prev, skills }));
    setCurrentStep("userInfo");
  };

  // completion of user info form
  const handleUserInfoComplete = (userInfo) => {
    setData((prev) => ({ ...prev, userInfo }));
    setCurrentStep("complete");
  };

  // go back to previous step depending on current step
  const goBack = () => {
    switch (currentStep) {
      case "industry":
        setCurrentStep("goal");
        break;
      case "experience":
        setCurrentStep("industry");
        break;
      case "skills":
        if (data.industry === "tech") {
          setCurrentStep("experience");
        } else {
          setCurrentStep("industry");
        }
        break;
      case "userInfo":
        setCurrentStep("skills");
        break;
      default:
        break;
    }
  };

  // get the labels for each step to show in progress bar
  const getStepLabels = () => {
    const baseSteps = ["Goal"];
    if (data.goal === "grow-business") {
      return baseSteps;
    }
    baseSteps.push("Industry");
    if (data.industry === "tech") {
      baseSteps.push("Experience");
    }
    baseSteps.push("Skills", "Profile");
    return baseSteps;
  };

  // get the current step number for progress bar
  const getCurrentStepNumber = () => {
    const steps = ["goal", "industry", "experience", "skills", "userInfo"];
    let stepIndex = steps.indexOf(currentStep) + 1;
    // adjust for skipped steps
    if (data.goal === "grow-business") return 1;
    if (data.industry !== "tech" && currentStep === "skills") stepIndex -= 1;
    if (data.industry !== "tech" && currentStep === "userInfo") stepIndex -= 1;
    return stepIndex;
  };

  // show completion screen if onboarding is done
  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-gray-900">Welcome to FindVirtual.me!</h1>
          <p className="text-gray-600 mb-8">
            {data.goal === "grow-business"
              ? "Redirecting you to the business dashboard..."
              : "Your profile is all set up! You can now start building your presence and connecting with opportunities."}
          </p>
          {/* show profile summary if not a business user */}
          {data.goal !== "grow-business" && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-left">
              <h3 className="mb-4 text-gray-900">Your Profile Summary:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Goal:</strong> {data.goal}
                </p>
                <p>
                  <strong>Industry:</strong> {data.industry}
                </p>
                {data.experience && (
                  <p>
                    <strong>Experience:</strong> {data.experience}
                  </p>
                )}
                {data.skills.length > 0 && (
                  <p>
                    <strong>Skills:</strong> {data.skills.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // render onboarding steps and progress bar
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* show progress bar at the top */}
        <ProgressBar
          currentStep={getCurrentStepNumber()}
          totalSteps={getStepLabels().length}
          stepLabels={getStepLabels()}
        />
        <div className="mt-12">
          {/* show goal selection step */}
          {currentStep === "goal" && <GoalSelection onSelect={handleGoalSelect} />}
          {/* show industry selection step */}
          {currentStep === "industry" && (
            <IndustrySelection onSelect={handleIndustrySelect} onBack={goBack} />
          )}
          {/* show experience selection step */}
          {currentStep === "experience" && (
            <ExperienceSelection onSelect={handleExperienceSelect} onBack={goBack} />
          )}
          {/* show skills selection step */}
          {currentStep === "skills" && (
            <SkillsSelection
              onComplete={handleSkillsComplete}
              onBack={goBack}
              industry={data.industry || undefined}
            />
          )}
          {/* show user info form step */}
          {currentStep === "userInfo" && (
            <UserInfoForm onComplete={handleUserInfoComplete} onBack={goBack} />
          )}
        </div>
      </div>
    </div>
  );
}