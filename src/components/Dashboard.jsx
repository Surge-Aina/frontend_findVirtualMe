import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useHandleCardClick } from "../utils/useHandleCardClick";
import axiosAuth from "../utils/axiosAuth.js";

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

  // robust identity getters
  const loggedInEmail = (user?.email || localStorage.getItem("email") || "").trim().toLowerCase();

  const loggedInId = String(
    user?._id || user?.id || localStorage.getItem("userId") || localStorage.getItem("id") || ""
  );

  // re-run when login state OR user object changes
  useEffect(() => {
    fetchPortfolios();
    fetchPublicProjects();
    if (user) {
      fetchProjects();
    }
  }, [user, token]);

  // read owner email from common places; if handyman lacks email but userId==me → it's mine
  const ownerEmail = (obj, type) => {
    const e = obj?.email || obj?.userEmail || obj?.ownerEmail || obj?.user?.email || obj?.owner?.email || "";
    if (e) return String(e).trim().toLowerCase();

    if (type === "handyman" || type === "cleaningLady") {
      const uid = String(obj?.userId || "");
      if (uid && loggedInId && uid === loggedInId) return loggedInEmail;
    }
    return "";
  };

  // uniform card
  const toCard = (obj, type = "general") => {
    const email = ownerEmail(obj, type);
    const title = obj?.businessName || obj?.title || obj?.portfolioTitle || obj?.role || "Untitled Portfolio";
    const name =
      obj?.name ||
      [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") ||
      (email ? email.split("@")[0] : "") ||
      (type === "cleaningLady" ? "Cleaning Service" : type === "handyman" ? "Handyman" : "User");
    return { _id: obj?._id, title, name, email, type };
  };

  const fetchPortfolios = async () => {
    try {
      //get public portfolios
      fetchPublicPotfolios();
      //get your own portfolios if signed in
      if (user) {
        fetchMyPortfolios();
      }
    } catch (err) {
      toast.error("Error fetching portfolios");
      console.error(err);
    }
  };

  const fetchPublicPotfolios = async () => {
    try {
      const pubPortfs = await axiosAuth.get("/publicPortfolios/public");
      const portfolios = pubPortfs.data?.portfolios || [];
      setOtherPortfolios(Array.isArray(portfolios) ? portfolios : []);
      console.log("other portfolios: ", portfolios);
    } catch (error) {
      console.error("Error fetching public portfolios:", error);
      setOtherPortfolios([]);
    }
  };

  const fetchMyPortfolios = async () => {
    if (!user) return;
    try {
      const promises = user.portfolios.map(({ portfolioId, portfolioType }) =>
        axiosAuth.get(`/publicPortfolios/${portfolioType}/${portfolioId}`).then((res) => res.data)
      );

      const fullPortfolios = await Promise.all(promises);
      console.log("full portfolios: ", fullPortfolios);
      setMyPortfolios(fullPortfolios);
    } catch (err) {
      console.error("Error fetching full portfolios:", err);
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
      } else {
        toast.error("Problem fetching Public Projects");
      }
    } catch (error) {
      toast.error("Error fetching public projects");
      console.error(error);
    }
  };

  const togglePublic = async (portfolio) => {
    try {
      // 🏥 FIX 1: Use practiceId for Healthcare, _id for others
      const portfolioId = portfolio.practiceId || portfolio._id;

      const res = await axiosAuth.patch(`/publicPortfolios/${portfolioId}/toggle-public`);

      if (res.data?.success) {
        toast.success("Toggled Public Setting");

        // 🏥 FIX 2: Match by practiceId OR _id
        setMyPortfolios((prev) =>
          prev.map((p) => {
            const currentId = p.practiceId || p._id;
            const matchId = portfolio.practiceId || portfolio._id;
            return currentId === matchId ? { ...p, isPublic: res.data.portfolio.isPublic } : p;
          })
        );
        fetchPublicPotfolios();
      } else {
        toast.error("Could not toggle public");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error toggling public setting");
    }
  };

  // Helper functions
  const linesToText = (linesObj = {}) => {
    try {
      if (!linesObj || Object.keys(linesObj).length === 0) return "<!DOCTYPE html>";
      return Object.keys(linesObj)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => linesObj[k] ?? "")
        .join("\n");
    } catch (error) {
      console.error("Error in linesToText:", error);
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
      const res = await axiosAuth.delete(`/publicPortfolios/${portfolioId}`);

      const { data } = res;

      if (data.success) {
        toast.success(`Deleted portfolio: ${data.portfolio._id}`);
        console.log("Successfully deleted portfolio", data);
        refreshUser();
      } else {
        toast.error(data.message || "Could not delete portfolio");
      }
    } catch (error) {
      toast.error("There was an error deleting portfolio");
      console.error(error);
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

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* My Portfolios */}
          {user && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-slate-800">My Portfolios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
                {myPortfolios.map((p) => {
                  // 🏥 FIX 3: Get the correct ID to match with user.portfolios
                  const portfolioId = p.practiceId || p._id;

                  return (
                    <div
                      key={portfolioId}
                      className="bg-white rounded-xl shadow-md p-6 cursor-pointer relative"
                      onClick={() => handleCardClick(p)}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePublic(p);
                        }}
                        className={`absolute top-3 right-3 w-16 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center
      ${Boolean(p.isPublic) ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute w-3/4 py-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium transition-transform duration-300 border border-gray-600
        ${Boolean(p.isPublic) ? "translate-x-[16px]" : "translate-x-0"}`}
                        >
                          {Boolean(p.isPublic) ? "public" : "private"}
                        </div>
                      </div>

                      <div className="mt-8 font-semibold text-slate-800 mb-2">
                      {user.portfolios.find((portfolio) => String(portfolio.portfolioId) === String(portfolioId))?.portfolioType ||
  "Unknown"}                      </div>

                      {/* ✅ Show Healthcare practice name or other portfolio names */}
                      <div className="text-slate-600 mb-2">
                        {p.practice?.name || p.businessName || p.title || p.portfolioTitle || "Untitled Portfolio"}
                      </div>

                      <div className="text-slate-600 text-xs">{portfolioId}</div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 🏥 FIX 4: Use practiceId for Healthcare when deleting
                          handleDeletePortfolio(portfolioId);
                        }}
                        className="mt-4 px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}

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

          {/* Public Portfolios and Public Projects conditional */}
          {viewMode === "other" ? (
            //public portfolios
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-slate-800">Public Portfolios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-6">
                {otherPortfolios && otherPortfolios.length > 0 ? (
                  otherPortfolios.map((p) => (
                    <div
                      key={p.practiceId || p._id}
                      className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
                      onClick={() => handleCardClick(p)}
                    >
                      <div className="font-semibold mb-2 bg-slate-600 rounded-2xl text-white">{p.portfolioType}</div>

                      {/* ✅ Show Healthcare practice name or other portfolio names */}
                      <div className="font-bold text-slate-800 mb-2 text-xl">
                        {p.practice?.name || p.businessName || p.title || p.portfolioTitle || "Untitled"}
                      </div>

                      <div className="text-slate-600 text-sm">{p.name}</div>
                      <div className="text-slate-600 text-sm">{p.email}</div>
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
            // public projects
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
    </>
  );
}
