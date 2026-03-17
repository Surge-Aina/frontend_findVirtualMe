import React, { useEffect, useState } from "react";
import axios from "axios";
import { portfolioTypeToModel } from "../../../utils/portfolioTypeToModel";

export default function PrivacyPolicyWidget({ portfolioId, portfolioType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (!portfolioId || !portfolioType) {
      setPolicy(null);
      return;
    }

    const modelType = portfolioTypeToModel[portfolioType];
    if (!modelType) {
      setPolicy(null);
      return;
    }

    const fetchPolicy = async () => {
      setLoading(true);
      setError("");
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
        const res = await axios.get(
          `${backendUrl}/privacy-policy/public/byPortfolio`,
          {
            params: {
              portfolioId,
              type: modelType,
            },
          },
        );
        setPolicy(res.data || null);
      } catch (err) {
        // 404 just means no policy configured; hide widget
        if (err.response?.status === 404) {
          setPolicy(null);
        } else {
          console.error("Failed to load privacy policy", err);
          setError("Failed to load privacy policy");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [portfolioId, portfolioType]);

  if (!policy || error) {
    // For now, hide the widget entirely if there is no policy or an error.
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-full bg-slate-800/90 text-xs text-white shadow-md hover:bg-slate-900 transition-colors"
      >
        Privacy Policy
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-20 md:bottom-24 md:inset-x-auto md:right-6 md:w-[480px] max-h-[70vh] z-[9999]">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {policy.name || "Privacy Policy"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    How your information is collected and used.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1"
                >
                  Close
                </button>
              </div>
              <div className="px-4 py-3 overflow-y-auto text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">
                {loading ? "Loading..." : policy.privacyPolicyText}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

