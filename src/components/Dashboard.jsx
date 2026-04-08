import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";
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

function isAiPortfolio(portfolio) {
  return portfolio.createdBy === "agent" || portfolio.template === "agent";
}

/** Pull string values from nested section data (contact email lives here, not on portfolio root). */
function collectStringsFromValue(value, depth = 0, maxDepth = 5) {
  if (depth > maxDepth || value == null) return [];
  if (typeof value === "string") return [value];
  if (typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) {
    return value.flatMap((v) => collectStringsFromValue(v, depth + 1, maxDepth));
  }
  if (typeof value === "object") {
    return Object.values(value).flatMap((v) => collectStringsFromValue(v, depth + 1, maxDepth));
  }
  return [];
}

function stringsFromPortfolioSections(portfolio) {
  if (!Array.isArray(portfolio.sections)) return [];
  return portfolio.sections.flatMap((section) => collectStringsFromValue(section?.data));
}

function portfolioMatchesSearch(portfolio, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const parts = [
    getPortfolioDisplayName(portfolio),
    portfolio.title,
    portfolio.businessName,
    portfolio.portfolioTitle,
    portfolio.name,
    portfolio.slug,
    portfolio._id != null ? String(portfolio._id) : "",
    portfolio.email,
    portfolio.contact?.email,
    ...stringsFromPortfolioSections(portfolio),
    portfolio.socialLinks?.website,
    portfolio.socialLinks?.github,
    portfolio.socialLinks?.linkedin,
  ];
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}

function sortPortfolios(list, sortKey, getName, getTypeLabel) {
  const copy = [...list];
  const cmp = {
    nameAsc: (a, b) => getName(a).localeCompare(getName(b), undefined, { sensitivity: "base" }),
    nameDesc: (a, b) => getName(b).localeCompare(getName(a), undefined, { sensitivity: "base" }),
    createdNewest: (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    createdOldest: (a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    updatedRecent: (a, b) =>
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    typeAsc: (a, b) => {
      const ta = `${getTypeLabel(a)} ${a.template || ""}`;
      const tb = `${getTypeLabel(b)} ${b.template || ""}`;
      return ta.localeCompare(tb, undefined, { sensitivity: "base" });
    },
  };
  const fn = cmp[sortKey] || cmp.updatedRecent;
  copy.sort(fn);
  return copy;
}

const PAGE_SIZE = 18;

function portfolioPageRange(page, total, pageSize) {
  if (total <= 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { handleCardClick } = useHandleCardClick();
  const { user, token, refreshUser } = useContext(AuthContext);

  const [myPortfolios, setMyPortfolios] = useState([]);
  const [publicPortfolios, setPublicPortfolios] = useState([]);

  const [mySearch, setMySearch] = useState("");
  const [mySort, setMySort] = useState("updatedRecent");
  const [myVisibility, setMyVisibility] = useState("all");
  const [myKind, setMyKind] = useState("all");

  const [publicSearch, setPublicSearch] = useState("");
  const [publicSort, setPublicSort] = useState("updatedRecent");
  const [publicTemplate, setPublicTemplate] = useState("all");

  const [myPortfolioPage, setMyPortfolioPage] = useState(1);
  const [publicPortfolioPage, setPublicPortfolioPage] = useState(1);

  useEffect(() => {
    setMyPortfolioPage(1);
  }, [mySearch, mySort, myVisibility, myKind]);

  useEffect(() => {
    setPublicPortfolioPage(1);
  }, [publicSearch, publicSort, publicTemplate]);

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

  const filteredMyPortfolios = useMemo(() => {
    let list = myPortfolios;

    if (myVisibility === "public") {
      list = list.filter((p) => isPortfolioPublic(p));
    } else if (myVisibility === "private") {
      list = list.filter((p) => !isPortfolioPublic(p));
    }

    if (myKind === "ai") {
      list = list.filter((p) => isAiPortfolio(p));
    } else if (myKind === "other") {
      list = list.filter((p) => !isAiPortfolio(p));
    }

    list = list.filter((p) => portfolioMatchesSearch(p, mySearch));

    return sortPortfolios(list, mySort, getPortfolioDisplayName, getPortfolioTypeLabel);
  }, [myPortfolios, mySearch, mySort, myVisibility, myKind]);

  const publicTemplateOptions = useMemo(() => {
    const set = new Set();
    publicPortfolios.forEach((p) => {
      if (p.template) set.add(p.template);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [publicPortfolios]);

  const filteredPublicPortfolios = useMemo(() => {
    let list = publicPortfolios;
    if (publicTemplate !== "all") {
      list = list.filter((p) => p.template === publicTemplate);
    }
    list = list.filter((p) => portfolioMatchesSearch(p, publicSearch));
    return sortPortfolios(list, publicSort, getPortfolioDisplayName, getPortfolioTypeLabel);
  }, [publicPortfolios, publicSearch, publicSort, publicTemplate]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMyPortfolios.length / PAGE_SIZE));
    setMyPortfolioPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredMyPortfolios.length]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredPublicPortfolios.length / PAGE_SIZE));
    setPublicPortfolioPage((p) => (p > totalPages ? totalPages : p));
  }, [filteredPublicPortfolios.length]);

  const paginatedMyPortfolios = useMemo(() => {
    const start = (myPortfolioPage - 1) * PAGE_SIZE;
    return filteredMyPortfolios.slice(start, start + PAGE_SIZE);
  }, [filteredMyPortfolios, myPortfolioPage]);

  const paginatedPublicPortfolios = useMemo(() => {
    const start = (publicPortfolioPage - 1) * PAGE_SIZE;
    return filteredPublicPortfolios.slice(start, start + PAGE_SIZE);
  }, [filteredPublicPortfolios, publicPortfolioPage]);

  const myTotalPages = Math.max(1, Math.ceil(filteredMyPortfolios.length / PAGE_SIZE));
  const publicTotalPages = Math.max(1, Math.ceil(filteredPublicPortfolios.length / PAGE_SIZE));

  const myPageRange = portfolioPageRange(myPortfolioPage, filteredMyPortfolios.length, PAGE_SIZE);
  const publicPageRangeVals = portfolioPageRange(
    publicPortfolioPage,
    filteredPublicPortfolios.length,
    PAGE_SIZE
  );

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
      setMyPortfolioPage(1);
      refreshUser?.();
      toast.success("Deleted portfolio");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting portfolio");
    }
  };

  const sortSelectClass =
    "rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-slate-800 dark:text-neutral-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const searchInputClass =
    "w-full sm:w-56 rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-slate-800 dark:text-neutral-200 shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950 pt-24 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {user && (
          <section>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-neutral-100">My Portfolios</h2>
            </div>

            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3 mb-6">
              <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-none">
                <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Search</span>
                <input
                  type="search"
                  value={mySearch}
                  onChange={(e) => setMySearch(e.target.value)}
                  placeholder="Name, ID, slug…"
                  className={searchInputClass}
                  autoComplete="off"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Sort</span>
                <select value={mySort} onChange={(e) => setMySort(e.target.value)} className={sortSelectClass}>
                  <option value="updatedRecent">Recently updated</option>
                  <option value="createdNewest">Newest first</option>
                  <option value="createdOldest">Oldest first</option>
                  <option value="nameAsc">Name A–Z</option>
                  <option value="nameDesc">Name Z–A</option>
                  <option value="typeAsc">Type</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Visibility</span>
                <select
                  value={myVisibility}
                  onChange={(e) => setMyVisibility(e.target.value)}
                  className={sortSelectClass}
                >
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Kind</span>
                <select value={myKind} onChange={(e) => setMyKind(e.target.value)} className={sortSelectClass}>
                  <option value="all">All</option>
                  <option value="ai">AI</option>
                  <option value="other">Non-AI</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMyPortfolios.length === 0 && myPortfolios.length > 0 && (
                <div className="col-span-full text-center py-10 text-slate-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700 text-sm">
                  No portfolios match your search or filters.
                </div>
              )}

              {paginatedMyPortfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 cursor-pointer relative border border-transparent dark:border-neutral-700"
                  onClick={() => handleCardClick(portfolio)}
                >
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePublic(portfolio);
                    }}
                    className={`absolute top-4 right-4 h-6 w-16 overflow-hidden rounded-full cursor-pointer transition-colors duration-300 ${
                      isPortfolioPublic(portfolio) ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 flex w-3/4 items-center justify-center rounded-full bg-gray-900 px-0.5 text-center text-[10px] font-medium leading-none text-white shadow-sm ring-1 ring-black/20 transition-transform duration-300 dark:ring-white/10 ${
                        isPortfolioPublic(portfolio) ? "translate-x-4" : "translate-x-0"
                      }`}
                    >
                      {isPortfolioPublic(portfolio) ? "public" : "private"}
                    </div>
                  </div>

                  <div className="mt-8 mb-2 inline-flex rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 px-3 py-1 text-xs font-semibold">
                    {getPortfolioTypeLabel(portfolio)}
                  </div>
                  <div className="text-slate-800 dark:text-neutral-100 font-semibold min-h-[3rem]">
                    {getPortfolioDisplayName(portfolio)}
                  </div>
                  <div className="text-slate-400 dark:text-neutral-500 text-xs truncate mt-2">{portfolio._id}</div>

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
                type="button"
                onClick={() => navigate("/resume")}
                className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 border-2 border-dashed border-slate-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all min-h-[200px] cursor-pointer"
              >
                <span className="text-5xl text-blue-400 font-bold">+</span>
                <span className="mt-2 text-slate-700 dark:text-neutral-200 font-medium">Add Portfolio</span>
                <span className="mt-1 text-sm text-slate-500 dark:text-neutral-400 text-center">
                  Start from an existing template
                </span>
              </button>

              <button
                type="button"
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

            {filteredMyPortfolios.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-neutral-700">
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Showing {myPageRange.start}–{myPageRange.end} of {filteredMyPortfolios.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={myPortfolioPage <= 1}
                    onClick={() => setMyPortfolioPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-neutral-200 shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={myPortfolioPage >= myTotalPages}
                    onClick={() => setMyPortfolioPage((p) => Math.min(myTotalPages, p + 1))}
                    className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-neutral-200 shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-neutral-100">Public Portfolios</h2>

          <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3 mb-6">
            <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-none">
              <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Search</span>
              <input
                type="search"
                value={publicSearch}
                onChange={(e) => setPublicSearch(e.target.value)}
                placeholder="Name, email, ID…"
                className={searchInputClass}
                autoComplete="off"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Sort</span>
              <select
                value={publicSort}
                onChange={(e) => setPublicSort(e.target.value)}
                className={sortSelectClass}
              >
                <option value="updatedRecent">Recently updated</option>
                <option value="createdNewest">Newest first</option>
                <option value="createdOldest">Oldest first</option>
                <option value="nameAsc">Name A–Z</option>
                <option value="nameDesc">Name Z–A</option>
                <option value="typeAsc">Type</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 min-w-[10rem]">
              <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">Template</span>
              <select
                value={publicTemplate}
                onChange={(e) => setPublicTemplate(e.target.value)}
                className={sortSelectClass}
              >
                <option value="all">All templates</option>
                {publicTemplateOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPortfolios.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700">
                No public portfolios available yet
              </div>
            ) : filteredPublicPortfolios.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700 text-sm">
                No portfolios match your search or filters.
              </div>
            ) : (
              paginatedPublicPortfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 cursor-pointer border border-transparent dark:border-neutral-700"
                  onClick={() => handleCardClick(portfolio)}
                >
                  <div className="font-semibold mb-3 bg-slate-600 dark:bg-slate-500 rounded-2xl text-white px-3 py-1 inline-block text-sm">
                    {getPortfolioTypeLabel(portfolio)}
                  </div>
                  <div className="font-bold text-slate-800 dark:text-neutral-100 mb-2 text-xl">
                    {getPortfolioDisplayName(portfolio)}
                  </div>
                  <div className="text-slate-600 dark:text-neutral-400 text-sm">{portfolio.name}</div>
                  <div className="text-slate-600 dark:text-neutral-400 text-sm">
                    {portfolio.email || portfolio.contact?.email}
                  </div>
                </div>
              ))
            )}
          </div>

          {publicPortfolios.length > 0 && filteredPublicPortfolios.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-neutral-700">
              <p className="text-sm text-slate-600 dark:text-neutral-400">
                Showing {publicPageRangeVals.start}–{publicPageRangeVals.end} of{" "}
                {filteredPublicPortfolios.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={publicPortfolioPage <= 1}
                  onClick={() => setPublicPortfolioPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-neutral-200 shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={publicPortfolioPage >= publicTotalPages}
                  onClick={() => setPublicPortfolioPage((p) => Math.min(publicTotalPages, p + 1))}
                  className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-slate-800 dark:text-neutral-200 shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
