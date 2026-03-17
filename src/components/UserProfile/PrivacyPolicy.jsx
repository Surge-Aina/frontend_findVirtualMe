import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";
import { toast } from "react-toastify";

const DEFAULT_PRIVACY_TEXT = `
This Privacy Policy explains how we collect, use, and protect your information when you interact with this portfolio.

We may collect basic contact details that you voluntarily provide (such as name, email address, or phone number) in order to respond to your inquiries or provide requested services.

We do not sell your personal information. Data is only shared when necessary to operate this site, comply with the law, or protect our rights.

You may request access to, correction of, or deletion of your personal information by contacting us using the details provided in this portfolio.

By using this portfolio, you consent to this Privacy Policy. We may update this policy from time to time, and any changes will be reflected on this page.
`.trim();

const portfolioTypeToModelName = {
  Handyman: "HandymanMainPortfolio",
  ProjectManager: "ProjectManagerPortfolio",
  LocalVendor: "LocalVendorPortfolio",
  CleaningLady: "CleaningPortfolio",
  Healthcare: "HealthcarePortfolio",
};

export default function PrivacyPolicy() {
  const { user } = useContext(AuthContext);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [name, setName] = useState("");
  const [text, setText] = useState(DEFAULT_PRIVACY_TEXT);
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState([]);

  const userPortfolios = user?.portfolios || [];

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get("/privacy-policy");
      setPolicies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load privacy policies", err);
      toast.error("Failed to load privacy policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const resetForm = () => {
    setSelectedPolicyId(null);
    setName("");
    setText(DEFAULT_PRIVACY_TEXT);
    setSelectedPortfolioIds([]);
  };

  const handleSelectPolicy = (policy) => {
    setSelectedPolicyId(policy._id);
    setName(policy.name || "");
    setText(policy.privacyPolicyText || DEFAULT_PRIVACY_TEXT);

    // Map stored portfolios back to the user's portfolioIds
    const mappedIds =
      policy.portfolios
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
      toast.error("Please provide a name for this privacy policy");
      return;
    }

    const portfoliosPayload = buildPortfoliosPayload();

    // Inform user that portfolios can only have one policy at a time.
    // Backend will enforce this by removing these portfolios from other policies.
    const selectedIdSet = new Set(selectedPortfolioIds.map(String));
    const conflicting = policies.filter(
      (p) =>
        p._id !== selectedPolicyId &&
        (p.portfolios || []).some((ref) => selectedIdSet.has(String(ref.id))),
    );
    if (conflicting.length > 0) {
      toast.info(
        `Saving will replace the privacy policy for ${conflicting.length} portfolio(s) that are already linked to another policy.`,
      );
    }

    const payload = {
      name: name.trim(),
      privacyPolicyText: text,
      portfolios: portfoliosPayload,
    };

    setSaving(true);
    try {
      let res;
      if (selectedPolicyId) {
        res = await axiosAuth.patch(
          `/privacy-policy/${selectedPolicyId}`,
          payload,
        );
        setPolicies((prev) =>
          prev.map((p) => (p._id === selectedPolicyId ? res.data : p)),
        );
      } else {
        res = await axiosAuth.post("/privacy-policy", payload);
        setPolicies((prev) => [...prev, res.data]);
        setSelectedPolicyId(res.data._id);
      }
      toast.success("Privacy policy saved");
    } catch (err) {
      console.error("Failed to save privacy policy", err);
      toast.error(
        err.response?.data?.message || "Failed to save privacy policy",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPolicyId) return;
    if (!window.confirm("Delete this privacy policy?")) return;

    setDeleting(true);
    try {
      await axiosAuth.delete(`/privacy-policy/${selectedPolicyId}`);
      setPolicies((prev) =>
        prev.filter((p) => p._id !== selectedPolicyId),
      );
      resetForm();
      toast.success("Privacy policy deleted");
    } catch (err) {
      console.error("Failed to delete privacy policy", err);
      toast.error(
        err.response?.data?.message || "Failed to delete privacy policy",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* List of policies */}
      <aside className="w-full md:w-64 border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Privacy Policies
          </h3>
          <button
            type="button"
            onClick={resetForm}
            className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            New
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : policies.length === 0 ? (
          <div className="text-sm text-gray-500">
            No privacy policies yet. Create your first one.
          </div>
        ) : (
          <ul className="space-y-2">
            {policies.map((policy) => (
              <li key={policy._id}>
                <button
                  type="button"
                  onClick={() => handleSelectPolicy(policy)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition ${
                    selectedPolicyId === policy._id
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="font-medium truncate">
                    {policy.name || "Untitled Policy"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(policy.portfolios?.length || 0) > 0
                      ? `${policy.portfolios.length} linked portfolio(s)`
                      : "No portfolios linked"}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <section className="flex-1 border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedPolicyId ? "Edit Privacy Policy" : "Create Privacy Policy"}
            </h2>
            <p className="text-sm text-gray-500">
              Name your policy, customize the text, and link it to one or more
              of your portfolios.
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Default Portfolio Privacy Policy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy Policy Text
            </label>
            <textarea
              className="w-full min-h-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">
              You can start from the default text and adjust it to fit your
              needs. This is not legal advice.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Portfolios
            </label>
            {userPortfolios.length === 0 ? (
              <p className="text-sm text-gray-500">
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
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              {selectedPolicyId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                  : selectedPolicyId
                  ? "Save Changes"
                  : "Create Policy"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

