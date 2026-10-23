import { useState, useEffect, useContext } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import axios from "axios";

//attach token to each axios request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const SkillsCard = ({ portfolio }) => {
  const { user } = useContext(AuthContext);
  const skills = portfolio.skills;
  const portfolioId = portfolio?._id;
  const [skillList, setSkillList] = useState(skills);
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BACKEND_API;

  // Update local state when skills prop changes
  useEffect(() => {
    setSkillList(skills || []);
  }, [skills]);

  // Mutation for saving skills data
  const saveSkillsMutation = useMutation({
    mutationFn: async (skillsData) => {
      const updatedPortfolio = {
        ...portfolio,
        skills: skillsData,
      };

      const response = await axios.patch(`${apiUrl}/portfolio/edit`, {
        portfolio: updatedPortfolio,
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Save successful:", data);

      // keep local list in sync with backend
      setSkillList(data.skills || []);

      toast.success("Skills saved successfully!");

      // update the same query PortfolioPage uses
      if (portfolioId) {
        queryClient.setQueryData(["portfolio", portfolioId], data);
      } else {
        // fallback: invalidate all portfolio queries
        queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      }
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error("Failed to save Skills");
    },
  });

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updated = [...skillList, newSkill.trim()];
      setSkillList(updated);
      saveSkillsMutation.mutate(updated);
      setNewSkill("");
      setAdding(false);
    }
  };

  const handleDeleteSkill = (idx) => {
    const updated = skillList.filter((_, i) => i !== idx);
    setSkillList(updated);
    saveSkillsMutation.mutate(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Skills</h2>
        {portfolio.email === user?.email && (
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg border border-blue-500"
            disabled={saveSkillsMutation.isPending}
          >
            <FaPlus className="w-4 h-4" /> Add Skill
          </button>
        )}
      </div>

      <div className="bg-slate-800 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {skillList.length ? (
            skillList.map((skill, idx) => (
              <div
                key={idx}
                className="group relative inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 text-sm font-medium px-4 py-2 rounded-full border border-blue-400/30 hover:bg-blue-500/30 transition-colors"
              >
                <span className="drop-shadow-sm">{skill}</span>
                {portfolio.email === user?.email && (
                  <button
                    onClick={() => handleDeleteSkill(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-all"
                    aria-label="Delete skill"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-lg py-8 text-center w-full">No skills listed yet</div>
          )}
        </div>

        {adding && (
          <div className="border-t border-white/20 pt-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Enter a new skill"
                  autoFocus
                />
              </div>
              <button
                onClick={handleAddSkill}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50"
                disabled={saveSkillsMutation.isPending}
              >
                {saveSkillsMutation.isPending ? "Saving..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewSkill("");
                }}
                className="px-4 py-3 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                aria-label="Cancel"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {skillList.length === 0 && !adding && portfolio.email === user?.email && (
        <div className="text-center py-8">
          <div className="text-slate-400 text-lg mb-4">No skills yet</div>
          <button
            onClick={() => setAdding(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500"
          >
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsCard;
