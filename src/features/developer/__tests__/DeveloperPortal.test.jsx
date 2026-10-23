import fs from "fs";
import path from "path";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import { DeveloperPortalLayout, GettingStartedPage, McpDocsPage } from "../docs/DeveloperPortal";
import { ensureLeadLookup, joinApiUrl, llmBrief, apiCallAllowed, mcpConfigs, llmsTxt, withAbsoluteServer, serverUrlOf } from "../docs/specDocument";
import OAuthConsentPage from "../OAuthConsentPage";
import AppDetailPage from "../AppDetailPage";
import * as developerApi from "../developerApi";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function withAuth(ui, token = "session-token") {
  return (
    <AuthContext.Provider value={{ user: token ? { _id: "user_example" } : null, token }}>{ui}</AuthContext.Provider>
  );
}

describe("Developer portal and OAuth consent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test("getting started and MCP docs name the public routes", () => {
    render(
      <MemoryRouter initialEntries={["/developers"]}>
        <Routes>
          <Route path="/developers" element={<DeveloperPortalLayout />}>
            <Route index element={<GettingStartedPage />} />
            <Route path="mcp" element={<McpDocsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Getting started" })).toBeInTheDocument();
    expect(screen.getByText(/Bearer fvm_YOUR_KEY/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "MCP server" }));
  });

  test("adds lead lookup and keeps the API key out of the agent brief", () => {
    const spec = ensureLeadLookup({
      openapi: "3.1.0",
      info: { title: "FindVirtualMe Public API" },
      servers: [{ url: "/api/public/v1" }],
      paths: {
        "/sites": { get: { summary: "List sites", operationId: "listSites", responses: { 200: { description: "Sites" } } } },
      },
    });
    expect(spec.paths["/leads/{leadId}"].get.operationId).toBe("getLead");
    expect(ensureLeadLookup(spec).paths["/leads/{leadId}"].get.operationId).toBe("getLead");
    const url = joinApiUrl("https://api.example.test/api/public/v1", "/leads/{leadId}", { leadId: "lead_example" });
    expect(url).toBe("https://api.example.test/api/public/v1/leads/lead_example");
    const brief = llmBrief({
      spec,
      docsUrl: "https://findvirtual.me/developers/docs",
      specUrl: "https://api.example.test/api/public/v1/openapi.json",
      mcpUrl: "https://api.example.test/api/mcp",
    });
    expect(brief).toContain("GET /leads/{leadId}");
    expect(brief).toContain("fvm_YOUR_KEY");
    expect(brief).not.toContain("fvm_live");
  });

  test("consent screen lists scopes and posts the authorize decision", async () => {
    const challenge = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN012";
    axiosAuth.get.mockImplementation((url) => {
      if (url === "/api/marketplace/apps") {
        return Promise.resolve({
          data: {
            data: [
              {
                slug: "app_example",
                name: "Example App",
                clientId: "fvm_app_example",
                scopes: ["sites:read", "profile:read"],
                redirectUris: ["https://partner.example.test/callback"],
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: { data: [{ id: "site_example", title: "Example Site", slug: "example-site" }] },
      });
    });
    axiosAuth.post.mockResolvedValue({
      data: {
        redirect_url: "https://partner.example.test/callback?code=authcode_example&state=state_example",
        scope: "sites:read profile:read",
      },
    });
    const assign = jest.spyOn(developerApi, "followBrowserRedirect").mockImplementation(() => {});

    render(
      withAuth(
        <MemoryRouter
          initialEntries={[
            `/oauth/consent?client_id=fvm_app_example&client_name=Example%20App&scope=sites:read%20profile:read&state=state_example&response_type=code&redirect_uri=https%3A%2F%2Fpartner.example.test%2Fcallback&code_challenge=${challenge}`,
          ]}
        >
          <Routes>
            <Route path="/oauth/consent" element={<OAuthConsentPage />} />
          </Routes>
        </MemoryRouter>
      )
    );

    expect(screen.getByRole("heading", { name: "Allow access" })).toBeInTheDocument();
    expect(await screen.findByText("Example App")).toBeInTheDocument();
    expect(screen.getByText("sites:read")).toBeInTheDocument();
    expect(screen.getByText("profile:read")).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Example Site" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));

    await waitFor(() => expect(axiosAuth.post).toHaveBeenCalled());
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/oauth/authorize", {
      client_id: "fvm_app_example",
      redirect_uri: "https://partner.example.test/callback",
      scope: "sites:read profile:read",
      state: "state_example",
      site_id: "site_example",
      code_challenge: challenge,
      code_challenge_method: "S256",
      response_type: "code",
    });
    expect(axiosAuth.post.mock.calls.some(([url]) => url === "/api/oauth/consent")).toBe(false);
    expect(screen.queryByText("authcode_example")).not.toBeInTheDocument();
    expect(assign).toHaveBeenCalledWith(
      "https://partner.example.test/callback?code=authcode_example&state=state_example"
    );
    assign.mockRestore();
  });

  test("install opens the consent screen using scopes from the catalog", async () => {
    const missing = Object.assign(new Error("missing"), { response: { status: 404 } });
    axiosAuth.get.mockImplementation((url) => {
      if (url === "/api/marketplace/apps") {
        return Promise.resolve({
          data: {
            data: [
              {
                slug: "app_example",
                name: "Example App",
                summary: "Reads sites for this account.",
                scopes: ["sites:read", "profile:read"],
                clientId: "fvm_app_example",
                redirectUris: ["https://partner.example.test/callback"],
              },
            ],
          },
        });
      }
      if (url === "/api/developer/installations") return Promise.resolve({ data: { data: [] } });
      return Promise.reject(missing);
    });
    axiosAuth.post.mockRejectedValue(missing);

    render(
      withAuth(
        <MemoryRouter initialEntries={["/integrations/apps/app_example"]}>
          <Routes>
            <Route path="/integrations/apps/:slug" element={<AppDetailPage />} />
          </Routes>
        </MemoryRouter>
      )
    );

    expect(await screen.findByRole("button", { name: "Install" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Install" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const target = String(mockNavigate.mock.calls.at(-1)[0]);
    expect(target).toContain("/oauth/consent?client_id=fvm_app_example");
    expect(target).toContain("client_name=Example+App");
    expect(target).toContain("sites%3Aread");
    expect(target).toContain("redirect_uri=https%3A%2F%2Fpartner.example.test%2Fcallback");
  });

  test("an unknown slug is not installed from a hardcoded catalog", async () => {
    const missing = Object.assign(new Error("missing"), { response: { status: 404 } });
    axiosAuth.get.mockRejectedValue(missing);

    render(
      withAuth(
        <MemoryRouter initialEntries={["/integrations/apps/app_example"]}>
          <Routes>
            <Route path="/integrations/apps/:slug" element={<AppDetailPage />} />
          </Routes>
        </MemoryRouter>
      )
    );

    expect(await screen.findByText("This app is not in the marketplace.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Install" })).not.toBeInTheDocument();
  });

  test("production try-it stays on the configured https API host", () => {
    const apiOrigin = "https://api.findvirtual.me";
    expect(apiCallAllowed("https://api.findvirtual.me/api/public/v1/me", { production: true, apiOrigin })).toBe(true);
    expect(apiCallAllowed("https://evil.example/api/public/v1/me", { production: true, apiOrigin })).toBe(false);
    expect(apiCallAllowed("http://api.findvirtual.me/api/public/v1/me", { production: true, apiOrigin })).toBe(false);
    expect(apiCallAllowed("http://127.0.0.1:5999/api/public/v1/me", { production: true, apiOrigin: "http://127.0.0.1:5999" })).toBe(false);
    expect(apiCallAllowed("http://127.0.0.1:5999/api/public/v1/me", { production: false, apiOrigin: "http://127.0.0.1:5999" })).toBe(true);
    expect(apiCallAllowed("https://evil.example/me", { production: false, apiOrigin: "http://127.0.0.1:5999" })).toBe(false);
    const spec = withAbsoluteServer(
      { servers: [{ url: "https://evil.example/steal" }], paths: {} },
      apiOrigin
    );
    expect(serverUrlOf(spec)).toBe("https://api.findvirtual.me/api/public/v1");
    expect(apiCallAllowed(serverUrlOf(spec) + "/me", { production: true, apiOrigin })).toBe(true);
  });

  test("mcp configs and llms.txt stay free of a real key", () => {
    const configs = mcpConfigs("https://api.example.test/api/mcp");
    expect(configs.map((config) => config.id)).toEqual([
      "cursor",
      "vscode",
      "claude-desktop",
      "claude-code",
      "chatgpt",
      "gemini",
      "grok",
      "copilot",
    ]);
    for (const config of configs) {
      expect(config.text).toContain("fvm_YOUR_KEY");
      expect(config.text).toContain("https://api.example.test/api/mcp");
      expect(config.text).toContain("application/json, text/event-stream");
      expect(config.text).not.toContain("fvm_live");
    }
    expect(configs.find((config) => config.id === "claude-code").text).toContain('"type": "http"');
    const file = fs.readFileSync(path.join(process.cwd(), "public/llms.txt"), "utf8");
    expect(file).toBe(llmsTxt());
    expect(file).toContain("/developers/docs");
  });
});
