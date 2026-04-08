import React, { useEffect, useState } from "react";
import axios from "axios";
import { portfolioTypeToModel } from "../../../utils/portfolioTypeToModel";
import PlatformPrivacyPolicyEmbed from "../../../legal/PlatformPrivacyPolicyEmbed";

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
        if (err.response?.status === 404) {
          setPolicy(null);
        } else {
          console.error("Failed to load privacy policy", err);
          setError("Portfolio-specific policy could not be loaded.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [portfolioId, portfolioType]);

  const modelType =
    portfolioType && portfolioTypeToModel[portfolioType]
      ? portfolioTypeToModel[portfolioType]
      : null;

  if (!portfolioId || !portfolioType || !modelType) {
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
                    Privacy Policy
                  </h2>
                  <p className="text-xs text-gray-500">
                    FindVirtual.me and your portfolio.
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
              <div className="px-4 py-3 overflow-y-auto text-xs leading-relaxed text-gray-800 space-y-6 max-h-[55vh]">
                <section>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                    FindVirtual.me
                  </h3>
                  <PlatformPrivacyPolicyEmbed minHeight="min-h-[36vh]" />
                </section>

                {policy && (
                  <section className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                      Your portfolio
                      {policy.name ? (
                        <span className="font-normal text-gray-600">
                          {" "}
                          — {policy.name}
                        </span>
                      ) : null}
                    </h3>
                    <div className="whitespace-pre-wrap">
                      {loading ? "Loading…" : policy.privacyPolicyText}
                    </div>
                  </section>
                )}

                {loading && !policy && (
                  <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                    Loading portfolio-specific policy…
                  </p>
                )}

                {error && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
