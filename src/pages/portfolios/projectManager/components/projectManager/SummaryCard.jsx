import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaPen,
  FaSave,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthContext } from "../../../../../context/AuthContext";
import axios from "axios";
import {
  startTracking,
  stopTracking,
  logPortfolioAction,
} from "../../../../../utils/portfolioEditLogger";

// attach token to each axios request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// helper: ensure links are real URLs
const normalizeUrl = (url) => {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const SummaryCard = ({ portfolio }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(portfolio || {});
  const [savedData, setSavedData] = useState(portfolio || {}); // last saved snapshot
  const [imagePreview, setImagePreview] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BACKEND_API;

  // keep local state in sync with latest portfolio from server
  useEffect(() => {
    const baseData = portfolio || {};
    setEditData(baseData);
    setSavedData(baseData);
  }, [portfolio]);

  // tracking when editing
  useEffect(() => {
    if (isEditing && portfolio) {
      const sessionId =
        localStorage.getItem("onboardingSessionId") ||
        `session_${Date.now()}`;
      startTracking({
        sessionId,
        userId: user?.id || user?._id || "anonymous",
        portfolioID: portfolio._id || portfolio.id || null,
        portfolioType: "projectManager",
        name: portfolio.name,
        email: portfolio.email || user?.email,
      });
    }

    return () => {
      if (isEditing) {
        stopTracking();
      }
    };
  }, [isEditing, portfolio, user]);

  // mutation for saving summary + profile info
  const saveSummaryMutation = useMutation({
    mutationFn: async (updatedFields) => {
      const response = await axios.patch(`${apiUrl}/portfolio/edit`, {
        portfolio: updatedFields,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      console.log("Save successful:", data);
      toast.success("Summary saved successfully!");

      // update local state & exit edit mode
      setEditData(data);
      setSavedData(data);
      setIsEditing(false);

      // log portfolio update action
      const sessionId =
        localStorage.getItem("onboardingSessionId") ||
        `session_${Date.now()}`;

      await logPortfolioAction("updated", {
        sessionId,
        userId: user?.id || user?._id || "anonymous",
        portfolioID: portfolio?._id || portfolio?.id || null,
        portfolioType: "projectManager",
        name: portfolio?.name || user?.name,
        email: portfolio?.email || user?.email,
      });

      // invalidate the specific portfolio query so the page refetches
      const portfolioId =
        data?._id || data?.id || portfolio?._id || portfolio?.id;
      if (portfolioId) {
        queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      }
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error("Failed to save Summary");
    },
  });

  // base object for reading values
  const base =
    (editData && Object.keys(editData).length ? editData : portfolio) || {};

  const { name, bio, summary, email, phone, location } = base;

  // read social links from BOTH nested + top-level
  const socialLinks = {
    github: base.socialLinks?.github || base.github || "",
    linkedin: base.socialLinks?.linkedin || base.linkedin || "",
    website: base.socialLinks?.website || base.website || "",
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (platform, value) => {
    setEditData({
      ...editData,
      socialLinks: {
        ...(editData.socialLinks || {}),
        [platform]: value,
      },
      // keep possible top-level fields in sync too
      [platform]: value,
    });
  };

  // normalize & send both nested + top-level fields
  const handleSave = () => {
    const social = editData.socialLinks || {};
    const githubUrl = normalizeUrl(social.github || editData.github);
    const linkedinUrl = normalizeUrl(social.linkedin || editData.linkedin);
    const websiteUrl = normalizeUrl(social.website || editData.website);

    const updatedFields = {
      name: editData.name,
      bio: editData.bio,
      summary: editData.summary,
      email: editData.email,
      phone: editData.phone,
      location: editData.location,
      socialLinks: {
        github: githubUrl,
        linkedin: linkedinUrl,
        website: websiteUrl,
      },
      // also send top-level, in case backend uses that shape
      github: githubUrl,
      linkedin: linkedinUrl,
      website: websiteUrl,
      // keep this so avatar changes persist once backend supports it
      profileImage: imagePreview,
    };

    // include portfolio id so backend updates THIS portfolio
    const portfolioId =
      editData._id || editData.id || portfolio?._id || portfolio?.id;
    if (portfolioId) {
      updatedFields._id = portfolioId;
    }

    saveSummaryMutation.mutate(updatedFields);
  };

  const handleCancel = () => {
    const baseData = savedData || portfolio || {};
    setEditData(baseData);
    setImagePreview(baseData?.profileImage || null);
    setIsEditing(false);
  };

  return (
    portfolio.email === user?.email && (
      <div className="bg-slate-800 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30">
        <div className="relative">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-blue-500/20 transition-colors"
              aria-label="Edit"
            >
              <FaPen className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-6 mb-6 pr-12">
            <div
              className="relative w-24 h-24 group cursor-pointer"
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              {/* Profile Image or Fallback */}
              <div className="w-full h-full rounded-full overflow-hidden border border-blue-400/30 shadow-lg">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-200 font-bold text-4xl">
                    {name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Upload Overlay - Only visible when editing */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <FaCamera className="text-white text-xl" />
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                      setEditData((prev) => ({
                        ...prev,
                        profileImage: reader.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    name="name"
                    value={name || ""}
                    onChange={handleChange}
                    className="text-3xl font-bold bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-3 py-2 w-full"
                    placeholder="Full Name"
                  />
                  <input
                    name="location"
                    value={location || ""}
                    onChange={handleChange}
                    className="bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-3 py-2 w-full"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm mb-2">
                    {name || "Your Name"}
                  </h2>
                  <p className="text-slate-300 drop-shadow-sm">
                    📍 {location || "Location"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* About */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              About
            </h3>
            {isEditing ? (
              <textarea
                name="bio"
                value={bio || ""}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3 resize-none"
                placeholder="Professional bio and description..."
                rows={4}
              />
            ) : (
              <p className="text-slate-200 leading-relaxed drop-shadow-sm">
                {bio || "Professional bio and description"}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="mb-6 pt-6 border-t border-blue-400/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Summary
            </h3>
            {isEditing ? (
              <textarea
                name="summary"
                value={summary || ""}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3 resize-none"
                placeholder="Summary of your professional experience and goals..."
                rows={4}
              />
            ) : (
              <p className="text-slate-200 leading-relaxed drop-shadow-sm whitespace-pre-line">
                {summary ||
                  "Summary of your professional experience and goals"}
              </p>
            )}
          </div>

          {/* Contact – email not editable in edit mode */}
          <div className="mb-6 pt-6 border-t border-blue-400/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Contact
            </h3>
            <div className="space-y-3">
              {isEditing ? (
                <>
                  {/*<p className="text-slate-200 drop-shadow-sm">
                    <span className="text-white font-medium">Email:</span>{" "}
                    {email || "Not provided"}
                  </p>*/}
                  <input
                    name="phone"
                    value={phone || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                    placeholder="Phone number"
                  />
                        <div className="mt-4">
      <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Resume (PDF)
            </h3>

      {/* Styled “input” with hidden file element */}
      <label className="w-full flex items-center justify-between bg-slate-700 border border-white/20 rounded-lg px-4 py-3 text-sm text-slate-200 cursor-pointer hover:border-blue-400/70 hover:bg-slate-700/80">
        <span className="truncate">
          {resumeFileName || "No file chosen"}
        </span>
        <span className="text-xs font-medium text-blue-300">
          Choose file
        </span>

        <input
          type="file"
          accept=".pdf"
          onChange={handleResumeUpload}
          className="hidden"
        />
      </label>

      {resumeUploading && (
        <p className="text-xs text-slate-400 mt-1">
          Uploading resume...
        </p>
      )}

      {editData?.resumeUrl && !resumeUploading && (
        <button
          type="button"
          className="text-xs text-blue-300 hover:underline mt-2"
          onClick={() =>
            window.open(
              editData.resumeUrl,
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          View current resume
        </button>
      )}
    </div>

                </>
              ) : (
                <>
                  {/*<p className="text-slate-200 drop-shadow-sm">
                    <span className="text-white font-medium">Email:</span>{" "}
                    {email || "Not provided"}
                  </p></div>*/}
                  <p className="text-slate-200 drop-shadow-sm">
                    <span className="text-white font-medium">Phone:</span>{" "}
                    {phone || "Not provided"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-6 pt-6 border-t border-blue-400/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Social Links
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={socialLinks.github || ""}
                  onChange={(e) => handleSocialChange("github", e.target.value)}
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="GitHub URL"
                />
                <input
                  value={socialLinks.linkedin || ""}
                  onChange={(e) =>
                    handleSocialChange("linkedin", e.target.value)
                  }
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="LinkedIn URL"
                />
                <input
                  value={socialLinks.website || ""}
                  onChange={(e) =>
                    handleSocialChange("website", e.target.value)
                  }
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="Website URL"
                />
              </div>
            ) : (
              <div className="flex gap-4">
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-2xl"
                    aria-label="GitHub"
                  >
                    <FaGithub />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-2xl"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin />
                  </a>
                )}
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-2xl"
                    aria-label="Website"
                  >
                    <FaGlobe />
                  </a>
                )}
                {!socialLinks.github &&
                  !socialLinks.linkedin &&
                  !socialLinks.website && (
                    <p className="text-slate-400">
                      No social links added yet
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-white/20">
              <button
                onClick={handleSave}
                disabled={saveSummaryMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50"
              >
                <FaSave className="w-4 h-4" />
                {saveSummaryMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text:white rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default SummaryCard;
