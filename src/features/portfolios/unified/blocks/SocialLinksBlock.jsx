import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Github, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { usePortfolioView } from "../context/PortfolioViewContext";
import { sanitizeHttpHref } from "./featureUrlUtils";

const PLATFORM_META = {
  github: { label: "GitHub", Icon: Github },
  twitter: { label: "Twitter", Icon: Twitter },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
  instagram: { label: "Instagram", Icon: Instagram },
  website: { label: "Website", Icon: Globe },
};

const DEFAULT_PLATFORMS = Object.freeze({
  github: true,
  twitter: true,
  linkedin: true,
  instagram: false,
  website: true,
});

function normalizePlatforms(platforms = {}) {
  const out = { ...DEFAULT_PLATFORMS };
  for (const key of Object.keys(PLATFORM_META)) {
    if (platforms[key] === true || platforms[key] === false) {
      out[key] = platforms[key];
    }
  }
  return out;
}

export default function SocialLinksBlock({ template, ...data }) {
  const ctx = usePortfolioView();
  const portfolioId = ctx?.portfolioId;
  const fallbackLinks = ctx?.socialLinks || {};
  const [remoteLinks, setRemoteLinks] = useState(null);
  const [loading, setLoading] = useState(Boolean(portfolioId));

  const platforms = useMemo(
    () => normalizePlatforms(data.platforms || data.showPlatforms),
    [data.platforms, data.showPlatforms]
  );

  const title = data.sectionTitle || data.title || "Connect";

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const base = import.meta.env.VITE_BACKEND_API || "";
    axios
      .get(`${base}/api/social-links/${portfolioId}`)
      .then((res) => {
        if (!cancelled) setRemoteLinks(res.data?.links || {});
      })
      .catch(() => {
        if (!cancelled) setRemoteLinks(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  const linkMap = remoteLinks && typeof remoteLinks === "object" ? remoteLinks : fallbackLinks;

  const entries = Object.keys(PLATFORM_META)
    .filter((key) => platforms[key])
    .map((key) => {
      const raw = linkMap?.[key];
      const href = sanitizeHttpHref(raw);
      return href ? { key, href, ...PLATFORM_META[key] } : null;
    })
    .filter(Boolean);

  if (!loading && entries.length === 0) return null;

  const isPM = template === "projectManager" || template === "dataScientist" || template === "agent";
  const sectionClass = isPM ? "py-12 bg-slate-800/40" : "py-12 bg-gray-50";

  return (
    <section className={sectionClass} data-testid="social-links-block">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading links…</p>
        ) : (
          <ul className="flex flex-wrap justify-center gap-4">
            {entries.map(({ key, href, label, Icon }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:border-blue-300 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}