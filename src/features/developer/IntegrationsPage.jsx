import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import ConfirmActionModal from "./ConfirmActionModal";
import DeveloperPage from "./DeveloperPage";
import {
  apiErrorMessage,
  formatWhen,
  listInstallations,
  listMarketplaceApps,
  logApiFailure,
  uninstallInstallation,
} from "./developerApi";

export default function IntegrationsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [installed, setInstalled] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const loadApps = useCallback(async () => {
    setLoadingApps(true);
    try {
      const [catalog, installations] = await Promise.all([listMarketplaceApps(), listInstallations()]);
      setApps(catalog);
      setInstalled(installations);
    } catch (err) {
      logApiFailure("marketplace_load_failed", err);
      toast.error(apiErrorMessage(err, "Could not load integrations."));
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadApps();
  }, [token, loadApps]);

  const askUninstall = (installation) => {
    setConfirm({
      title: "Uninstall app",
      body: `Uninstall ${installation.name || installation.slug}? It will lose access granted by this install.`,
      confirmLabel: "Uninstall",
      action: async () => {
        try {
          await uninstallInstallation(installation.id);
          toast.success("App uninstalled.");
          await loadApps();
        } catch (err) {
          logApiFailure("installation_delete_failed", err);
          throw new Error(apiErrorMessage(err, "Could not uninstall the app."));
        }
      },
    });
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title="Integrations"
      lede="Approved apps from the marketplace. Install opens the OAuth consent screen for the scopes that app requested."
      active="integrations"
      actions={
        <button
          type="button"
          onClick={() => navigate("/developer/apps")}
          className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          Build an app
        </button>
      }
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Installed</h2>
        {loadingApps ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-500">Loading...</div>
        ) : installed.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">No apps installed yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {installed.map((installation) => (
              <article key={installation.id || installation._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{installation.name || installation.slug}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(installation.scopes || []).map((scope) => (
                        <span key={scope} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                          {scope}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      Installed {formatWhen(installation.installedAt || installation.createdAt, "—")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => askUninstall({ ...installation, id: installation.id || installation._id })}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300"
                  >
                    Uninstall
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Marketplace</h2>
        {apps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">
            No apps are listed yet. Apps appear here after they are approved in the catalog.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {apps.map((app) => (
              <button
                key={app.slug}
                type="button"
                onClick={() => navigate(`/integrations/apps/${app.slug}`)}
                className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow"
              >
                <div className="font-semibold text-slate-800 mb-2">{app.name}</div>
                <div className="text-slate-600 text-sm">{app.summary}</div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(app.scopes || []).map((scope) => (
                    <span key={scope} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                      {scope}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {confirm ? (
        <ConfirmActionModal
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.action}
          onClose={() => setConfirm(null)}
        />
      ) : null}
    </DeveloperPage>
  );
}
