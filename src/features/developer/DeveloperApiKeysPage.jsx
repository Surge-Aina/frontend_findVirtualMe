import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import ConfirmActionModal from "./ConfirmActionModal";
import DeveloperPage from "./DeveloperPage";
import SecretRevealModal from "./SecretRevealModal";
import {
  API_KEY_SCOPES,
  apiErrorMessage,
  createApiKey,
  formatKeyIdentifier,
  formatWhen,
  listApiKeys,
  logApiFailure,
  publicDocsUrl,
  publicOpenApiUrl,
  revokeApiKey,
  rotateApiKey,
} from "./developerApi";

const SECRET_WARNING =
  "This secret is shown once. Copy it now and store it somewhere safe. FindVirtualMe cannot show it again. Anyone with this key can read the scopes you selected.";

function keyLabel(key) {
  return key?.name || "Untitled key";
}

export default function DeveloperApiKeysPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState(["sites:read", "profile:read"]);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (err) {
      logApiFailure("api_keys_list_failed", err);
      toast.error(apiErrorMessage(err, "Could not load API keys."));
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadKeys();
  }, [token, loadKeys]);

  const toggleScope = (id) => {
    setScopes((current) => (current.includes(id) ? current.filter((scope) => scope !== id) : [...current, id]));
    setFormError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const orderedScopes = API_KEY_SCOPES.map((scope) => scope.id).filter((id) => scopes.includes(id));
    if (orderedScopes.length === 0) {
      setFormError("Select at least one scope.");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      const result = await createApiKey({ name, scopes: orderedScopes });
      if (!result?.secret) {
        toast.error("The server did not return a new key.");
        return;
      }
      setRevealed({
        title: "Copy your API key",
        secret: result.secret,
        note: result.note || "",
      });
      setName("");
      await loadKeys();
    } catch (err) {
      logApiFailure("api_keys_create_failed", err);
      setFormError(apiErrorMessage(err, "Could not create the API key."));
    } finally {
      setCreating(false);
    }
  };

  const askRevoke = (key) => {
    setConfirm({
      title: "Revoke API key",
      body: `Revoke “${keyLabel(key)}”? Partners using it lose access immediately.`,
      confirmLabel: "Revoke key",
      action: async () => {
        try {
          await revokeApiKey(key.id);
          toast.success("API key revoked.");
          await loadKeys();
        } catch (err) {
          logApiFailure("api_keys_revoke_failed", err);
          throw new Error(apiErrorMessage(err, "Could not revoke the API key."));
        }
      },
    });
  };

  const askRotate = (key) => {
    setConfirm({
      title: "Rotate API key",
      body: `Rotate “${keyLabel(key)}”? The current key stops working immediately. The new secret is shown once.`,
      confirmLabel: "Rotate key",
      action: async () => {
        try {
          const result = await rotateApiKey(key.id);
          if (!result?.secret) {
            throw new Error("The server did not return a new key.");
          }
          setRevealed({
            title: "Copy your new API key",
            secret: result.secret,
            note: result.note || "",
          });
          await loadKeys();
        } catch (err) {
          if (err?.message && !err?.response) throw err;
          logApiFailure("api_keys_rotate_failed", err);
          throw new Error(apiErrorMessage(err, "Could not rotate the API key."));
        }
      },
    });
  };

  if (!token) return null;

  return (
    <DeveloperPage
      title="API Keys"
      lede="Create keys for partners that read your sites and published business profile. Keys use your FindVirtualMe login."
      active="keys"
      actions={
        <>
          <a
            href={publicDocsUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            API docs
          </a>
          <a
            href={publicOpenApiUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            OpenAPI
          </a>
        </>
      }
    >
      <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create a key</h2>
        <p className="text-gray-600 text-sm mb-6">
          The full secret is returned once. Choose the scopes this key needs.
        </p>
        <form className="space-y-6" onSubmit={handleCreate}>
          <div>
            <label htmlFor="api-key-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="api-key-name"
              name="name"
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Partner key"
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Scopes</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {API_KEY_SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 cursor-pointer"
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
          {formError ? <p className="text-red-500 text-sm">{formError}</p> : null}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create key"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Your keys</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-500">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-slate-600">
            No API keys yet. Create one to let a partner read your sites and business profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {keys.map((key) => {
              const revoked = Boolean(key.revokedAt);
              return (
                <article key={key.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800">{keyLabel(key)}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            revoked ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {revoked ? "Revoked" : "Active"}
                        </span>
                      </div>
                      <div className="font-mono text-sm text-slate-600 break-all">{formatKeyIdentifier(key)}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(key.scopes || []).map((scope) => (
                          <span key={scope} className="text-xs bg-slate-600 text-white rounded-2xl px-2 py-1">
                            {scope}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-slate-400 space-y-1">
                        <div>Created {formatWhen(key.createdAt, "—")}</div>
                        <div>Last used {formatWhen(key.lastUsedAt, "Never")}</div>
                      </div>
                    </div>
                    {revoked ? null : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => askRotate(key)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                          Rotate
                        </button>
                        <button
                          type="button"
                          onClick={() => askRevoke(key)}
                          className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-red-500 transition-colors duration-300"
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
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
