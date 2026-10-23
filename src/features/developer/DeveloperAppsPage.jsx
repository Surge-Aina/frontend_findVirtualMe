import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import DeveloperPage from "./DeveloperPage";
import SecretRevealModal from "./SecretRevealModal";
import {
  API_KEY_SCOPES,
  apiErrorMessage,
  formatWhen,
  listDeveloperApps,
  logApiFailure,
  registerDeveloperApp,
} from "./developerApi";

const SECRET_WARNING =
  "The client secret is shown once. Copy it now. FindVirtualMe stores only a hash and cannot show it again.";

function parseRedirectUris(value) {
  return value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function DeveloperAppsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectText, setRedirectText] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [scopes, setScopes] = useState(["sites:read"]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [revealed, setRevealed] = useState(null);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      setApps(await listDeveloperApps());
    } catch (err) {
      logApiFailure("developer_apps_list_failed", err);
      toast.error(apiErrorMessage(err, "Could not load your apps."));
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadApps();
  }, [token, loadApps]);

  const toggleScope = (id) => {
    setScopes((current) => (current.includes(id) ? current.filter((scope) => scope !== id) : [...current, id]));
    setFormError("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const redirectUris = parseRedirectUris(redirectText);
    if (!name.trim()) {
      setFormError("Enter an app name.");
      return;
    }
    if (redirectUris.length < 1 || redirectUris.length > 5 || redirectUris.some((uri) => !isHttpsUrl(uri))) {
      setFormError("Enter 1 to 5 public https redirect URIs.");
      return;
    }
    const orderedScopes = API_KEY_SCOPES.map((scope) => scope.id).filter((id) => scopes.includes(id));
    if (orderedScopes.length === 0) {
      setFormError("Select at least one scope.");
      return;
    }
    const trimmedWebhook = webhookUrl.trim();
    if (trimmedWebhook && !isHttpsUrl(trimmedWebhook)) {
      setFormError("The webhook URL must be https.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const result = await registerDeveloperApp({
        name: name.trim(),
        description,
        redirectUris,
        scopes: orderedScopes,
        webhookUrl: trimmedWebhook,
      });
      setName("");
      setDescription("");
      setRedirectText("");
      setWebhookUrl("");
      if (result?.clientSecret) {
        const extra = result.webhookSecret
          ? `Webhook signing secret (shown once): ${result.webhookSecret}`
          : "";
        setRevealed({
          title: "Copy your client secret",
          secret: result.clientSecret,
          note: [result.note, result.data?.clientId ? `Client id: ${result.data.clientId}` : "", extra]
            .filter(Boolean)
            .join(" "),
        });
      } else {
        toast.success("App registered.");
      }
      await loadApps();
    } catch (err) {
      logApiFailure("developer_apps_create_failed", err);
      setFormError(apiErrorMessage(err, "Could not register the app."));
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title="Build an app"
      lede="Register an app for the marketplace. It stays pending until it is approved, then other customers can install it."
      active="apps"
    >
      <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Register</h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="app-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="app-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="app-description"
              name="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="redirect-uris" className="block text-sm font-medium text-gray-700 mb-1">
              Redirect URIs
            </label>
            <textarea
              id="redirect-uris"
              name="redirectUris"
              rows={3}
              value={redirectText}
              onChange={(event) => setRedirectText(event.target.value)}
              placeholder="https://app.example.test/oauth/callback"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="app-webhook" className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL (optional)
            </label>
            <input
              id="app-webhook"
              name="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
              placeholder="https://hooks.example.test/events"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Scopes</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {API_KEY_SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={scopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{scope.label}</span>
                    <span className="block text-sm text-gray-600">{scope.description}</span>
                    <span className="block text-xs text-gray-500 mt-1">{scope.id}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Registering..." : "Register app"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-800">Your apps</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-500">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">No apps registered yet.</div>
        ) : (
          apps.map((app) => (
            <article key={app.id || app.clientId} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{app.name}</h3>
                  {app.description ? <p className="text-sm text-slate-600 mt-1">{app.description}</p> : null}
                  <p className="mt-2 text-xs text-slate-500 font-mono break-all">Client id {app.clientId}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Secret ending in <span className="font-mono">{app.secretLast4 || "••••"}</span>
                    {app.reviewStatus ? ` · ${app.reviewStatus}` : ""}
                    {app.createdAt ? ` · ${formatWhen(app.createdAt, "")}` : ""}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {(app.redirectUris || []).map((uri) => (
                  <li key={uri} className="font-mono text-xs text-slate-600 break-all">
                    {uri}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">
                {(app.scopes || []).map((scope) => (
                  <span key={scope} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                    {scope}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </section>

      {revealed ? (
        <SecretRevealModal
          title={revealed.title}
          warning={SECRET_WARNING}
          secret={revealed.secret}
          note={revealed.note}
          onClose={() => setRevealed(null)}
        />
      ) : null}
    </DeveloperPage>
  );
}
