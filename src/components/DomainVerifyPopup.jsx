import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DomainVerifyPopup({
  isOpen,
  onClose,
  onVerify,
  portfolios,
  isSubmitting = false,
  initialDomain = "",
  initialPortfolio = "",
  helperText = "",
}) {
  const [domain, setDomain] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDomain(initialDomain || "");
      setSelectedPortfolio(initialPortfolio || "");
    } else {
      setDomain("");
      setSelectedPortfolio("");
    }
  }, [isOpen, initialDomain, initialPortfolio]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    if (!selectedPortfolio) {
      toast.error("Please select a portfolio");
      return;
    }

    await onVerify(domain.trim(), selectedPortfolio);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Verify Domain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {helperText && (
            <p className="text-sm text-gray-600">{helperText}</p>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Domain Name
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Portfolio
            </label>
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Choose a portfolio</option>
              {Array.isArray(portfolios) && portfolios.length > 0 ? (
                portfolios.map((portfolio) => {
                  const id = portfolio._id || portfolio.id;
                  const label =
                    portfolio.title ||
                    portfolio.name ||
                    portfolio.portfolioTitle ||
                    portfolio.type ||
                    `Portfolio ${id}`;

                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>
                  No portfolios available
                </option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify DNS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
