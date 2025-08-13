import React, { useState, useEffect, useRef } from "react";
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

const SummaryCard = ({ portfolio }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(portfolio || {});
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BAKEND_API;

  // Update local state when portfolio prop changes
  useEffect(() => {
    setEditData(portfolio || {});
  }, [portfolio]);

  // Mutation for saving summary data
  const saveSummaryMutation = useMutation({
    mutationFn: async (summaryData) => {
      console.log("Saving summary data:", summaryData); // DEBUG
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/portfolio/edit?email=${summaryData.email}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            portfolio: summaryData,
          }),
        }
      );

      const result = await response.json();
      console.log("Server response:", result); // DEBUG

      if (!response.ok) throw new Error("Failed to save summary");
      return result;
    },
    onSuccess: (data) => {
      console.log("Save successful:", data); // DEBUG
      toast.success("Profile saved successfully!");
      queryClient.invalidateQueries(["portfolio"]);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Save failed:", error); // DEBUG
      toast.error("Failed to save profile");
    },
  });

  const { name, summary, email, phone, location, socialLinks } = isEditing
    ? editData
    : portfolio || {};

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (platform, value) => {
    setEditData({
      ...editData,
      socialLinks: {
        ...editData.socialLinks,
        [platform]: value,
      },
    });
  };

  const handleSave = () => {
    // Include the image in the saved data
    saveSummaryMutation.mutate({
      ...editData,
      profileImage: imagePreview, // This will be handled by your backend later
    });
  };

  const handleCancel = () => {
    setEditData(portfolio || {});
    setImagePreview(portfolio?.profileImage || null);
    setIsEditing(false);
  };

  return (
    portfolio.email === localStorage.getItem("email") && (
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

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              About
            </h3>
            {isEditing ? (
              <textarea
                name="summary"
                value={summary || ""}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3 resize-none"
                placeholder="Write a brief summary about yourself..."
                rows={4}
              />
            ) : (
              <p className="text-slate-200 leading-relaxed drop-shadow-sm">
                {summary || "No summary provided yet."}
              </p>
            )}
          </div>

          <div className="mb-6 pt-6 border-t border-blue-400/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Contact
            </h3>
            <div className="space-y-3">
              {isEditing ? (
                <>
                  <input
                    name="email"
                    value={email || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                    placeholder="Email address"
                    type="email"
                  />
                  <input
                    name="phone"
                    value={phone || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                    placeholder="Phone number"
                  />
                </>
              ) : (
                <>
                  <p className="text-slate-200 drop-shadow-sm">
                    <span className="text-white font-medium">Email:</span>{" "}
                    {email || "Not provided"}
                  </p>
                  <p className="text-slate-200 drop-shadow-sm">
                    <span className="text-white font-medium">Phone:</span>{" "}
                    {phone || "Not provided"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mb-6 pt-6 border-t border-blue-400/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 drop-shadow-sm">
              Social Links
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={socialLinks?.github || ""}
                  onChange={(e) => handleSocialChange("github", e.target.value)}
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="GitHub URL"
                />
                <input
                  value={socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    handleSocialChange("linkedin", e.target.value)
                  }
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="LinkedIn URL"
                />
                <input
                  value={socialLinks?.website || ""}
                  onChange={(e) =>
                    handleSocialChange("website", e.target.value)
                  }
                  className="w-full bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 px-4 py-3"
                  placeholder="Website URL"
                />
              </div>
            ) : (
              <div className="flex gap-4">
                {socialLinks?.github && (
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
                {socialLinks?.linkedin && (
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
                {socialLinks?.website && (
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
                {!socialLinks?.github &&
                  !socialLinks?.linkedin &&
                  !socialLinks?.website && (
                    <p className="text-slate-400">No social links added yet</p>
                  )}
              </div>
            )}
          </div>

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
                className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
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
