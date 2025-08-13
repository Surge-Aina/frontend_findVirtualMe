import { useState, useEffect } from "react";
import { FaPen, FaPlus, FaTimes, FaTrash, FaSave } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const EducationCard = ({ portfolio }) => {
  const education = portfolio.education;
  const [editIdx, setEditIdx] = useState(null);
  const [editEdu, setEditEdu] = useState({});
  const [eduList, setEduList] = useState(education);
  const [adding, setAdding] = useState(false);
  const [newEdu, setNewEdu] = useState({
    school: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
    degrees: "",
    awards: "",
  });

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BAKEND_API;

  // Update local state when education prop changes
  useEffect(() => {
    setEduList(education);
  }, [education]);

  // Mutation for saving education data
  const saveEducationMutation = useMutation({
    mutationFn: async (educationData) => {
      console.log("Saving education data:", educationData);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/portfolio/edit?email=testEmail@example.com`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            portfolio: {
              education: educationData,
            },
          }),
        }
      );

      const result = await response.json();
      console.log("Server response:", result);

      if (!response.ok) throw new Error("Failed to save education");
      return result;
    },
    onSuccess: (data) => {
      console.log("Save successful:", data);
      toast.success("Education saved successfully!");
      queryClient.invalidateQueries(["portfolio"]);
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error("Failed to save education");
    },
  });

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditEdu({
      ...eduList[idx],
      degrees: eduList[idx].degrees?.join(", ") || "",
      awards: eduList[idx].awards?.join(", ") || "",
    });
  };

  const handleChange = (e) => {
    setEditEdu({ ...editEdu, [e.target.name]: e.target.value });
  };

  const handleSave = (idx) => {
    const updated = [...eduList];
    updated[idx] = {
      ...editEdu,
      degrees: editEdu.degrees
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d),
      awards: editEdu.awards
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
    };
    setEduList(updated);
    saveEducationMutation.mutate(updated);
    setEditIdx(null);
    setEditEdu({});
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditEdu({});
  };

  const handleNewChange = (e) => {
    setNewEdu({ ...newEdu, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const newEducation = {
      ...newEdu,
      degrees: newEdu.degrees
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d),
      awards: newEdu.awards
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
    };
    const updated = [...eduList, newEducation];
    setEduList(updated);
    saveEducationMutation.mutate(updated);
    setNewEdu({
      school: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
      degrees: "",
      awards: "",
    });
    setAdding(false);
  };

  const handleDelete = (idx) => {
    const updated = eduList.filter((_, i) => i !== idx);
    setEduList(updated);
    saveEducationMutation.mutate(updated);
    setEditIdx(null);
    setEditEdu({});
  };

  return (
    <div className="mt-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
          Education
        </h2>
        {portfolio.email === localStorage.getItem("email") && (
          <button
            onClick={() => setAdding(true)}
            className="self-start sm:self-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg border border-blue-500 text-sm sm:text-base"
            disabled={saveEducationMutation.isPending}
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Add Education</span>
            <span className="xs:hidden">Add</span>
          </button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {eduList.map((edu, idx) => (
          <div
            key={idx}
            className="relative bg-slate-800/70 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30"
          >
            {editIdx === idx ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-1 sm:gap-2 mb-4">
                  <button
                    onClick={handleCancel}
                    className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
                    aria-label="Cancel"
                  >
                    <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleSave(idx)}
                    className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 rounded-full hover:bg-green-500/20 transition-colors"
                    aria-label="Save"
                    disabled={saveEducationMutation.isPending}
                  >
                    <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-colors"
                    aria-label="Delete"
                  >
                    <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <input
                    name="school"
                    value={editEdu.school || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="School Name"
                  />
                  <input
                    name="fieldOfStudy"
                    value={editEdu.fieldOfStudy || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Field of Study"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                      Start Date
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={editEdu.startDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                      End Date
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      value={editEdu.endDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <textarea
                  name="description"
                  value={editEdu.description || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none text-sm sm:text-base"
                  placeholder="Description"
                  rows={3}
                />

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <input
                    name="degrees"
                    value={editEdu.degrees || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Degrees (comma separated)"
                  />
                  <input
                    name="awards"
                    value={editEdu.awards || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Awards (comma separated)"
                  />
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(idx)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-blue-500/20 transition-colors"
                  aria-label="Edit"
                >
                  <FaPen className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                <div className="pr-8 sm:pr-12">
                  <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-sm leading-tight">
                        {edu.school}
                      </h3>
                      <p className="text-blue-300 font-medium text-base sm:text-lg drop-shadow-sm">
                        {edu.fieldOfStudy}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-slate-700/50 rounded-full border border-white/20">
                        <span className="text-xs sm:text-sm text-slate-300 font-mono">
                          {new Date(edu.startDate).toLocaleDateString()} –{" "}
                          {new Date(edu.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {edu.description && (
                    <p className="text-slate-200 mb-3 sm:mb-4 leading-relaxed drop-shadow-sm text-sm sm:text-base">
                      {edu.description}
                    </p>
                  )}

                  <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
                    {edu.degrees?.length > 0 && (
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-blue-300 mb-1 sm:mb-2">
                          Degrees
                        </h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {edu.degrees.map((degree, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs sm:text-sm border border-blue-400/30"
                            >
                              {degree}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {edu.awards?.length > 0 && (
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-amber-300 mb-1 sm:mb-2">
                          Awards
                        </h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {edu.awards.map((award, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 sm:px-3 sm:py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs sm:text-sm border border-amber-400/30"
                            >
                              {award}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="relative bg-slate-800/70 backdrop-blur-lg border border-blue-400/50 rounded-xl shadow-lg p-4 sm:p-6">
            <button
              onClick={() => setAdding(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label="Cancel"
            >
              <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 drop-shadow-sm pr-8">
              Add New Education
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <input
                  name="school"
                  value={newEdu.school}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="School Name"
                />
                <input
                  name="fieldOfStudy"
                  value={newEdu.fieldOfStudy}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Field of Study"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={newEdu.startDate}
                    onChange={handleNewChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    End Date
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={newEdu.endDate}
                    onChange={handleNewChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  />
                </div>
              </div>

              <textarea
                name="description"
                value={newEdu.description}
                onChange={handleNewChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none text-sm sm:text-base"
                placeholder="Description"
                rows={3}
              />

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <input
                  name="degrees"
                  value={newEdu.degrees}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Degrees (comma separated)"
                />
                <input
                  name="awards"
                  value={newEdu.awards}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Awards (comma separated)"
                />
              </div>

              <button
                onClick={handleAdd}
                className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 text-sm sm:text-base"
                disabled={saveEducationMutation.isPending}
              >
                {saveEducationMutation.isPending
                  ? "Saving..."
                  : "Add Education"}
              </button>
            </div>
          </div>
        )}
      </div>

      {eduList.length === 0 && !adding && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-slate-400 text-base sm:text-lg mb-4">
            No education entries yet
          </div>
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 text-sm sm:text-base"
          >
            Add Your First Education
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationCard;
