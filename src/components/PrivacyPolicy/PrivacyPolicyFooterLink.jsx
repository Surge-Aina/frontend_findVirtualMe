import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { portfolioTypeToModel } from "../../utils/portfolioTypeToModel";

export default function PrivacyPolicyFooterLink({
  className = "hover:text-white transition-colors",
  label = "Privacy Policy",
}) {
  const { portfolioId, portfolioType } = usePortfolio();
  const [policy, setPolicy] = useState(null);
  const [open, setOpen] = useState(false);

  const modelType = useMemo(
    () => (portfolioType ? portfolioTypeToModel[portfolioType] : null),
    [portfolioType],
  );

  useEffect(() => {
    if (!portfolioId || !modelType) {
      setPolicy(null);
      return;
    }

    const fetchPolicy = async () => {
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
        const res = await axios.get(
          `${backendUrl}/privacy-policy/public/byPortfolio`,
          { params: { portfolioId, type: modelType } },
        );
        setPolicy(res.data || null);
      } catch (err) {
        // 404 just means none configured
        if (err.response?.status === 404) {
          setPolicy(null);
          return;
        }
        console.error("Failed to load privacy policy", err);
        setPolicy(null);
      }
    };

    fetchPolicy();
  }, [portfolioId, modelType]);

  if (!policy) return null;

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
                {policy.name || "Privacy Policy"}
              </h2>
              <p className="text-xs text-gray-500">
                How your information is collected and used.
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
          <div className="px-5 py-4 overflow-y-auto text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {policy.privacyPolicyText}
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

