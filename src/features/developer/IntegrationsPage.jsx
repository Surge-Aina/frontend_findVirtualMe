import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import ConfirmActionModal from "./ConfirmActionModal";
import DeveloperPage from "./DeveloperPage";
import SecretRevealModal from "./SecretRevealModal";
import {
  apiErrorMessage,
  disconnectWalletMe,
  formatWhen,
  getWalletMeConnection,
  getWebhookSettings,
  isMissingFeature,
  listWebhookDeliveries,
  logApiFailure,
  rotateWebhookSecret,
  saveWalletMeKey,
  saveWebhookEndpoint,
} from "./developerApi";

const EMPTY_CONNECTION = { connected: false, last4: null, updatedAt: null };
const WEBHOOK_SECRET_WARNING =
  "This signing secret is shown once. Copy it now. FindVirtualMe signs lead.captured deliveries with it and cannot show it again.";

function isHttpsEndpoint(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "http:" && local;
  } catch {
    return false;
  }
}

function deliveryStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "succeeded" || value === "success" || value === "delivered") {
    return "bg-green-100 text-green-800";
  }
  if (value === "failed" || value === "failure") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

export default function IntegrationsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [connection, setConnection] = useState(EMPTY_CONNECTION);
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [draft, setDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [confirm, setConfirm] = useState(null);

  const [webhooksAvailable, setWebhooksAvailable] = useState(false);
  const [webhookError, setWebhookError] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [secretLast4, setSecretLast4] = useState(null);
  const [events, setEvents] = useState(["lead.captured"]);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [savingEndpoint, setSavingEndpoint] = useState(false);
  const [endpointError, setEndpointError] = useState("");
  const [revealed, setRevealed] = useState(null);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const applyWebhookSettings = (settings) => {
    setEndpointUrl(settings.endpointUrl || "");
    setSecretLast4(settings.secretLast4 || null);
    setEvents(settings.events?.length ? settings.events : ["lead.captured"]);
  };

  const loadDeliveries = useCallback(async () => {
    setLoadingDeliveries(true);
    try {
      const rows = await listWebhookDeliveries();
      setDeliveries(rows);
    } catch (err) {
      if (isMissingFeature(err)) {
        setDeliveries([]);
        return;
      }
      logApiFailure("webhooks_deliveries_failed", err);
      toast.error(apiErrorMessage(err, "Could not load webhook deliveries."));
    } finally {
      setLoadingDeliveries(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoadingConnection(true);
    setWebhookError("");
    try {
      const next = await getWalletMeConnection();
      setConnection(next);
    } catch (err) {
      if (!isMissingFeature(err)) {
        logApiFailure("walletme_status_failed", err);
        toast.error(apiErrorMessage(err, "Could not load WalletMe status."));
      }
      setConnection(EMPTY_CONNECTION);
    } finally {
      setLoadingConnection(false);
    }

    try {
      const settings = await getWebhookSettings();
      setWebhooksAvailable(true);
      applyWebhookSettings(settings);
      await loadDeliveries();
    } catch (err) {
      if (isMissingFeature(err)) {
        setWebhooksAvailable(false);
        return;
      }
      logApiFailure("webhooks_settings_failed", err);
      setWebhooksAvailable(true);
      setWebhookError(apiErrorMessage(err, "Could not load webhook settings."));
    }
  }, [loadDeliveries]);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, load]);

  const handleSaveKey = async (event) => {
    event.preventDefault();
    const apiKey = draft.trim();
    if (!apiKey) {
      setKeyError("Paste a WalletMe API key to connect.");
      return;
    }
    if (apiKey.length > 512) {
      setKeyError("That key is too long.");
      return;
    }
    setSavingKey(true);
    setKeyError("");
    try {
      const saved = await saveWalletMeKey(apiKey);
      setDraft("");
      setShowKey(false);
      setConnection(saved);
      toast.success(saved.last4 ? "WalletMe connected." : "WalletMe key saved.");
    } catch (err) {
      logApiFailure("walletme_save_failed", err);
      if (isMissingFeature(err)) {
        setKeyError("WalletMe key storage is not available on this server yet.");
      } else {
        setKeyError(apiErrorMessage(err, "Could not save the WalletMe key."));
      }
    } finally {
      setSavingKey(false);
    }
  };

  const askDisconnect = () => {
    setConfirm({
      title: "Disconnect WalletMe",
      body: "Disconnect WalletMe? The saved key is removed from this account.",
      confirmLabel: "Disconnect",
      action: async () => {
        try {
          const next = await disconnectWalletMe();
          setConnection(next);
          setDraft("");
          toast.success("WalletMe disconnected.");
        } catch (err) {
          logApiFailure("walletme_disconnect_failed", err);
          throw new Error(apiErrorMessage(err, "Could not disconnect WalletMe."));
        }
      },
    });
  };

  const revealSecret = (result, title) => {
    const secret = result?.secret || result?.signingSecret;
    if (!secret) return false;
    const data = result?.data || {};
    if (data.secretLast4 || data.last4) setSecretLast4(data.secretLast4 || data.last4);
    if (data.endpointUrl) setEndpointUrl(data.endpointUrl);
    setRevealed({ title, secret, note: result.note || "" });
    return true;
  };

  const handleSaveEndpoint = async (event) => {
    event.preventDefault();
    const nextUrl = endpointUrl.trim();
    if (!isHttpsEndpoint(nextUrl)) {
      setEndpointError("Enter an https endpoint URL.");
      return;
    }
    setSavingEndpoint(true);
    setEndpointError("");
    try {
      const result = await saveWebhookEndpoint(nextUrl);
      const data = result?.data || {};
      setEndpointUrl(data.endpointUrl || nextUrl);
      if (data.secretLast4 || data.last4) setSecretLast4(data.secretLast4 || data.last4);
      if (!revealSecret(result, "Copy your webhook signing secret")) {
        toast.success("Webhook endpoint saved.");
      }
      await loadDeliveries();
    } catch (err) {
      logApiFailure("webhooks_save_failed", err);
      setEndpointError(apiErrorMessage(err, "Could not save the webhook endpoint."));
    } finally {
      setSavingEndpoint(false);
    }
  };

  const askRotateSecret = () => {
    setConfirm({
      title: "Rotate signing secret",
      body: "Rotate the webhook signing secret? The current secret stops verifying deliveries. The new secret is shown once.",
      confirmLabel: "Rotate secret",
      action: async () => {
        try {
          const result = await rotateWebhookSecret();
          if (!revealSecret(result, "Copy your new webhook signing secret")) {
            throw new Error("The server did not return a new signing secret.");
          }
        } catch (err) {
          if (err?.message && !err?.response) throw err;
          logApiFailure("webhooks_rotate_failed", err);
          throw new Error(apiErrorMessage(err, "Could not rotate the signing secret."));
        }
      },
    });
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title="Integrations"
      lede="Connect apps that use your FindVirtualMe account. More apps will be added to this grid."
      active="integrations"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <article className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-xl font-semibold text-slate-800">WalletMe</h2>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                connection.connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {connection.connected ? "Connected" : "Not connected"}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Paste a WalletMe API key so FindVirtualMe can call WalletMe for you. The key is stored encrypted. Only the
            last 4 characters are shown after you save it.
          </p>
          {loadingConnection ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : (
            <>
              {connection.connected ? (
                <p className="text-sm text-slate-700 mb-4">
                  Key ending in{" "}
                  <span className="font-mono">{connection.last4 ? connection.last4 : "••••"}</span>
                  {connection.updatedAt ? ` · Updated ${formatWhen(connection.updatedAt, "")}` : ""}
                </p>
              ) : (
                <p className="text-sm text-slate-500 mb-4">No WalletMe key saved.</p>
              )}
              <form className="space-y-3" onSubmit={handleSaveKey}>
                <label htmlFor="walletme-api-key" className="block text-sm font-medium text-gray-700">
                  WalletMe API key
                </label>
                <div className="flex gap-2">
                  <input
                    id="walletme-api-key"
                    name="walletme-api-key"
                    type={showKey ? "text" : "password"}
                    autoComplete="off"
                    spellCheck={false}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setKeyError("");
                    }}
                    placeholder="Paste your WalletMe API key"
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((value) => !value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                {keyError ? <p className="text-sm text-red-500">{keyError}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingKey}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {savingKey ? "Saving..." : connection.connected ? "Replace key" : "Connect"}
                  </button>
                  {connection.connected ? (
                    <button
                      type="button"
                      onClick={askDisconnect}
                      className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300"
                    >
                      Disconnect
                    </button>
                  ) : null}
                </div>
              </form>
            </>
          )}
        </article>
      </div>

      {webhooksAvailable ? (
        <section className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Webhooks</h2>
            <p className="text-gray-600 text-sm mt-1">
              FindVirtualMe sends a signed <span className="font-mono">lead.captured</span> event to your endpoint.
              The signing secret is shown once.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {events.map((eventName) => (
                <span key={eventName} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                  {eventName}
                </span>
              ))}
            </div>
          </div>

          {webhookError ? <p className="text-sm text-red-500">{webhookError}</p> : null}

          <form className="space-y-3" onSubmit={handleSaveEndpoint}>
            <label htmlFor="webhook-endpoint" className="block text-sm font-medium text-gray-700">
              Endpoint URL
            </label>
            <input
              id="webhook-endpoint"
              name="endpointUrl"
              type="url"
              value={endpointUrl}
              onChange={(event) => {
                setEndpointUrl(event.target.value);
                setEndpointError("");
              }}
              placeholder="https://example.com/hooks/findvirtualme"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {secretLast4 ? (
              <p className="text-sm text-slate-600">
                Signing secret ending in <span className="font-mono">{secretLast4}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">A signing secret is issued when you save an endpoint.</p>
            )}
            {endpointError ? <p className="text-sm text-red-500">{endpointError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={savingEndpoint}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingEndpoint ? "Saving..." : "Save endpoint"}
              </button>
              {secretLast4 ? (
                <button
                  type="button"
                  onClick={askRotateSecret}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Rotate secret
                </button>
              ) : null}
            </div>
          </form>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent deliveries</h3>
            {loadingDeliveries ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : deliveries.length === 0 ? (
              <p className="text-slate-500 text-sm">No deliveries yet.</p>
            ) : (
              <div className="space-y-3">
                {deliveries.map((row) => {
                  const id = row.id || row.eventId;
                  const type = row.type || row.event || "lead.captured";
                  const status = row.status || "pending";
                  return (
                    <div key={id || `${type}-${row.createdAt}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-slate-700">{id || "Delivery"}</span>
                        <span className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">{type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${deliveryStatusClass(status)}`}>{status}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        {formatWhen(row.createdAt, "—")}
                        {row.responseStatus ? ` · HTTP ${row.responseStatus}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {revealed ? (
        <SecretRevealModal
          title={revealed.title}
          warning={WEBHOOK_SECRET_WARNING}
          secret={revealed.secret}
          note={revealed.note}
          onClose={() => setRevealed(null)}
        />
      ) : null}
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
