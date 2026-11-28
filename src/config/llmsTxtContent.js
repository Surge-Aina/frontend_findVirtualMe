/** Machine-readable site description; no imports from app modules (safe for Node prebuild). */

export function buildLlmsTxt(apiHost) {
  const host = String(apiHost || "").replace(/\/$/, "");
  const mcpUrl = host ? `${host}/api/mcp` : "POST /api/mcp on the API host";
  const openApiUrl = host
    ? `${host}/api/public/v1/openapi.json`
    : "GET /api/public/v1/openapi.json on the API host";

  return `# FindVirtualMe

> Public API for a customer's sites, business profile, webhooks, and MCP server.

## Docs

- [Getting started](/developers): API keys, authentication, webhooks, and the OAuth install flow
- [API reference](/developers/docs): OpenAPI 3.1 reference (Redoc) with curl, JavaScript, and Python samples
- [Machine-readable description](/llms.txt): This file

## API

Configured API base (VITE_BACKEND_API): ${host || "unset — set VITE_BACKEND_API at build time"}.
Send Authorization: Bearer fvm_YOUR_KEY. That placeholder is not a real key.
The OpenAPI document is ${openApiUrl}.
The production API base is https only. Do not commit a real API key.

Scopes: sites:read, sites:write, profile:read, webhooks:write, leads:read. sites:write mutates site drafts (components) when feature flags are enabled.
Webhook signature: HMAC-SHA256 of the timestamp, a period, and the raw body. The header is X-FindVirtualMe-Signature: v1=<hex>. Reject timestamps more than 300 seconds off.

## MCP

${host ? `POST ${mcpUrl}` : mcpUrl}. Streamable HTTP. Use the same bearer key.
Tools: list_sites, get_site, get_business_profile, get_lead, list_webhooks, list_site_components, add_site_component, update_site_component, remove_site_component, reorder_site_components.
Copy-paste MCP configs for Cursor, VS Code, Claude Desktop, Claude Code, ChatGPT, Gemini, Grok, and Copilot are on /developers/mcp.
One-click connectors for claude.ai, ChatGPT, and grok.com are coming soon.
`;
}