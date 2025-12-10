import React, { useContext, useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import GoalSelection from "./GoalSelection";
import IndustrySelection from "./IndustrySelection";
import ExperienceSelection from "./ExperienceSelection";
import SkillsSelection from "./SkillsSelection";
import UserInfoForm from "./UserInfoForm";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import loadingGif from "../../../assets/images/loading-gif.gif";
import { AuthContext } from "../../../context/AuthContext";

// main onboarding flow component
const backendUrl = import.meta.env.VITE_BACKEND_API;
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  // track which step the user is on
  const [currentStep, setCurrentStep] = useState("goal");
  const { login, setPendingFile } = useContext(AuthContext);

  // store all user input data for onboarding
  const [data, setData] = useState({
    goal: null,
    industry: null,
    experience: null,
    skills: [],
    userInfo: null,
    file: null,
  });

  /* 
  ** Version that was skipping to user info from file upload:
  **
  // handle selection of main goal
  const handleGoalSelect = (goal) => {
    setData((prev) => ({ ...prev, goal }));
    // if user is a business, skip to complete
   /
    if (data.file) {
      // If file uploaded, skip directly to user info
      setCurrentStep("userInfo");
    } else {
      // Normal path
      if (goal === "grow-business") {
        setCurrentStep("userInfo");
      } else {
        setCurrentStep("industry");
      }
    }
      
  };

   const handleFileUpload = (file) => {
    setData((prev) => ({ ...prev, file }));
    // set in auth context so it's available after login/navigation
    if (typeof setPendingFile === "function") setPendingFile(file);
    setCurrentStep("userInfo"); // skip straight ahead
  };
  */
  const handleGoalSelect = (goal) => {
    setData((prev) => ({ ...prev, goal }));
    // if user is a business, skip to complete
    if (goal === "grow-business") {
      setCurrentStep("userInfo");
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
        if (data.goal === "grow-business") {
          setCurrentStep("goal");
        } else {
          setCurrentStep("skills");
        }
        break;
      default:
        break;
    }
  };

  // get the labels for each step to show in progress bar
  const getStepLabels = () => {
    const baseSteps = ["Goal"];
    if (data.file) {
      return ["Goal", "Profile"];
    }
    if (data.goal === "grow-business") {
      return ["Goal", "Profile"]; // changing the flow for business users, no need to select industry or skills
    }
    baseSteps.push("Industry");
    if (data.industry === "tech") {
      baseSteps.push("Experience");
    }
    baseSteps.push("Skills", "Profile");
    return baseSteps;
  };

  // get the current step number for progress bar
  // const getCurrentStepNumber = () => {
  //   const steps = ["goal", "industry", "experience", "skills", "userInfo"];
  //   let stepIndex = steps.indexOf(currentStep) + 1;
  //   // adjust for skipped steps
  //   if (data.goal === "grow-business" && currentStep === "userInfo") return 2;
  //   if (data.industry !== "tech" && currentStep === "skills") stepIndex -= 1;
  //   if (data.industry !== "tech" && currentStep === "userInfo") stepIndex -= 1;
  //   return stepIndex;
  // };

  // get the current step number for progress bar
  const getCurrentStepNumber = () => {
    const stepOrder = getStepLabels(); // always stay aligned
    const stepsMap = {
      goal: "Goal",
      industry: "Industry",
      experience: "Experience",
      skills: "Skills",
      userInfo: "Profile",
    };

    const currentLabel = stepsMap[currentStep];
    return stepOrder.indexOf(currentLabel) + 1; // +1 because index starts at 0
  };

  //send data to backend when they finish onboarding
  useEffect(() => {
    if (currentStep === "complete") {
      setError("");
      setCountdown(5);
      //send data to backend
      const sendData = async () => {
        let userId;
        try {
          const res = await axios.post(`${backendUrl}/user/addUser`, {
            data,
          });
          login(res.data.user.email, data.userInfo.password);
          //userId = res.data.user._id;---------------
          // wait before redirect
          const timer = setTimeout(() => {
            //navigate(`/onboarding_info/${userId}`);------------
            navigate("/onboarding_info");
          }, 4000);
          return () => clearTimeout(timer);
        } catch (error) {
          setError(error.response.data.message);
          toast.error("Error setting up profile!");
          console.error(error);
          console.log("error message: ", error.response.data.message);
        }
      };

      sendData();
    }
  }, [currentStep]);

  useEffect(() => {
    if (!error) return; // only run if there's an error
    if (countdown === 0) {
      setCurrentStep("userInfo");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, error]);

  // show completion screen if onboarding is done
  if (currentStep === "complete") {
    return (
      <div>
        {error ? (
          <div className="text-1xl text-red-500">
            Error setting up profile: {error} <br />
            Redirecting in {countdown} seconds...
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="mb-4 text-gray-900">Welcome to FindVirtual.me!</h1>
              <p className="text-gray-600 mb-8">
                {/* {data.goal === "grow-business"
                  ? "Redirecting you to the business dashboard..."
                  : "Your profile is all set up! You can now start building your presence and connecting with opportunities."} */}
                Your profile is all set up! You can now start building your presence and connecting with opportunities.
              </p>
              {/* show profile summary if not a business user */}

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
            </div>
          </div>
        )}
      </div>
    );
  }

  // render onboarding steps and progress bar
  return (
    <div className="min-h-screen bg-gray-50 p-6" data-cy="onboarding-container">
      <div className="max-w-6xl mx-auto">
        {/* show progress bar at the top */}
        <ProgressBar
          currentStep={getCurrentStepNumber()}
          totalSteps={getStepLabels().length}
          stepLabels={getStepLabels()}
        />
        <div className="mt-12">
          {/* show goal selection step */}
          {currentStep === "goal" && (
            <div data-cy="step-goal">
              <GoalSelection onSelect={handleGoalSelect} />
            </div>
          )}
          {/* show industry selection step */}
          {currentStep === "industry" && (
            <div data-cy="step-industry">
              {" "}
              <IndustrySelection onSelect={handleIndustrySelect} onBack={goBack} />
            </div>
          )}
          {/* show experience selection step */}
          {currentStep === "experience" && (
            <div data-cy="step-experience">
              {" "}
              <ExperienceSelection onSelect={handleExperienceSelect} onBack={goBack} />{" "}
            </div>
          )}
          {/* show skills selection step */}
          {currentStep === "skills" && (
            <div data-cy="step-skills">
              <SkillsSelection
                onComplete={handleSkillsComplete}
                onBack={goBack}
                industry={data.industry || undefined}
              />
            </div>
          )}
          {/* show user info form step */}
          {currentStep === "userInfo" && (
            <div data-cy="step-userInfo">
              {" "}
              <UserInfoForm onComplete={handleUserInfoComplete} onBack={goBack} />{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
