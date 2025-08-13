import { useState, useEffect } from "react";
import { FaPen, FaPlus, FaTimes, FaTrash, FaSave } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const ExperienceCard = ({ portfolio }) => {
  const experiences = portfolio.experiences;
  const [editIdx, setEditIdx] = useState(null);
  const [editExp, setEditExp] = useState({});
  const [expList, setExpList] = useState(experiences);
  const [adding, setAdding] = useState(false);
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BAKEND_API;

  useEffect(() => {
    setExpList(experiences);
  }, [experiences]);

  const saveExperienceMutation = useMutation({
    mutationFn: async (experienceData) => {
      console.log("Saving experience data:", experienceData);
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
              experiences: experienceData,
            },
          }),
        }
      );

      const result = await response.json();
      console.log("Server response:", result);

      if (!response.ok) throw new Error("Failed to save experience");
      return result;
    },
    onSuccess: (data) => {
      console.log("Save successful:", data);
      toast.success("Experience saved successfully!");
      queryClient.invalidateQueries(["portfolio"]);
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error("Failed to save experience");
    },
  });

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditExp(expList[idx]);
  };

  const handleChange = (e) => {
    setEditExp({ ...editExp, [e.target.name]: e.target.value });
  };

  const handleSave = (idx) => {
    const updated = [...expList];
    updated[idx] = editExp;
    setExpList(updated);
    saveExperienceMutation.mutate(updated);
    setEditIdx(null);
    setEditExp({});
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditExp({});
  };

  const handleNewChange = (e) => {
    setNewExp({ ...newExp, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const updated = [...expList, newExp];
    setExpList(updated);
    saveExperienceMutation.mutate(updated);
    setNewExp({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
    });
    setAdding(false);
  };

  const handleDelete = (idx) => {
    const updated = expList.filter((_, i) => i !== idx);
    setExpList(updated);
    saveExperienceMutation.mutate(updated);
    setEditIdx(null);
    setEditExp({});
  };

  return (
    <div className="mt-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
          Experience
        </h2>
        {portfolio.email === localStorage.getItem("email") && (
          <button
            onClick={() => setAdding(true)}
            className="self-start sm:self-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg border border-blue-500 text-sm sm:text-base"
            disabled={saveExperienceMutation.isPending}
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Add Experience</span>
            <span className="xs:hidden">Add</span>
          </button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {expList.map((exp, idx) => (
          <div
            key={idx}
            className="relative bg-slate-800 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30"
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
                    disabled={saveExperienceMutation.isPending}
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
                    name="title"
                    value={editExp.title || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Job Title"
                  />
                  <input
                    name="company"
                    value={editExp.company || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Company"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                      Start Date
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={editExp.startDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                      End Date
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      value={editExp.endDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    />
                  </div>
                  <input
                    name="location"
                    value={editExp.location || ""}
                    onChange={handleChange}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                    placeholder="Location"
                  />
                </div>

                <textarea
                  name="description"
                  value={editExp.description || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none text-sm sm:text-base"
                  placeholder="Job Description"
                  rows={4}
                />
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
                        {exp.title}
                      </h3>
                      <p className="text-blue-300 font-medium text-base sm:text-lg drop-shadow-sm">
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="text-slate-300 text-xs sm:text-sm mt-1 drop-shadow-sm">
                          📍 {exp.location}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-slate-700 rounded-full border border-white/20">
                        <span className="text-xs sm:text-sm text-slate-300 font-mono">
                          {new Date(exp.startDate).toLocaleDateString()} –{" "}
                          {exp.endDate
                            ? new Date(exp.endDate).toLocaleDateString()
                            : "Present"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {exp.description && (
                    <div className="mt-3 sm:mt-4">
                      <p className="text-slate-200 leading-relaxed drop-shadow-sm whitespace-pre-line text-sm sm:text-base">
                        {exp.description}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="relative bg-slate-800 backdrop-blur-lg border border-blue-400/50 rounded-xl shadow-lg p-4 sm:p-6">
            <button
              onClick={() => setAdding(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label="Cancel"
            >
              <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 drop-shadow-sm pr-8">
              Add New Experience
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <input
                  name="title"
                  value={newExp.title}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Job Title"
                />
                <input
                  name="company"
                  value={newExp.company}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Company"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={newExp.startDate}
                    onChange={handleNewChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                    End Date
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={newExp.endDate}
                    onChange={handleNewChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  />
                </div>
                <input
                  name="location"
                  value={newExp.location}
                  onChange={handleNewChange}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
                  placeholder="Location"
                />
              </div>

              <textarea
                name="description"
                value={newExp.description}
                onChange={handleNewChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none text-sm sm:text-base"
                placeholder="Job Description"
                rows={4}
              />

              <button
                onClick={handleAdd}
                className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50 text-sm sm:text-base"
                disabled={saveExperienceMutation.isPending}
              >
                {saveExperienceMutation.isPending
                  ? "Saving..."
                  : "Add Experience"}
              </button>
            </div>
          </div>
        )}
      </div>

      {expList.length === 0 && !adding && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-slate-400 text-base sm:text-lg mb-4">
            No experience entries yet
          </div>
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 text-sm sm:text-base"
          >
            Add Your First Experience
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
