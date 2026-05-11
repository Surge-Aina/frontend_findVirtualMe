import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/shared/context/AuthContext";
import axiosAuth from "@/shared/api/axiosAuth";
import { toast } from "react-toastify";

const DEFAULT_TERMS_TEXT = `
Terms of Service

By using this portfolio, you agree to the following terms:

1. Use of Service
You may use this portfolio for lawful purposes only. You agree not to use the service in any way that could harm, disable, or impair the portfolio or its owner.

2. Contact Information
Any information you provide through contact forms or other means will be used solely to respond to your inquiries. We do not sell or share your information with third parties.

3. Intellectual Property
All content displayed on this portfolio is owned by the portfolio owner or used with permission. You may not copy, reproduce, or distribute content without explicit permission.

4. Limitation of Liability
The portfolio owner is not liable for any indirect, incidental, or consequential damages arising from your use of this portfolio.

5. Changes
These terms may be updated from time to time. Continued use of the portfolio constitutes acceptance of any changes.

Contact the portfolio owner for questions about these terms.
`.trim();

const portfolioTypeToModelName = {
  Handyman: "HandymanMainPortfolio",
  ProjectManager: "ProjectManagerPortfolio",
  LocalVendor: "LocalVendorPortfolio",
  CleaningLady: "CleaningPortfolio",
  Healthcare: "HealthcarePortfolio",
  DataScientist: "Portfolio",
  agent: "Portfolio",
  Agent: "Portfolio",
};

export default function TermsOfService() {
  const { user } = useContext(AuthContext);
  const [termsList, setTermsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedTermsId, setSelectedTermsId] = useState(null);
  const [name, setName] = useState("");
  const [text, setText] = useState(DEFAULT_TERMS_TEXT);
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState([]);

  const userPortfolios = user?.portfolios || [];

  const loadTerms = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/api/legal/terms-of-service");
      setTermsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load terms of service", err);
      toast.error("Failed to load terms of service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const resetForm = () => {
    setSelectedTermsId(null);
    setName("");
    setText(DEFAULT_TERMS_TEXT);
    setSelectedPortfolioIds([]);
  };

  const handleSelectTerms = (terms) => {
    setSelectedTermsId(terms._id);
    setName(terms.name || "");
    setText(terms.termsOfServiceText || DEFAULT_TERMS_TEXT);

    const mappedIds =
      terms.portfolios
        ?.map((p) => {
          const match = userPortfolios.find(
            (up) => String(up.portfolioId) === String(p.id),
          );
          return match ? String(match.portfolioId) : null;
        })
        .filter(Boolean) || [];

    setSelectedPortfolioIds(mappedIds);
  };

  const togglePortfolioSelection = (portfolioId) => {
    setSelectedPortfolioIds((prev) =>
      prev.includes(portfolioId)
        ? prev.filter((id) => id !== portfolioId)
        : [...prev, portfolioId],
    );
  };

  const buildPortfoliosPayload = () => {
    return selectedPortfolioIds
      .map((id) => {
        const p = userPortfolios.find(
          (up) => String(up.portfolioId) === String(id),
        );
        if (!p) return null;
        const modelName = portfolioTypeToModelName[p.portfolioType];
        if (!modelName) return null;
        return {
          id,
          type: modelName,
        };
      })
      .filter(Boolean);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a name for this terms of service");
      return;
    }

    const portfoliosPayload = buildPortfoliosPayload();

    const selectedIdSet = new Set(selectedPortfolioIds.map(String));
    const conflicting = termsList.filter(
      (t) =>
        t._id !== selectedTermsId &&
        (t.portfolios || []).some((ref) => selectedIdSet.has(String(ref.id))),
    );
    if (conflicting.length > 0) {
      toast.info(
        `Saving will replace the terms of service for ${conflicting.length} portfolio(s) that are already linked to another.`,
      );
    }

    const payload = {
      name: name.trim(),
      termsOfServiceText: text,
      portfolios: portfoliosPayload,
    };

    setSaving(true);
    try {
      let res;
      if (selectedTermsId) {
        res = await axiosAuth.patch(
          `/api/legal/terms-of-service/${selectedTermsId}`,
          payload,
        );
        setTermsList((prev) =>
          prev.map((t) => (t._id === selectedTermsId ? res.data : t)),
        );
      } else {
        res = await axiosAuth.post("/api/legal/terms-of-service", payload);
        setTermsList((prev) => [...prev, res.data]);
        setSelectedTermsId(res.data._id);
      }
      toast.success("Terms of service saved");
    } catch (err) {
      console.error("Failed to save terms of service", err);
      toast.error(
        err.response?.data?.message || "Failed to save terms of service",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTermsId) return;
    if (!window.confirm("Delete this terms of service?")) return;

    setDeleting(true);
    try {
      await axiosAuth.delete(`/api/legal/terms-of-service/${selectedTermsId}`);
      setTermsList((prev) =>
        prev.filter((t) => t._id !== selectedTermsId),
      );
      resetForm();
      toast.success("Terms of service deleted");
    } catch (err) {
      console.error("Failed to delete terms of service", err);
      toast.error(
        err.response?.data?.message || "Failed to delete terms of service",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
            Terms of Service
          </h3>
          <button
            type="button"
            onClick={resetForm}
            className="text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            New
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-neutral-400">Loading...</div>
        ) : termsList.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-neutral-400">
            No terms of service yet. Create your first one.
          </div>
        ) : (
          <ul className="space-y-2">
            {termsList.map((terms) => (
              <li key={terms._id}>
                <button
                  type="button"
                  onClick={() => handleSelectTerms(terms)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition ${
                    selectedTermsId === terms._id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200"
                      : "border-gray-200 dark:border-neutral-600 hover:border-gray-300 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="font-medium truncate">
                    {terms.name || "Untitled Terms"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-neutral-500">
                    {(terms.portfolios?.length || 0) > 0
                      ? `${terms.portfolios.length} linked portfolio(s)`
                      : "No portfolios linked"}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex-1 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              {selectedTermsId ? "Edit Terms of Service" : "Create Terms of Service"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Name your terms, customize the text, and link it to one or more
              of your portfolios.
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Terms Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-500 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Default Portfolio Terms"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Terms of Service Text
            </label>
            <textarea
              className="w-full min-h-[220px] rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm leading-relaxed text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
              Customize the terms to fit your portfolio. This is not legal advice.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Link to Portfolios
            </label>
            {userPortfolios.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                You do not have any portfolios yet. Once you create portfolios,
                you can link them here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {userPortfolios.map((p) => {
                  const id = String(p.portfolioId);
                  const checked = selectedPortfolioIds.includes(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
                        checked
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200"
                          : "border-gray-200 dark:border-neutral-600 hover:border-gray-300 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-neutral-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-neutral-500 dark:bg-neutral-800 text-blue-600 focus:ring-blue-500"
                        checked={checked}
                        onChange={() => togglePortfolioSelection(id)}
                      />
                      <span className="truncate">
                        {p.portfolioType} – {p.portfolioId}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex gap-3">
              {selectedTermsId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : selectedTermsId
                  ? "Save Changes"
                  : "Create Terms"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
