import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { startTracking, stopTracking, logPortfolioAction } from "@/shared/utils/portfolioEditLogger";
import PortfolioTemplateOptions from "@/features/onboarding/components/PortfolioTemplateOptions";

export default function ResumeUpload() {
  const apiUrl = import.meta.env.VITE_BACKEND_API;
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const navigate = useNavigate();

  // session ID
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("onboardingSessionId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("onboardingSessionId", id);
    }
    return id;
  });

  // Start tracking on component mount
  useEffect(() => {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const userId = localStorage.getItem("userId");

    startTracking({
      sessionId: sessionId,
      userId: userId || "anonymous",
      portfolioType: "projectManager",
      name: name,
      email: email,
    });

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [sessionId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploaded(false);

    if (!selectedFile) {
      setFileContent(null);
      return;
    }

    if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => setFileContent(reader.result);
      reader.readAsText(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      const pdfUrl = URL.createObjectURL(selectedFile);
      setFileContent(pdfUrl);
    } else {
      setFileContent(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    const email = localStorage.getItem("email");
    if (email) {
      formData.append("email", email);
    }
    formData.append("sessionId", sessionId);

    try {
      const res = await axios.post(`${apiUrl}/portfolio/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Uploaded:", res.data);

      // Log portfolio creation action
      const portfolioId = res.data?._id || res.data?.id || null;
      await logPortfolioAction("created", {
        sessionId: sessionId,
        userId: localStorage.getItem("userId") || "anonymous",
        portfolioID: portfolioId,
        portfolioType: "projectManager",
        name: localStorage.getItem("name"),
        email: email,
      });

      setUploaded(true);
      setFile(null);
      setFileContent(null);
      stopTracking(); // Stop tracking before removing session
      localStorage.removeItem("onboardingSessionId"); // remove sessionId after successful upload
      navigate("/dashboard"); // Redirect after upload
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

  /*/ attach resume to user after signup
  const claimResumeToken = async (userEmail) => {
    const resumeToken = localStorage.getItem("resumeToken");
    if (resumeToken) {
      await axios.post("/api/portfolio/claim", { email: userEmail, resumeToken });
      localStorage.removeItem("resumeToken");
    }
  };
  localStorage.removeItem("onboardingSessionId");
*/
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-6xl p-5">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Get Started with Your Portfolio</h2>
        <p className="text-slate-500 mb-8 text-center max-w-2xl mx-auto">
          Choose how you'd like to begin: upload your existing resume to enhance your portfolio, or start building
          a new portfolio from a prompt with our AI portfolio creator.
        </p>

        {/* Side by side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Resume Upload Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 border border-slate-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Your Resume</h3>
              <p className="text-slate-500 text-sm">
                Upload your PDF resume to enhance your portfolio and showcase your experience.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                PDF Analysis & Parsing
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Portfolio Enhancement
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Quick Setup Process
              </div>
            </div>

            <label className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer block text-center mb-4">
              <span className="flex items-center justify-center">
                Choose PDF File
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </span>
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>

            {file && (
              <div className="mt-4 space-y-4">
                <div className="bg-white bg-opacity-50 rounded-lg p-4 text-sm text-slate-600">
                  <p>
                    <strong>File:</strong> {file.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                {file.type === "application/pdf" && fileContent && (
                  <iframe
                    src={fileContent}
                    title="PDF Preview"
                    width="100%"
                    height="200px"
                    className="border rounded-lg bg-white"
                  />
                )}

                <button
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-200"></span>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Upload Resume
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </span>
                  )}
                </button>

                {uploaded && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold bg-white bg-opacity-50 rounded-lg p-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Resume uploaded successfully!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Portfolio Creator Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 border border-slate-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Portfolio Creator</h3>
              <p className="text-slate-500 text-sm">
                Turn a prompt into a polished block-based portfolio that you can edit right away.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Prompt-to-portfolio generation
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Built from reusable portfolio blocks
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Unified edit and publish flow
              </div>
            </div>

            <button
              onClick={() => navigate("/portfolios/create/ai", { state: { source: "onboarding" } })}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span className="flex items-center justify-center">
                Open AI Creator
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
        {/* Portfolio templates */}
        <div>
          <PortfolioTemplateOptions />
        </div>
      </div>
    </div>
  );
}
