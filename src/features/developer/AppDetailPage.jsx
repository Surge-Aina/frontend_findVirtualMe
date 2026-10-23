import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import DeveloperPage from "./DeveloperPage";
import {
  apiErrorMessage,
  listInstallations,
  listMarketplaceApps,
  logApiFailure,
  scopeLabel,
} from "./developerApi";

export default function AppDetailPage() {
  const { slug } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [installation, setInstallation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installError, setInstallError] = useState("");

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [catalog, installations] = await Promise.all([listMarketplaceApps(), listInstallations()]);
        if (cancelled) return;
        const match = catalog.find((item) => item.slug === slug) || null;
        setApp(match);
        setInstallation(installations.find((item) => item.slug === slug) || null);
      } catch (err) {
        if (!cancelled) {
          logApiFailure("app_detail_failed", err);
          toast.error(apiErrorMessage(err, "Could not load this app."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, slug]);

  const handleInstall = () => {
    if (!app?.clientId) {
      setInstallError("This catalog app has no client id, so install cannot start.");
      return;
    }
    if (!app.redirectUris?.length) {
      setInstallError("This catalog app has no https redirect URI, so install cannot start.");
      return;
    }
    const params = new URLSearchParams({
      client_id: app.clientId,
      client_name: app.name,
      scope: (app.scopes || []).join(" "),
      response_type: "code",
      redirect_uri: app.redirectUris[0],
    });
    if (app.redirectUris.length > 1) params.set("redirect_uris", app.redirectUris.join(" "));
    navigate(`/oauth/consent?${params.toString()}`);
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title={app?.name || "App"}
      lede={app?.summary || "Install an app to grant the scopes it requests."}
      active="integrations"
    >
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-slate-500">Loading...</div>
      ) : !app ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">This app is not in the marketplace.</div>
      ) : (
        <>
          <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Requested scopes</h2>
            <p className="text-sm text-gray-600 mb-4">
              Install opens the consent screen. Approval lets {app.name} use these scopes on your account.
            </p>
            <ul className="space-y-3 mb-6">
              {(app.scopes || []).map((scope) => (
                <li key={scope} className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{scopeLabel(scope)}</div>
                  <div className="text-xs text-gray-500 mt-1">{scope}</div>
                </li>
              ))}
            </ul>
            {installation ? (
              <p className="text-sm text-green-700">Installed on this account.</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Install
                </button>
                {installError ? <p className="mt-3 text-sm text-red-500">{installError}</p> : null}
              </>
            )}
          </section>
        </>
      )}
    </DeveloperPage>
  );
}
