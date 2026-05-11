import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams, Navigate } from "react-router-dom";
import { portfolioApi } from "@/shared/api/portfolioApi";
import {
  PortfolioUserProvider,
  usePortfolioUser,
} from "@/shared/context/PortfolioUserContext";
import { usePortfolio } from "@/shared/context/PortfolioContext";
import InlineAuthForm from "./InlineAuthForm";

/**
 * Root layout for the sub-user dashboard.
 *
 * Works in two modes:
 *  - Platform: `/p/:slug/my-account` — resolves portfolio from the slug param.
 *    The param may also be a MongoDB ObjectId (e.g. AccountBlock links use
 *    the portfolio's `_id`); we transparently support both.
 *  - Custom domain: `/my-account`   — relies on PortfolioContext seeded by
 *    the DomainRouter.
 */
function ResolveCustomDomain({ children }) {
  const { portfolioId, portfolioType } = usePortfolio();
  if (!portfolioId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 text-gray-600 dark:text-neutral-400">
        Loading portfolio...
      </div>
    );
  }
  return (
    <PortfolioUserProvider portfolioId={portfolioId} template={portfolioType}>
      {children}
    </PortfolioUserProvider>
  );
}

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

function ResolveByIdOrSlug({ slug, children }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const looksLikeObjectId = OBJECT_ID_RE.test(slug);
    const primary = looksLikeObjectId
      ? portfolioApi.getById(slug)
      : portfolioApi.getBySlug(slug);

    primary
      .then((res) => {
        if (!cancelled) setPortfolio(res.data);
      })
      .catch(() => {
        // Fall back to the other lookup so links keep working whether they
        // carry a slug or a MongoDB _id.
        const fallback = looksLikeObjectId
          ? portfolioApi.getBySlug(slug)
          : portfolioApi.getById(slug);
        return fallback
          .then((res) => {
            if (!cancelled) setPortfolio(res.data);
          })
          .catch((err) => {
            if (!cancelled)
              setError(err?.response?.data?.error || "Portfolio not found");
          });
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 text-gray-600 dark:text-neutral-400">
        Loading portfolio...
      </div>
    );
  }
  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 text-gray-700 dark:text-neutral-300">
        {error || "This portfolio is unavailable."}
      </div>
    );
  }
  return (
    <PortfolioUserProvider
      portfolioId={portfolio._id}
      template={portfolio.template}
    >
      {children}
    </PortfolioUserProvider>
  );
}

function MyAccountChrome() {
  const { portfolioUser, logout, token } = usePortfolioUser();
  if (!token || !portfolioUser) {
    return <InlineAuthForm />;
  }

  const tabs = [
    { to: "", label: "Profile", end: true },
    { to: "history", label: "History" },
    { to: "bookings", label: "Bookings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-neutral-100">My Account</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Signed in as {portfolioUser.name || portfolioUser.email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 underline"
          >
            Sign out
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1">
          {tabs.map((t) => (
            <NavLink
              key={t.label}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? "border-blue-600 text-blue-700 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function MyAccountLayout({ mode = "platform" }) {
  const { slug } = useParams();

  if (mode === "custom-domain") {
    return (
      <ResolveCustomDomain>
        <MyAccountChrome />
      </ResolveCustomDomain>
    );
  }

  if (!slug) {
    return <Navigate to="/" replace />;
  }
  return (
    <ResolveByIdOrSlug slug={slug}>
      <MyAccountChrome />
    </ResolveByIdOrSlug>
  );
}
