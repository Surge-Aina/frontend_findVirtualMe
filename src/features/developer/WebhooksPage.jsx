import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import ConfirmActionModal from "./ConfirmActionModal";
import DeveloperPage from "./DeveloperPage";
import SecretRevealModal from "./SecretRevealModal";
import {
  WEBHOOK_EVENT_OPTIONS,
  apiErrorMessage,
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  formatWhen,
  listWebhookDeliveries,
  listWebhookEndpoints,
  logApiFailure,
  rotateWebhookSecret,
  sendWebhookTest,
} from "./developerApi";

const SECRET_WARNING =
  "This signing secret is shown once. Copy it now. FindVirtualMe signs each delivery with it and cannot show it again.";

function isHttpsEndpoint(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function WebhooksPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState(["lead.captured"]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deliveries, setDeliveries] = useState({});
  const [openLog, setOpenLog] = useState("");

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const loadEndpoints = useCallback(async () => {
    setLoading(true);
    try {
      setEndpoints(await listWebhookEndpoints());
    } catch (err) {
      logApiFailure("webhooks_list_failed", err);
      toast.error(apiErrorMessage(err, "Could not load webhook endpoints."));
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadEndpoints();
  }, [token, loadEndpoints]);

  const toggleEvent = (id) => {
    setEvents((current) => (current.includes(id) ? current.filter((event) => event !== id) : [...current, id]));
    setFormError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const nextUrl = url.trim();
    if (!isHttpsEndpoint(nextUrl)) {
      setFormError("Enter a public https endpoint URL.");
      return;
    }
    const ordered = WEBHOOK_EVENT_OPTIONS.map((item) => item.id).filter((id) => events.includes(id));
    if (ordered.length === 0) {
      setFormError("Select at least one event.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const result = await createWebhookEndpoint({ url: nextUrl, events: ordered });
      setUrl("");
      if (result?.secret) {
        setRevealed({
          title: "Copy your webhook signing secret",
          secret: result.secret,
          note: result.note || "",
        });
      } else {
        toast.success("Webhook endpoint saved.");
      }
      await loadEndpoints();
    } catch (err) {
      logApiFailure("webhooks_create_failed", err);
      setFormError(apiErrorMessage(err, "Could not save the webhook endpoint."));
    } finally {
      setSaving(false);
    }
  };

  const revealSecret = (title, result) => {
    if (!result?.secret) {
      toast.success("Request completed.");
      return;
    }
    setRevealed({ title, secret: result.secret, note: result.note || "" });
  };

  const askDelete = (endpoint) => {
    setConfirm({
      title: "Remove webhook",
      body: "Remove this webhook endpoint? FindVirtualMe will stop sending events to it.",
      confirmLabel: "Remove endpoint",
      action: async () => {
        try {
          await deleteWebhookEndpoint(endpoint.id);
          toast.success("Webhook endpoint removed.");
          await loadEndpoints();
        } catch (err) {
          logApiFailure("webhooks_delete_failed", err);
          throw new Error(apiErrorMessage(err, "Could not remove the webhook endpoint."));
        }
      },
    });
  };

  const rotate = async (endpoint) => {
    try {
      const result = await rotateWebhookSecret(endpoint.id);
      revealSecret("Copy the new signing secret", result);
      await loadEndpoints();
    } catch (err) {
      logApiFailure("webhooks_rotate_failed", err);
      toast.error(apiErrorMessage(err, "Could not rotate the signing secret."));
    }
  };

  const testSend = async (endpoint) => {
    try {
      await sendWebhookTest(endpoint.id);
      toast.success("Test delivery queued.");
    } catch (err) {
      logApiFailure("webhooks_test_failed", err);
      toast.error(apiErrorMessage(err, "Could not send a test event."));
    }
  };

  const toggleLog = async (endpoint) => {
    if (openLog === endpoint.id) {
      setOpenLog("");
      return;
    }
    setOpenLog(endpoint.id);
    try {
      const rows = await listWebhookDeliveries(endpoint.id);
      setDeliveries((current) => ({ ...current, [endpoint.id]: rows }));
    } catch (err) {
      logApiFailure("webhooks_deliveries_failed", err);
      toast.error(apiErrorMessage(err, "Could not load the delivery log."));
    }
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title="Webhooks"
      lede="Subscribe an https endpoint to the event catalog. The signing secret is shown once."
      active="webhooks"
    >
      <section className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Signature verification</h2>
        <p className="text-sm text-gray-600">
          Each delivery includes <span className="font-mono">X-FindVirtualMe-Timestamp</span> (unix seconds),{" "}
          <span className="font-mono">X-FindVirtualMe-Signature</span> (<span className="font-mono">v1=</span> plus the
          hex HMAC-SHA256 of the timestamp, a period, and the raw body), and{" "}
          <span className="font-mono">X-FindVirtualMe-Event</span>. Reject timestamps more than 300 seconds off, and
          compare the signature in constant time. Retries use a new timestamp after 5 seconds, 30 seconds, 2 minutes,
          10 minutes, and 1 hour.
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">New subscription</h2>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-mono">POST /api/developer/webhooks</span> with an https URL and one or more events.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint URL
            </label>
            <input
              id="webhook-url"
              name="url"
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setFormError("");
              }}
              placeholder="https://hooks.example.test/events"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Event catalog</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WEBHOOK_EVENT_OPTIONS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={events.includes(item.id)}
                    onChange={() => toggleEvent(item.id)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                    <span className="block text-sm text-gray-600">{item.description}</span>
                    <span className="block text-xs text-gray-500 mt-1">{item.id}</span>
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
              {saving ? "Saving..." : "Add endpoint"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-800">Subscriptions</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-500">Loading...</div>
        ) : endpoints.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">No webhook endpoints yet.</div>
        ) : (
          endpoints.map((endpoint) => (
            <article key={endpoint.id} className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-mono text-sm text-slate-700 break-all">{endpoint.url}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(endpoint.events || []).map((eventName) => (
                      <span key={eventName} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                        {eventName}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Secret ending in <span className="font-mono">{endpoint.secretLast4 || "••••"}</span>
                    {" · "}
                    Created {formatWhen(endpoint.createdAt, "—")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => testSend(endpoint)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Send test
                  </button>
                  <button
                    type="button"
                    onClick={() => rotate(endpoint)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Rotate secret
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLog(endpoint)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    {openLog === endpoint.id ? "Hide log" : "Delivery log"}
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(endpoint)}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {openLog === endpoint.id ? (
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  {(deliveries[endpoint.id] || []).length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No deliveries yet.</p>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="px-4 py-2 font-medium">Event</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">HTTP</th>
                          <th className="px-4 py-2 font-medium">Attempts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries[endpoint.id].map((row) => (
                          <tr key={row.id} className="border-t border-gray-100 text-slate-700">
                            <td className="px-4 py-2 font-mono">{row.type || row.eventId}</td>
                            <td className="px-4 py-2">{row.status}</td>
                            <td className="px-4 py-2">{row.lastStatusCode ?? "—"}</td>
                            <td className="px-4 py-2">{row.attempts ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : null}
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
