import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";
import FvMark from "@/shared/components/FvMark";
import { safeReturnPath } from "@/shared/utils/safeReturnPath";
import {
  apiErrorMessage,
  authorizeOAuthInstall,
  authorizeRedirectTarget,
  createPkcePair,
  followBrowserRedirect,
  listConsentSites,
  listMarketplaceApps,
  logApiFailure,
  scopeLabel,
} from "./developerApi";

function rememberReturn(path) {
  const safe = safeReturnPath(path);
  if (!safe) return;
  sessionStorage.setItem(
    "postLoginPath",
    JSON.stringify({ path: safe, exp: Date.now() + 10 * 60 * 1000 })
  );
}

function parseScopes(params) {
  const raw = params.get("scope") || params.get("scopes") || "";
  return raw
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.includes(":"));
}

function redirectChoices(params) {
  const primary = params.get("redirect_uri") || params.get("redirectUri") || "";
  const extra = (params.get("redirect_uris") || "")
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return [primary, ...extra].filter(Boolean);
}

function httpsUriList(values) {
  const out = [];
  for (const value of values) {
    const target = authorizeRedirectTarget(value, value);
    if (target && !out.includes(target)) out.push(target);
  }
  return out;
}

export default function OAuthConsentPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState("");
  const [redirectChoice, setRedirectChoice] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [registeredRedirects, setRegisteredRedirects] = useState(null);

  const clientId = params.get("client_id") || params.get("clientId") || "";
  const state = params.get("state") || "";
  const codeChallenge = params.get("code_challenge") || "";
  const scopes = useMemo(() => parseScopes(params), [params]);
  const queryRedirects = useMemo(() => httpsUriList(redirectChoices(params)), [params]);
  const redirects = registeredRedirects?.length ? registeredRedirects : queryRedirects;
  const redirectUri = redirects.includes(redirectChoice) ? redirectChoice : redirects[0] || "";
  const appName = catalogName || "This app";

  useEffect(() => {
    if (token) return;
    rememberReturn(`${location.pathname}${location.search}`);
  }, [token, location.pathname, location.search]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [rows, apps] = await Promise.all([listConsentSites(), listMarketplaceApps()]);
        if (cancelled) return;
        setSites(rows);
        if (rows[0]?.id) setSiteId(rows[0].id);
        const match = apps.find((app) => app.clientId && app.clientId === clientId);
        setCatalogName(match?.name || "");
        const pinned = httpsUriList(match?.redirectUris || []);
        if (pinned.length) setRegisteredRedirects(pinned);
      } catch (err) {
        if (!cancelled) {
          logApiFailure("oauth_sites_failed", err);
          setError(apiErrorMessage(err, "Could not load sites for this account."));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, clientId]);

  const deny = () => {
    navigate("/integrations");
  };

  const allow = async () => {
    if (!token) return;
    if (!clientId || !redirectUri || !siteId) {
      setError("Choose a site and a registered redirect URI.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const challenge = codeChallenge || (await createPkcePair()).challenge;
      const payload = await authorizeOAuthInstall({
        clientId,
        redirectUri,
        scope: scopes.join(" "),
        state,
        siteId,
        codeChallenge: challenge,
      });
      const target = authorizeRedirectTarget(payload.redirect_url || payload.redirectUrl, redirectUri);
      if (target) {
        followBrowserRedirect(target);
        return;
      }
      setError("The app did not return the redirect URI that was validated.");
      setPending(false);
    } catch (err) {
      logApiFailure("oauth_authorize_failed", err);
      setError(apiErrorMessage(err, "Could not complete this consent decision."));
      setPending(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-lg mx-auto bg-white border border-slate-300 rounded-2xl shadow-2xl px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <FvMark />
            <h1 className="text-2xl font-semibold text-slate-800">Sign in required</h1>
          </div>
          <p className="text-sm text-slate-600">
            Sign in with the header button before reviewing this request. Allow stays unavailable until you are signed
            in, and you return to this screen afterward.
          </p>
          {clientId ? (
            <p className="mt-4 text-sm text-slate-700 break-all">
              Client <span className="font-mono">{clientId}</span>
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="max-w-lg mx-auto bg-white border border-slate-300 rounded-2xl shadow-2xl px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FvMark />
          <h1 className="text-2xl font-semibold text-slate-800">Allow access</h1>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{appName}</span>
          {clientId ? <span className="font-mono"> ({clientId})</span> : null} is asking to use your FindVirtualMe
          account. Allow calls <span className="font-mono">POST /api/oauth/authorize</span> and sends the browser to
          the redirect URI returned by that call.
        </p>
        <h2 className="text-sm font-medium text-gray-700 mt-6 mb-2">Requested scopes</h2>
        {scopes.length === 0 ? (
          <p className="text-sm text-slate-500">No scopes were requested.</p>
        ) : (
          <ul className="space-y-2">
            {scopes.map((scope) => (
              <li key={scope} className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{scopeLabel(scope)}</div>
                <div className="text-xs text-gray-500 mt-1">{scope}</div>
              </li>
            ))}
          </ul>
        )}
        <label htmlFor="consent-site" className="block text-sm font-medium text-gray-700 mt-6 mb-1">
          Site
        </label>
        <select
          id="consent-site"
          value={siteId}
          onChange={(event) => setSiteId(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900"
        >
          {sites.length === 0 ? <option value="">No sites on this account</option> : null}
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.title || site.slug || site.id}
            </option>
          ))}
        </select>
        {redirects.length > 1 ? (
          <>
            <label htmlFor="consent-redirect" className="block text-sm font-medium text-gray-700 mt-4 mb-1">
              Redirect URI
            </label>
            <select
              id="consent-redirect"
              value={redirectUri}
              onChange={(event) => setRedirectChoice(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900"
            >
              {redirects.map((uri) => (
                <option key={uri} value={uri}>
                  {uri}
                </option>
              ))}
            </select>
          </>
        ) : redirectUri ? (
          <p className="mt-4 text-xs text-slate-500 break-all">Returns to {redirectUri}</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={deny}
            disabled={pending}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={allow}
            disabled={pending || scopes.length === 0 || !siteId}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {pending ? "Working..." : "Allow"}
          </button>
        </div>
      </div>
    </main>
  );
}
