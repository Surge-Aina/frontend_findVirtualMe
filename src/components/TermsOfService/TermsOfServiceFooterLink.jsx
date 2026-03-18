import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { usePortfolio } from "../../context/PortfolioContext";
import { portfolioTypeToModel } from "../../utils/portfolioTypeToModel";

export default function TermsOfServiceFooterLink({
  className = "hover:text-white transition-colors",
  label = "Terms of Service",
}) {
  const { portfolioId, portfolioType } = usePortfolio();
  const [terms, setTerms] = useState(null);
  const [open, setOpen] = useState(false);

  const modelType = useMemo(
    () => (portfolioType ? portfolioTypeToModel[portfolioType] : null),
    [portfolioType],
  );

  useEffect(() => {
    if (!portfolioId || !modelType) {
      setTerms(null);
      return;
    }

    const fetchTerms = async () => {
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_API || "http://localhost:5000";
        const res = await axios.get(
          `${backendUrl}/terms-of-service/public/byPortfolio`,
          { params: { portfolioId, type: modelType } },
        );
        setTerms(res.data || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setTerms(null);
          return;
        }
        console.error("Failed to load terms of service", err);
        setTerms(null);
      }
    };

    fetchTerms();
  }, [portfolioId, modelType]);

  if (!terms) return null;

  const modal = open ? (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-8 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        <div className="w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <h2
                id="terms-modal-title"
                className="text-base font-semibold text-gray-900"
              >
                {terms.name || "Terms of Service"}
              </h2>
              <p className="text-xs text-gray-500">
                Terms and conditions for using this portfolio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close terms of service"
            >
              Close
            </button>
          </div>
          <div className="px-5 py-4 overflow-y-auto text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {terms.termsOfServiceText}
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
        aria-label={`View ${label}`}
      >
        {label}
      </button>

      {open ? createPortal(modal, document.body) : null}
    </>
  );
}
