import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { usePortfolio } from "@/shared/context/PortfolioContext";
import { portfolioTypeToModel } from "@/shared/utils/portfolioTypeToModel";
import {
  PLATFORM_TERMS_OF_SERVICE_TEXT,
} from "@/shared/legal/platformLegalContent";

export default function TermsOfServiceFooterLink({
  className = "hover:text-white transition-colors",
  label = "Terms of Service",
}) {
  const { portfolioId, portfolioType } = usePortfolio();
  const [terms, setTerms] = useState(null);
  const [open, setOpen] = useState(false);
  const [userTermsError, setUserTermsError] = useState("");
  const [loadingUserTerms, setLoadingUserTerms] = useState(false);

  const modelType = useMemo(
    () => (portfolioType ? portfolioTypeToModel[portfolioType] : null),
    [portfolioType],
  );

  useEffect(() => {
    setUserTermsError("");
    if (!portfolioId || !modelType) {
      setTerms(null);
      return;
    }

    const fetchTerms = async () => {
      setLoadingUserTerms(true);
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
        setUserTermsError(
          "Portfolio-specific terms of service could not be loaded.",
        );
      } finally {
        setLoadingUserTerms(false);
      }
    };

    fetchTerms();
  }, [portfolioId, modelType]);

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
                Terms of Service
              </h2>
              <p className="text-xs text-gray-500">
                FindVirtual.me and your portfolio.
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
          <div className="px-5 py-4 overflow-y-auto text-sm leading-relaxed text-gray-800 space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                FindVirtual.me
              </h3>
              <div className="whitespace-pre-wrap">{PLATFORM_TERMS_OF_SERVICE_TEXT}</div>
            </section>

            {terms && (
              <section className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Your portfolio
                  {terms.name ? (
                    <span className="font-normal text-gray-600">
                      {" "}
                      — {terms.name}
                    </span>
                  ) : null}
                </h3>
                <div className="whitespace-pre-wrap">
                  {terms.termsOfServiceText}
                </div>
              </section>
            )}

            {loadingUserTerms && !terms && portfolioId && modelType && (
              <p className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                Loading portfolio-specific terms…
              </p>
            )}

            {userTermsError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {userTermsError}
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
        aria-label={`View ${label}`}
      >
        {label}
      </button>

      {open ? createPortal(modal, document.body) : null}
    </>
  );
}
