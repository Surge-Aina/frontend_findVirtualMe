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
    description: "Read the published business profile for this account.",
  },
  {
    id: "webhooks:write",
    label: "Webhooks",
    description: "Register and remove webhook endpoints for this account.",
  },
  {
    id: "leads:read",
    label: "Leads",
    description: "Read captured leads for this account.",
  },
];

export const WEBHOOK_EVENT_OPTIONS = [
  { id: "lead.captured", label: "Lead captured", description: "A visitor submitted a lead on a site." },
  { id: "form.submitted", label: "Form submitted", description: "A visitor submitted a form." },
  { id: "site.published", label: "Site published", description: "A site was published." },
  { id: "business_profile.updated", label: "Business profile updated", description: "A published business profile changed." },
  { id: "app.installed", label: "App installed", description: "An app was installed on a site." },
  { id: "app.uninstalled", label: "App uninstalled", description: "An app was removed from a site." },
];

export const API_KEYS_PATH = "/api/developer/api-keys";
export const WEBHOOKS_PATH = "/api/developer/webhooks";
export const APPS_PATH = "/api/marketplace/apps";
export const DEVELOPER_APPS_PATH = "/api/developer/apps";
export const INSTALLATIONS_PATH = "/api/developer/installations";
export const OAUTH_AUTHORIZE_PATH = "/api/oauth/authorize";
export const MCP_PATH = "/api/mcp";
export const MCP_ACCEPT_HEADER = "application/json, text/event-stream";

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

export function mcpEndpointUrl() {
  const origin = backendOrigin();
  return origin ? `${origin}${MCP_PATH}` : MCP_PATH;
}

export function scopeLabel(scopeId) {
  return API_KEY_SCOPES.find((scope) => scope.id === scopeId)?.label || scopeId;
}

export function normalizeApps(apps) {
  const list = Array.isArray(apps) ? apps.filter((app) => app && (app.slug || app.id)) : [];
  return list.map((app) => ({
    slug: app.slug || app.id,
    name: app.name || app.slug || app.id,
    summary: app.summary || app.description || "",
    scopes: Array.isArray(app.scopes) ? app.scopes : [],
    clientId: app.clientId || "",
    redirectUris: Array.isArray(app.redirectUris) ? app.redirectUris : [],
  }));
}

function strictHttpsUrl(value) {
  if (typeof value !== "string" || !value || value !== value.trim()) return null;
  if (/[\\\s]/.test(value)) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  return url;
}

/**
 * Follow only the https URL returned by POST /api/oauth/authorize, and only
 * when it is the same origin and path as the redirect URI that request asked
 * the backend to validate. Query-string redirect_uri values are not targets.
 */
export function authorizeRedirectTarget(responseUrl, requestedRedirectUri) {
  const response = strictHttpsUrl(responseUrl);
  const requested = strictHttpsUrl(requestedRedirectUri);
  if (!response || !requested) return null;
  if (response.origin !== requested.origin) return null;
  if (response.pathname !== requested.pathname) return null;
  return response.toString();
}

export function followBrowserRedirect(target) {
  window.location.assign(target);
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

export async function listWebhookEndpoints() {
  const res = await axiosAuth.get(WEBHOOKS_PATH);
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

export async function createWebhookEndpoint({ url, events }) {
  const res = await axiosAuth.post(WEBHOOKS_PATH, { url, events });
  return res.data || {};
}

export async function deleteWebhookEndpoint(id) {
  const res = await axiosAuth.delete(`${WEBHOOKS_PATH}/${encodeURIComponent(id)}`);
  return res.data || {};
}

export async function rotateWebhookSecret(id) {
  const res = await axiosAuth.post(`${WEBHOOKS_PATH}/${encodeURIComponent(id)}/rotate`);
  return res.data || {};
}

export async function sendWebhookTest(id) {
  const res = await axiosAuth.post(`${WEBHOOKS_PATH}/${encodeURIComponent(id)}/test`);
  return res.data || {};
}

export async function listWebhookDeliveries(id) {
  const res = await axiosAuth.get(`${WEBHOOKS_PATH}/${encodeURIComponent(id)}/deliveries`);
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

export async function listDeveloperApps() {
  const res = await axiosAuth.get(DEVELOPER_APPS_PATH);
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

export async function registerDeveloperApp({ name, description, redirectUris, scopes, webhookUrl }) {
  const payload = { name, redirectUris, scopes };
  const trimmedDescription = typeof description === "string" ? description.trim() : "";
  if (trimmedDescription) payload.description = trimmedDescription;
  const trimmedWebhook = typeof webhookUrl === "string" ? webhookUrl.trim() : "";
  if (trimmedWebhook) payload.webhookUrl = trimmedWebhook;
  const res = await axiosAuth.post(DEVELOPER_APPS_PATH, payload);
  return res.data || {};
}

export async function listConsentSites() {
  const res = await axiosAuth.get(OAUTH_AUTHORIZE_PATH, { params: { response_type: "code" } });
  const data = unwrapData(res.data);
  return Array.isArray(data) ? data : [];
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function createPkcePair() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const verifier = bytesToBase64Url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = bytesToBase64Url(new Uint8Array(digest));
  return { verifier, challenge };
}

export async function authorizeOAuthInstall({ clientId, redirectUri, scope, state, siteId, codeChallenge }) {
  const res = await axiosAuth.post(OAUTH_AUTHORIZE_PATH, {
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state: state || "",
    site_id: siteId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    response_type: "code",
  });
  return res.data || {};
}

export async function listMarketplaceApps() {
  try {
    const res = await axiosAuth.get(APPS_PATH);
    return normalizeApps(unwrapData(res.data));
  } catch (err) {
    if (isMissingFeature(err)) return [];
    throw err;
  }
}

export async function listInstallations() {
  try {
    const res = await axiosAuth.get(INSTALLATIONS_PATH);
    const data = unwrapData(res.data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (isMissingFeature(err)) return [];
    throw err;
  }
}

export async function uninstallInstallation(id) {
  const res = await axiosAuth.delete(`${INSTALLATIONS_PATH}/${encodeURIComponent(id)}`);
  return res.data || {};
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
