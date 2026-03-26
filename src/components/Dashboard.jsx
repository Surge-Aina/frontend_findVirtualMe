import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

import { AuthContext } from "../context/AuthContext.jsx";
import { useHandleCardClick } from "../utils/useHandleCardClick";
import { portfolioApi } from "../api/portfolioApi.js";

function getPortfolioDisplayName(portfolio) {
  if (portfolio.portfolioType === "Healthcare") {
    return portfolio.practice?.name || portfolio.portfolioName || "Healthcare Portfolio";
  }

  return (
    portfolio.title ||
    portfolio.businessName ||
    portfolio.portfolioTitle ||
    portfolio.name ||
    "Untitled Portfolio"
  );
}

function getPortfolioTypeLabel(portfolio) {
  if (portfolio.createdBy === "agent" || portfolio.template === "agent") {
    return "AI Portfolio";
  }
  return portfolio.template || portfolio.portfolioType || "Portfolio";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { handleCardClick } = useHandleCardClick();
  const { user, token, refreshUser } = useContext(AuthContext);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [publicPortfolios, setPublicPortfolios] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const publicRes = await portfolioApi.listPublic();
        setPublicPortfolios(Array.isArray(publicRes.data?.portfolios) ? publicRes.data.portfolios : []);
      } catch (error) {
        console.error("Error fetching public portfolios:", error);
        setPublicPortfolios([]);
      }

      if (!user || !token) return;

      try {
        const mineRes = await portfolioApi.getMine();
        setMyPortfolios(Array.isArray(mineRes.data?.portfolios) ? mineRes.data.portfolios : []);
      } catch (error) {
        console.error("Error fetching my portfolios:", error);
        setMyPortfolios([]);
        toast.error("Could not load your portfolios");
      }
    };

    load();
  }, [user, token]);

  const isPortfolioPublic = (portfolio) =>
    portfolio?.visibility === "public" || Boolean(portfolio?.isPublic);

  const togglePublic = async (portfolio) => {
    try {
      const res = await portfolioApi.toggleVisibility(portfolio._id);
      if (!res.data?.success) {
        toast.error("Could not toggle visibility");
        return;
      }

      const nextVisibility = res.data.visibility;
      setMyPortfolios((prev) =>
        prev.map((item) =>
          item._id === portfolio._id ? { ...item, visibility: nextVisibility } : item
        )
      );

      try {
        const publicRes = await portfolioApi.listPublic();
        setPublicPortfolios(Array.isArray(publicRes.data?.portfolios) ? publicRes.data.portfolios : []);
      } catch (error) {
        console.error("Error refreshing public portfolios:", error);
      }

      toast.success("Visibility updated");
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error(error.response?.data?.error || "Error toggling visibility");
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    try {
      const res = await portfolioApi.delete(portfolioId);
      if (!res.data?.success) {
        toast.error("Could not delete portfolio");
        return;
      }

      setMyPortfolios((prev) => prev.filter((portfolio) => portfolio._id !== portfolioId));
      setPublicPortfolios((prev) => prev.filter((portfolio) => portfolio._id !== portfolioId));
      refreshUser?.();
      toast.success("Deleted portfolio");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting portfolio");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {user && (
          <section>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">My Portfolios</h2>
                <p className="text-slate-500 mt-1">
                  AI-generated portfolios now live here alongside every other portfolio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {myPortfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className="bg-white rounded-2xl shadow-md p-6 cursor-pointer relative"
                  onClick={() => handleCardClick(portfolio)}
                >
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePublic(portfolio);
                    }}
                    className={`absolute top-4 right-4 w-16 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center ${
                      isPortfolioPublic(portfolio) ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute w-3/4 py-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium transition-transform duration-300 border border-gray-600 ${
                        isPortfolioPublic(portfolio) ? "translate-x-[16px]" : "translate-x-0"
                      }`}
                    >
                      {isPortfolioPublic(portfolio) ? "public" : "private"}
                    </div>
                  </div>

                  <div className="mt-8 mb-2 inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                    {getPortfolioTypeLabel(portfolio)}
                  </div>
                  <div className="text-slate-800 font-semibold min-h-[3rem]">
                    {getPortfolioDisplayName(portfolio)}
                  </div>
                  <div className="text-slate-400 text-xs truncate mt-2">{portfolio._id}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/portfolios/view/${portfolio._id}/edit`);
                      }}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeletePortfolio(portfolio._id);
                      }}
                      className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate("/resume")}
                className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all min-h-[200px] cursor-pointer"
              >
                <span className="text-5xl text-blue-400 font-bold">+</span>
                <span className="mt-2 text-slate-700 font-medium">Add Portfolio</span>
                <span className="mt-1 text-sm text-slate-500 text-center">
                  Start from an existing template
                </span>
              </button>

              <button
                onClick={() => navigate("/portfolios/create/ai", { state: { source: "dashboard" } })}
                className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl shadow-md p-6 border-2 border-dashed border-slate-700 hover:border-sky-400 transition-all min-h-[200px] cursor-pointer text-white"
              >
                <span className="text-4xl font-bold text-sky-300">AI</span>
                <span className="mt-2 font-medium">Create with AI</span>
                <span className="mt-1 text-sm text-slate-300 text-center">
                  Turn a prompt into an editable portfolio
                </span>
              </button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-800">Public Portfolios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPortfolios.length > 0 ? (
              publicPortfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className="bg-white rounded-2xl shadow-md p-6 cursor-pointer"
                  onClick={() => handleCardClick(portfolio)}
                >
                  <div className="font-semibold mb-3 bg-slate-600 rounded-2xl text-white px-3 py-1 inline-block text-sm">
                    {getPortfolioTypeLabel(portfolio)}
                  </div>
                  <div className="font-bold text-slate-800 mb-2 text-xl">
                    {getPortfolioDisplayName(portfolio)}
                  </div>
                  <div className="text-slate-600 text-sm">{portfolio.name}</div>
                  <div className="text-slate-600 text-sm">
                    {portfolio.email || portfolio.contact?.email}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
                No public portfolios available yet
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}