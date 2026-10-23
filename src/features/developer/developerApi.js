import axiosAuth from "@/shared/api/axiosAuth";

export const API_KEY_SCOPES = [
  {
    id: "sites:read",
    label: "Sites",
    description: "List and read this account's websites.",
  },
  {
    id: "profile:read",
    label: "Business profile",
    description: "Read the published business profile used to prefill a wallet card.",
  },
];

export const API_KEYS_PATH = "/api/developer/api-keys";
export const WALLETME_PATH = "/api/developer/integrations/walletme";
export const WEBHOOKS_PATH = "/api/developer/webhooks";
export const WEBHOOK_DELIVERIES_PATH = "/api/developer/webhooks/deliveries";
export const WEBHOOK_ROTATE_PATH = "/api/developer/webhooks/rotate-secret";

function backendOrigin() {
  const raw = import.meta.env.VITE_BACKEND_API || "";
  return String(raw).replace(/\/$/, "");
}

export function publicDocsUrl() {
  const origin = backendOrigin();
  return origin ? `${origin}/api/public/docs` : "/api/public/docs";
}

export function publicOpenApiUrl() {
  const origin = backendOrigin();
  return origin ? `${origin}/api/public/v1/openapi.json` : "/api/public/v1/openapi.json";
}

export function apiErrorMessage(err, fallback) {
  const body = err?.response?.data;
  if (body && typeof body.error === "object" && typeof body.error.message === "string") {
    return body.error.message;
  }
  if (typeof body?.error === "string" && body.error.trim()) {
    return body.error;
  }
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }
  return fallback;
}

/**
 * Log a failure without the request or response body.
 * Those bodies can contain an API key or a signing secret.
 */
export function logApiFailure(label, err) {
  const status = err?.response?.status || "no-status";
  const codeField = err?.response?.data?.error;
  const code = typeof codeField === "string" ? codeField : codeField?.code || "no-code";
  console.error(label, status, code);
}

export function isMissingFeature(err) {
  const status = err?.response?.status;
  return status === 404 || status === 501;
}

function unwrapData(body) {
  if (body && typeof body === "object" && "data" in body) return body.data;
  return body;
}

export async function listApiKeys() {
  const res = await axiosAuth.get(API_KEYS_PATH);
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

export async function createApiKey({ name, scopes }) {
  const payload = { scopes };
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (trimmed) payload.name = trimmed;
  const res = await axiosAuth.post(API_KEYS_PATH, payload);
  return res.data || {};
}

export async function revokeApiKey(id) {
  const res = await axiosAuth.delete(`${API_KEYS_PATH}/${encodeURIComponent(id)}`);
  return res.data || {};
}

export async function rotateApiKey(id) {
  const res = await axiosAuth.post(`${API_KEYS_PATH}/${encodeURIComponent(id)}/rotate`);
  return res.data || {};
}

export async function getWalletMeConnection() {
  const res = await axiosAuth.get(WALLETME_PATH);
  const data = unwrapData(res.data);
  return {
    connected: Boolean(data?.connected || data?.last4),
    last4: data?.last4 || null,
    updatedAt: data?.updatedAt || null,
  };
}

export async function saveWalletMeKey(apiKey) {
  const res = await axiosAuth.put(WALLETME_PATH, { apiKey });
  const data = unwrapData(res.data) || {};
  return {
    connected: true,
    last4: data.last4 || null,
    updatedAt: data.updatedAt || null,
  };
}

export async function disconnectWalletMe() {
  await axiosAuth.delete(WALLETME_PATH);
  return { connected: false, last4: null, updatedAt: null };
}

export async function getWebhookSettings() {
  const res = await axiosAuth.get(WEBHOOKS_PATH);
  const data = unwrapData(res.data) || {};
  return {
    endpointUrl: data.endpointUrl || data.url || "",
    secretLast4: data.secretLast4 || data.last4 || null,
    events: Array.isArray(data.events) && data.events.length ? data.events : ["lead.captured"],
    updatedAt: data.updatedAt || null,
  };
}

export async function saveWebhookEndpoint(endpointUrl) {
  const res = await axiosAuth.put(WEBHOOKS_PATH, { endpointUrl });
  return res.data || {};
}

export async function rotateWebhookSecret() {
  const res = await axiosAuth.post(WEBHOOK_ROTATE_PATH);
  return res.data || {};
}

export async function listWebhookDeliveries() {
  const res = await axiosAuth.get(WEBHOOK_DELIVERIES_PATH);
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

export function formatKeyIdentifier(key) {
  const prefix = key?.prefix || "fvm_";
  const suffix = key?.last4 || key?.suffix || "";
  if (suffix) return `${prefix}…${suffix}`;
  return `${prefix}…`;
}

export function formatWhen(value, emptyLabel) {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;
  return date.toLocaleString();
}
