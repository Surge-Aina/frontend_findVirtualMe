import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

export default function ResumeUpload() {
  const apiUrl = import.meta.env.VITE_BACKEND_API;
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const navigate = useNavigate(); 

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

    try {
      const res = await axios.post(`${apiUrl}/portfolio/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Uploaded:", res.data);
      setUploaded(true);
      setFile(null);
      setFileContent(null);
      navigate("/dashboard"); // Redirect after upload
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-xl p-5">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          Upload Your Resume
        </h2>
        <p className="text-slate-500 mb-6 text-center max-w-lg mx-auto">
          Easily upload your PDF resume to enhance your portfolio and showcase
          your experience. Your resume will be securely stored and used to help
          personalize your profile.
        </p>
        <label className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 w-50 cursor-pointer block mx-auto mb-6">
          Choose PDF File
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {file && (
          <div>
            <div className="text-body-muted pt-5">
              <p>
                <strong>File Name:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
              </p>
              <p>
                <strong>Type:</strong> {file.type}
              </p>

              {file.type === "text/plain" && fileContent && (
                <pre className="mt-3 mb-3 whitespace-pre-wrap bg-slate-800 p-3 rounded max-h-96 overflow-auto text-white">
                  {fileContent}
                </pre>
              )}

              {file.type === "application/pdf" && fileContent && (
                <iframe
                  src={fileContent}
                  title="PDF Preview"
                  width="100%"
                  height="500px"
                  className="mt-4 border rounded"
                />
              )}
            </div>

            <div>
              <button
                className="center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 w-50 cursor-pointer flex items-center justify-center mt-4"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-400 border-r-2 border-slate-700"></span>
                    <span className="text-blue-400 font-semibold animate-pulse">
                      Uploading...
                    </span>
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        )}

        {uploaded && (
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-semibold">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Resume uploaded successfully!
          </div>
        )}
      </div>
    </div>
  );
}
