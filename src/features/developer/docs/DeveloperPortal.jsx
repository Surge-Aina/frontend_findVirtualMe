import { Link, NavLink, Outlet } from "react-router-dom";
import FvMark from "@/shared/components/FvMark";
import CopyBlock from "./CopyBlock";
import { mcpEndpointUrl } from "../developerApi";
import { mcpConfigs } from "./specDocument";

const LINKS = [
  { to: "/developers", label: "Getting started", end: true },
  { to: "/developers/auth", label: "Authentication" },
  { to: "/developers/docs", label: "API reference" },
  { to: "/developers/mcp", label: "MCP server" },
  { to: "/developers/webhooks", label: "Webhooks" },
  { to: "/developers/oauth", label: "OAuth apps" },
];

function linkClass({ isActive }) {
  return `block px-4 py-3 rounded-lg text-left transition ${
    isActive ? "bg-gray-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
  }`;
}

export function DeveloperPortalLayout() {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-r border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-100">
          <FvMark />
          <div>
            <div className="font-semibold text-slate-800">Developers</div>
            <div className="text-xs text-slate-500">FindVirtual.me API</div>
          </div>
        </div>
        <nav className="px-2 py-4 space-y-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 px-4 py-10 md:px-12">
        <div className="max-w-3xl space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      {children}
    </section>
  );
}

export function GettingStartedPage() {
  return (
    <DocCard title="Getting started">
      <p className="text-sm text-slate-600">
        The public API reads the signed-in customer&apos;s own sites and published business profile. Create a key in
        the dashboard, then call the API with that key.
      </p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
        <li>Sign in and open API Keys.</li>
        <li>Create a key with the scopes the partner needs. The secret is shown once.</li>
        <li>Send it as a bearer token. A key can read only its owner&apos;s data.</li>
      </ol>
      <CopyBlock
        label="First request"
        text={`curl ${mcpEndpointUrl().replace(/\/api\/mcp$/, "")}/api/public/v1/me \\\n  -H "Authorization: Bearer fvm_YOUR_KEY"`}
      />
      <p className="text-sm text-slate-600">
        Scopes are <span className="font-mono">sites:read</span>, <span className="font-mono">profile:read</span>,{" "}
        <span className="font-mono">webhooks:write</span>, and <span className="font-mono">leads:read</span>.{" "}
        <span className="font-mono">GET /api/public/v1/me</span>{" "}
        needs a valid key and no resource scope.
      </p>
    </DocCard>
  );
}

export function AuthDocsPage() {
  return (
    <DocCard title="Authentication">
      <p className="text-sm text-slate-600">
        Data routes use an API key. Key management uses the same session login as the rest of the dashboard.
      </p>
      <CopyBlock label="API key header" text={"Authorization: Bearer fvm_YOUR_KEY"} />
      <p className="text-sm text-slate-700">
        Keys use the prefix <span className="font-mono">fvm_</span>. FindVirtualMe stores only a hash. Revoking a key
        stops it immediately. Rotating a key returns a new secret once and revokes the previous key.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2 pr-3 font-medium">Method</th>
              <th className="py-2 pr-3 font-medium">Path</th>
              <th className="py-2 font-medium">Auth</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr>
              <td className="py-2 pr-3">POST</td>
              <td className="py-2 pr-3 font-mono">/api/developer/api-keys</td>
              <td className="py-2">Session</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">GET</td>
              <td className="py-2 pr-3 font-mono">/api/developer/api-keys</td>
              <td className="py-2">Session</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">DELETE</td>
              <td className="py-2 pr-3 font-mono">/api/developer/api-keys/:id</td>
              <td className="py-2">Session</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">POST</td>
              <td className="py-2 pr-3 font-mono">/api/developer/api-keys/:id/rotate</td>
              <td className="py-2">Session</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">GET</td>
              <td className="py-2 pr-3 font-mono">/api/public/v1/me</td>
              <td className="py-2">API key</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">GET</td>
              <td className="py-2 pr-3 font-mono">/api/public/v1/sites</td>
              <td className="py-2">sites:read</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">GET</td>
              <td className="py-2 pr-3 font-mono">/api/public/v1/business-profile</td>
              <td className="py-2">profile:read</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">
        Errors use <span className="font-mono">{`{ "error": { "code", "message" } }`}</span>. Unknown and revoked keys
        both return <span className="font-mono">invalid_api_key</span>.
      </p>
    </DocCard>
  );
}

export function McpDocsPage() {
  const endpoint = mcpEndpointUrl();
  return (
    <DocCard title="MCP server">
      <p className="text-sm text-slate-600">
        The Model Context Protocol server is on the API host at <span className="font-mono">/api/mcp</span>. Send the
        same API key used for the public API. The samples use <span className="font-mono">fvm_YOUR_KEY</span>. Do not
        commit a real key. Redoc&apos;s Connect MCP controls are not part of the free Community Edition, so these
        configs are ours.
      </p>
      {mcpConfigs(endpoint).map((config) => (
        <CopyBlock key={config.id} label={`${config.label} · ${config.file}`} text={config.text} />
      ))}
      <p className="text-sm text-slate-600">
        The same samples are on{" "}
        <Link className="text-blue-700 underline" to="/developers/docs">
          the API reference
        </Link>
        . A short agent description is at{" "}
        <a className="text-blue-700 underline" href="/llms.txt">
          /llms.txt
        </a>
        .
      </p>
    </DocCard>
  );
}

export function WebhookDocsPage() {
  return (
    <DocCard title="Webhooks">
      <p className="text-sm text-slate-600">
        Register an endpoint with <span className="font-mono">POST /api/public/v1/webhooks</span> or the session route{" "}
        <span className="font-mono">POST /api/developer/webhooks</span>. The body is{" "}
        <span className="font-mono">{`{ "url", "events" }`}</span>. The signing secret, prefixed{" "}
        <span className="font-mono">whsec_</span>, is returned once. Rotate it with{" "}
        <span className="font-mono">POST /api/public/v1/webhooks/:id/rotate</span>, send a test with{" "}
        <span className="font-mono">POST /api/public/v1/webhooks/:id/test</span>, and read delivery status with{" "}
        <span className="font-mono">GET /api/public/v1/webhooks/:id/deliveries</span>. The full reference is on{" "}
        <Link className="text-blue-700 underline" to="/developers/docs">
          /developers/docs
        </Link>
        .
      </p>
      <h2 className="text-lg font-semibold text-slate-800">Event catalog</h2>
      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
        <li>
          <span className="font-mono">lead.captured</span> — a visitor submitted a lead on a site
        </li>
        <li>
          <span className="font-mono">form.submitted</span> — a visitor submitted a form
        </li>
        <li>
          <span className="font-mono">site.published</span> — a site was published
        </li>
        <li>
          <span className="font-mono">business_profile.updated</span> — a published business profile changed
        </li>
        <li>
          <span className="font-mono">app.installed</span> — an app was installed on a site
        </li>
        <li>
          <span className="font-mono">app.uninstalled</span> — an app was removed from a site
        </li>
      </ul>
      <p className="text-sm text-slate-700">Every delivery sends these headers:</p>
      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
        <li>
          <span className="font-mono">X-FindVirtualMe-Timestamp</span> — unix time in seconds
        </li>
        <li>
          <span className="font-mono">X-FindVirtualMe-Signature</span> — <span className="font-mono">v1=</span> plus
          lowercase hex
        </li>
        <li>
          <span className="font-mono">X-FindVirtualMe-Event</span> — event id, stable across retries
        </li>
      </ul>
      <p className="text-sm text-slate-700">
        Compute HMAC-SHA256 with the signing secret over the UTF-8 string{" "}
        <span className="font-mono">timestamp + &quot;.&quot; + rawBody</span>. <span className="font-mono">rawBody</span>{" "}
        is the exact JSON bytes. Compare the hex digest in constant time. Reject a timestamp more than 300 seconds from
        your clock. Dedupe on the event id.
      </p>
      <CopyBlock
        label="Signed payload"
        text={'timestamp.{"id":"evt_example","type":"lead.captured","createdAt":"2026-03-01T00:00:00.000Z","data":{"siteId":"site_example"}}'}
      />
    </DocCard>
  );
}

export function OAuthDocsPage() {
  return (
    <DocCard title="OAuth app install">
      <p className="text-sm text-slate-600">
        A customer installs an approved app. The public catalog is{" "}
        <span className="font-mono">GET /api/marketplace/apps</span>. The customer is signed in, picks a site, and
        approves the scopes the app requested.
      </p>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
        <li>The customer chooses Install on an approved app.</li>
        <li>
          The browser calls <span className="font-mono">GET /api/oauth/authorize</span> with{" "}
          <span className="font-mono">response_type=code</span>, <span className="font-mono">client_id</span>,{" "}
          <span className="font-mono">redirect_uri</span>, <span className="font-mono">scope</span>,{" "}
          <span className="font-mono">state</span>, <span className="font-mono">site_id</span>, and a PKCE{" "}
          <span className="font-mono">code_challenge</span> using <span className="font-mono">S256</span>.
        </li>
        <li>FindVirtualMe redirects to the app with the authorization code and the same state.</li>
        <li>
          The app calls <span className="font-mono">POST /api/oauth/token</span> with{" "}
          <span className="font-mono">grant_type=authorization_code</span>, the code, the verifier, and its client
          secret.
        </li>
      </ol>
      <p className="text-sm text-slate-600">
        Installed apps are listed with <span className="font-mono">GET /api/developer/installations</span> and removed
        with <span className="font-mono">DELETE /api/developer/installations/:id</span>. The sequence diagram is on{" "}
        <Link className="text-blue-700 underline" to="/developers/docs">
          the API reference
        </Link>
        .
      </p>
    </DocCard>
  );
}
