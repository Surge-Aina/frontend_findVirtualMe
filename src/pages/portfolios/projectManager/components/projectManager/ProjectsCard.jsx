import { useState, useEffect, useContext } from "react";
import { FaPen, FaPlus, FaTimes, FaTrash, FaSave, FaExternalLinkAlt } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../../../../context/AuthContext";

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

const ProjectsCard = ({ portfolio }) => {
  const { user } = useContext(AuthContext);
  const projects = portfolio.projects;
  const portfolioId = portfolio?._id;
  const [editIdx, setEditIdx] = useState(null);
  const [editProject, setEditProject] = useState({});
  const [projectList, setProjectList] = useState(projects);
  const [adding, setAdding] = useState(false);
  const [linkValid, setLinkValid] = useState(true);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    link: "",
  });

  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_BACKEND_API;

  // Update local state when projects prop changes
  useEffect(() => {
    setProjectList(projects || []);
  }, [projects]);

  // Mutation for saving projects data
  const saveProjectsMutation = useMutation({
    mutationFn: async (projectsData) => {
      // build updated portfolio with new projects array
      const updatedPortfolio = {
        ...portfolio,
        projects: projectsData,
      };

      const response = await axios.patch(`${apiUrl}/portfolio/edit`, {
        portfolio: updatedPortfolio,
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Save successful:", data);

      // sync local state with what backend actually saved
      setProjectList(data.projects || []);

      toast.success("Project saved successfully!");

      // update the same query key used in PortfolioPage
      if (portfolioId) {
        queryClient.setQueryData(["portfolio", portfolioId], data);
      } else {
        // fallback: invalidate any 'portfolio' queries
        queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      }
    },
    onError: (error) => {
      console.error("Save failed:", error);
      toast.error("Failed to save Project");
    },
  });

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditProject(projectList[idx]);
  };

  const handleChange = (e) => {
    setEditProject({ ...editProject, [e.target.name]: e.target.value });
  };

  const handleSave = (idx) => {
    const updated = [...projectList];
    updated[idx] = editProject;
    setProjectList(updated);
    saveProjectsMutation.mutate(updated);
    setEditIdx(null);
    setEditProject({});
  };

  const handleCancel = () => {
    setEditIdx(null);
    setEditProject({});
  };

  const handleDelete = (idx) => {
    const updated = projectList.filter((_, i) => i !== idx);
    setProjectList(updated);
    saveProjectsMutation.mutate(updated);
    setEditIdx(null);
    setEditProject({});
  };

  const handleNewChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const updated = [...projectList, newProject];
    setProjectList(updated);
    saveProjectsMutation.mutate(updated);
    setNewProject({
      name: "",
      description: "",
      link: "",
    });
    setAdding(false);
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="mt-6" data-testid="projects-card">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Projects</h2>
        {portfolio.email === user?.email && (
          <button
            data-testid="add-project-btn"
            onClick={() => setAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg border border-blue-500"
            disabled={saveProjectsMutation.isPending}
          >
            <FaPlus className="w-4 h-4" /> Add Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectList.map((proj, idx) => (
          <div
            data-testid="project-card"
            key={idx}
            className="relative bg-slate-800 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-white/30 min-h-[250px] flex flex-col"
          >
            {editIdx === idx ? (
              <div className="space-y-4 flex-1">
                <div className="flex justify-end gap-2 mb-4">
                  <button
                    data-testid="cancel-project-btn"
                    onClick={handleCancel}
                    className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
                    aria-label="Cancel"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                  <button
                    data-testid="save-project-btn"
                    onClick={() => handleSave(idx)}
                    className="p-2 text-green-400 hover:text-green-300 rounded-full hover:bg-green-500/20 transition-colors"
                    aria-label="Save"
                    disabled={saveProjectsMutation.isPending}
                  >
                    <FaSave className="w-4 h-4" />
                  </button>
                  <button
                    data-testid="delete-project-btn"
                    onClick={() => handleDelete(idx)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-colors"
                    aria-label="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>

                <input
                  data-testid="project-name-input"
                  name="name"
                  value={editProject.name || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Project Name"
                />

                <textarea
                  data-testid="project-description-input"
                  name="description"
                  value={editProject.description || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                  placeholder="Project Description"
                  rows={4}
                />

                <input
                  data-testid="project-link-input"
                  name="link"
                  value={editProject.link}
                  onChange={handleChange}
                  onBlur={() => {
                    if (!isValidUrl(editProject.link)) {
                      setLinkValid(false);
                      editProject.link = null;
                      toast.error("Invalid URL");
                    } else {
                      setLinkValid(true);
                    }
                  }}
                  className={`w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg ${
                    linkValid ? "text-white" : "text-red-400"
                  } placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50`}
                  placeholder="Project Link (https://...)"
                />
              </div>
            ) : (
              <>
                {portfolio.email === user?.email && (
                  <button
                    data-testid="edit-project-btn"
                    onClick={() => handleEdit(idx)}
                    className="absolute top-4 right-4 p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-blue-500/20 transition-colors"
                    aria-label="Edit"
                  >
                    <FaPen className="w-4 h-4" />
                  </button>
                )}

                <div className="pr-12 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 drop-shadow-sm">{proj.name}</h3>
                    <p className="text-slate-200 leading-relaxed drop-shadow-sm">{proj.description}</p>
                  </div>

                  {proj.link && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg border border-blue-500"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        <span className="text-white">View Project</span>
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="relative bg-slate-800 backdrop-blur-lg border border-blue-400/50 rounded-xl shadow-lg p-6 min-h-[250px] flex flex-col">
            <button
              data-testid="cancel-add-project-btn"
              onClick={() => setAdding(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
              aria-label="Cancel"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 drop-shadow-sm">Add New Project</h3>

            <div className="space-y-4 flex-1">
              <input
                data-testid="project-name-input"
                name="name"
                value={newProject.name}
                onChange={handleNewChange}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Project Name"
              />

              <textarea
                data-testid="project-description-input"
                name="description"
                value={newProject.description}
                onChange={handleNewChange}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                placeholder="Project Description"
                rows={4}
              />

              <input
                data-testid="project-link-input"
                name="link"
                value={newProject.link}
                onChange={handleNewChange}
                className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Project Link (https://...)"
              />

              <button
                data-testid="submit-project-btn"
                onClick={handleAdd}
                className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500 disabled:opacity-50"
                disabled={saveProjectsMutation.isPending}
              >
                {saveProjectsMutation.isPending ? "Saving..." : "Add Project"}
              </button>
            </div>
          </div>
        )}
      </div>

      {projectList.length === 0 && !adding && portfolio.email === user?.email && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-4">No projects yet</div>
          <button
            data-testid="add-project-btn"
            onClick={() => setAdding(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg border border-blue-500"
          >
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsCard;
