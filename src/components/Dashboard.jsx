import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useHandleCardClick } from "../utils/useHandleCardClick";
import { portfolioApi } from "../api/portfolioApi.js";

export default function Dashboard() {
  const { handleCardClick } = useHandleCardClick();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const { user, token, refreshUser } = useContext(AuthContext);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [otherPortfolios, setOtherPortfolios] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [viewMode, setViewMode] = useState("other");

  useEffect(() => {
    fetchPortfolios();
    fetchPublicProjects();
    if (user) {
      fetchProjects();
    }
  }, [user, token]);

  const fetchPortfolios = async () => {
    try {
      fetchPublicPortfolios();
      if (user && token) {
        fetchMyPortfolios();
      }
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };

  const fetchPublicPortfolios = async () => {
    try {
      const pubPortfs = await portfolioApi.listPublic();
      const portfolios = pubPortfs.data?.portfolios || [];
      setOtherPortfolios(Array.isArray(portfolios) ? portfolios : []);
    } catch (error) {
      console.error("Error fetching public portfolios:", error);
      setOtherPortfolios([]);
    }
  };

  const fetchMyPortfolios = async () => {
    if (!user || !token) return;
    try {
      const res = await portfolioApi.getMine();
      const portfolios = res.data?.portfolios || [];
      setMyPortfolios(Array.isArray(portfolios) ? portfolios : []);
    } catch (err) {
      console.error("Error fetching my portfolios:", err);
      setMyPortfolios([]);
      toast.error("Could not load your portfolios");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projects = Array.isArray(res.data) ? res.data : [];
      setMyProjects(projects);
    } catch (err) {
      toast.error("Error fetching projects");
      console.error(err);
    }
  };

  const fetchPublicProjects = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/publicProjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const projects = Array.isArray(res.data.projects) ? res.data.projects : [];
        setPublicProjects(projects);
      }
    } catch (error) {
      console.error("Error fetching public projects:", error);
    }
  };

  const isPortfolioPublic = (p) =>
    p?.visibility === "public" || Boolean(p?.isPublic);

  const togglePublic = async (portfolio) => {
    try {
      const portfolioId = portfolio._id;

      const res = await portfolioApi.toggleVisibility(portfolioId);

      if (res.data?.success) {
        const nextVisibility = res.data.visibility;
        toast.success("Toggled visibility");
        setMyPortfolios((prev) =>
          prev.map((p) =>
            p._id === portfolioId ? { ...p, visibility: nextVisibility } : p
          )
        );
        fetchPublicPortfolios();
      } else {
        toast.error("Could not toggle visibility");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error(error.response?.data?.error || "Error toggling visibility");
    }
  };

  const linesToText = (linesObj = {}) => {
    try {
      if (!linesObj || Object.keys(linesObj).length === 0) return "<!DOCTYPE html>";
      return Object.keys(linesObj)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => linesObj[k] ?? "")
        .join("\n");
    } catch (error) {
      return "<!DOCTYPE html>";
    }
  };

  const handlePublicProjectPreview = (projectId) => {
    const p = publicProjects.find((proj) => proj.projectId === projectId);
    if (!p) return;

    const html = linesToText(p.frontendJson?.lines || {});
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.onload = () => URL.revokeObjectURL(url);
    }
  };

  const handleAddPortfolio = () => navigate("/resume");

  const handleDeletePortfolio = async (portfolioId) => {
    try {
      const res = await portfolioApi.delete(portfolioId);

      if (res.data.success) {
        toast.success(`Deleted portfolio`);
        setMyPortfolios((prev) => prev.filter((p) => p._id !== portfolioId));
        fetchPublicPortfolios();
        refreshUser();
      } else {
        toast.error("Could not delete portfolio");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting portfolio");
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/editor?project=${projectId}`);
  };

  const handleNewProject = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/projects`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.ok && res.data.activeProjectId) {
        navigate(`/editor?project=${res.data.activeProjectId}`);
      } else {
        toast.error("Failed to create project");
      }
    } catch (err) {
      toast.error("Error creating project");
      console.error(err);
    }
  };

  // ✅ Helper to get display name for any portfolio type
  const getPortfolioDisplayName = (p) => {
    if (p.portfolioType === "Healthcare") {
      return p.practice?.name || p.portfolioName || "Healthcare Portfolio";
    }
    return (
      p.title ||
      p.businessName ||
      p.portfolioTitle ||
      p.name ||
      "Untitled Portfolio"
    );
  };

  const getPortfolioTypeLabel = (p) => p.template || p.portfolioType || "—";

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* My Portfolios */}
        {user && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">My Portfolios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
              {myPortfolios.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer relative"
                  onClick={() => handleCardClick(p)}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublic(p);
                    }}
                    className={`absolute top-3 right-3 w-16 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center
                      ${isPortfolioPublic(p) ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute w-3/4 py-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium transition-transform duration-300 border border-gray-600
                        ${isPortfolioPublic(p) ? "translate-x-[16px]" : "translate-x-0"}`}
                    >
                      {isPortfolioPublic(p) ? "public" : "private"}
                    </div>
                  </div>

                  <div className="mt-8 font-semibold text-slate-800 mb-2">
                    {getPortfolioTypeLabel(p)}
                  </div>

                  <div className="text-slate-600 mb-2">
                    {getPortfolioDisplayName(p)}
                  </div>

                  <div className="text-slate-400 text-xs truncate">{p._id}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(p.template || p.sections) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolios/view/${p._id}/edit`);
                        }}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePortfolio(p._id);
                      }}
                      className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddPortfolio}
                className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all min-h-[180px] cursor-pointer"
              >
                <span className="text-5xl text-blue-400 font-bold">+</span>
                <span className="mt-2 text-slate-500">Add Portfolio</span>
              </button>
            </div>
          </section>
        )}

        {/* My Projects */}
        {user && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">My Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
              {myProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProjectClick(project.projectId)}
                >
                  <div className="font-semibold text-slate-800 mb-2">{project.name}</div>
                  <div className="text-sm text-slate-500 mb-2">ID: {project.projectId}</div>
                  <div className="text-xs text-slate-400">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              <button
                onClick={handleNewProject}
                className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-green-400 transition-all min-h-[180px] cursor-pointer"
              >
                <span className="text-5xl text-green-400 font-bold">+</span>
                <span className="mt-2 text-slate-500">New Project</span>
              </button>
            </div>
          </section>
        )}

        {/* Toggle Selector */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setViewMode("other")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              viewMode === "other"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-300"
            }`}
          >
            Public Portfolios
          </button>

          <button
            onClick={() => setViewMode("public")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              viewMode === "public"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-300"
            }`}
          >
            Public Projects
          </button>
        </div>

        {/* Public Portfolios and Public Projects */}
        {viewMode === "other" ? (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Public Portfolios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-6">
              {otherPortfolios && otherPortfolios.length > 0 ? (
                otherPortfolios.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="font-semibold mb-2 bg-slate-600 rounded-2xl text-white px-2 py-1 inline-block">
                      {getPortfolioTypeLabel(p)}
                    </div>

                    <div className="font-bold text-slate-800 mb-2 text-xl">
                      {getPortfolioDisplayName(p)}
                    </div>

                    <div className="text-slate-600 text-sm">{p.name}</div>
                    <div className="text-slate-600 text-sm">{p.email || p.contact?.email}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No public portfolios available yet
                </div>
              )}
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Public Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
              {publicProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePublicProjectPreview(project.projectId)}
                >
                  <div className="font-semibold text-slate-800 mb-2">{project.name}</div>
                  <div className="text-sm text-slate-500 mb-2">ID: {project.projectId}</div>
                  <div className="text-xs text-slate-400">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}