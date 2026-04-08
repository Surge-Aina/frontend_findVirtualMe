import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { portfolioTypeToModel } from "../../utils/portfolioTypeToModel";
import PlatformPrivacyPolicyEmbed from "../../legal/PlatformPrivacyPolicyEmbed";

export default function PrivacyPolicyFooterLink({
  className = "hover:text-white transition-colors",
  label = "Privacy Policy",
}) {
  const { portfolioId, portfolioType } = usePortfolio();
  const [policy, setPolicy] = useState(null);
  const [open, setOpen] = useState(false);
  const [userPolicyError, setUserPolicyError] = useState("");
  const [loadingUserPolicy, setLoadingUserPolicy] = useState(false);

  const modelType = useMemo(
    () => (portfolioType ? portfolioTypeToModel[portfolioType] : null),
    [portfolioType],
  );

  useEffect(() => {
    setUserPolicyError("");
    if (!portfolioId || !modelType) {
      setPolicy(null);
      return;
    }

    const fetchPolicy = async () => {
      setLoadingUserPolicy(true);
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
        const res = await axios.get(
          `${backendUrl}/privacy-policy/public/byPortfolio`,
          { params: { portfolioId, type: modelType } },
        );
        setPolicy(res.data || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setPolicy(null);
          return;
        }
        console.error("Failed to load privacy policy", err);
        setPolicy(null);
        setUserPolicyError(
          "Portfolio-specific privacy policy could not be loaded.",
        );
      } finally {
        setLoadingUserPolicy(false);
      }
    };

    fetchPolicy();
  }, [portfolioId, modelType]);

  const modal = open ? (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Privacy Policy
              </h2>
              <p className="text-xs text-gray-500">
                FindVirtual.me and your portfolio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded-md hover:bg-gray-100"
            >
              Close
            </button>
          </div>
          <div className="px-5 py-4 overflow-y-auto text-sm leading-relaxed text-gray-800 space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                FindVirtual.me
              </h3>
              <PlatformPrivacyPolicyEmbed minHeight="min-h-[50vh]" />
            </section>

            {policy && (
              <section className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Your portfolio
                  {policy.name ? (
                    <span className="font-normal text-gray-600">
                      {" "}
                      — {policy.name}
                    </span>
                  ) : null}
                </h3>
                <div className="whitespace-pre-wrap">
                  {policy.privacyPolicyText}
                </div>
              </section>
            )}

            {loadingUserPolicy && !policy && portfolioId && modelType && (
              <p className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                Loading portfolio-specific policy…
              </p>
            )}

            {userPolicyError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {userPolicyError}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>

      {open ? createPortal(modal, document.body) : null}
    </>
  );
}
