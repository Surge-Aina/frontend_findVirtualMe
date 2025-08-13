import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
  const apiUrl = import.meta.env.VITE_BAKEND_API;
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

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

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(`${apiUrl}/portfolio/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Uploaded:", res.data);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="pt-40">
      <div className="center p-5">
        <label className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 w-50 cursor-pointer">
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
                className="center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 w-50 cursor-pointer"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
