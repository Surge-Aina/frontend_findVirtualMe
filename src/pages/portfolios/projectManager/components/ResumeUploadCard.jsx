import React from "react";
import { FaUpload } from "react-icons/fa";

const ResumeUploadCard = () => {
  return (
    <div className="bg-slate-800/70 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:border-white/30">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 drop-shadow-sm">
        Compare Resumes
      </h2>
      <p className="text-slate-300 text-sm sm:text-base mb-6">
        Upload a resume to compare qualifications with the current candidate's profile.
      </p>
      <div className="file-upload-area">
        <label
          htmlFor="resume-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <FaUpload className="w-8 h-8 text-blue-400 mb-3" />
          <span className="text-slate-300 text-sm sm:text-base">
            Drag and drop a file here, or click to upload
          </span>
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
        </label>
      </div>
      <p className="text-slate-400 text-xs mt-3">
        Supported formats: PDF, DOC, DOCX. Max size: 5MB.
      </p>
    </div>
  );
};

export default ResumeUploadCard;