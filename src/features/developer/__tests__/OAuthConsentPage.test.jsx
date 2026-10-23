import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import { safeReturnPath } from "@/shared/utils/safeReturnPath";
import OAuthConsentPage from "../OAuthConsentPage";
import { authorizeRedirectTarget } from "../developerApi";
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

const CONSENT_URL =
  "/oauth/consent?client_id=fvm_app_example&client_name=Spoofed%20FindVirtualMe&scope=sites:read%20profile:read&state=state_example&response_type=code&code_challenge=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN012&redirect_uri=https%3A%2F%2Fevil.example%2Fphish&redirect_uris=https%3A%2F%2Fpartner.example.test%2Fcallback";

function withAuth(ui, token = "session-token") {
  return (
    <AuthContext.Provider value={{ user: token ? { _id: "user_example" } : null, token }}>{ui}</AuthContext.Provider>
  );
}

function renderConsent(token, entry = CONSENT_URL) {
  return render(
    withAuth(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/oauth/consent" element={<OAuthConsentPage />} />
        </Routes>
      </MemoryRouter>,
      token
    )
  );
}

describe("OAuth consent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
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
      if (url === "/api/oauth/authorize") {
        return Promise.resolve({
          data: { data: [{ id: "site_example", title: "Example Site", slug: "example-site" }] },
        });
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    });
  });

  test("requires sign-in and does not store a secret or follow a query redirect", async () => {
    const assign = jest.spyOn(developerApi, "followBrowserRedirect").mockImplementation(() => {});
    renderConsent(null);

    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Allow" })).not.toBeInTheDocument();
    expect(screen.queryByText("Spoofed FindVirtualMe")).not.toBeInTheDocument();
    expect(axiosAuth.post).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
    const stored = JSON.parse(sessionStorage.getItem("postLoginPath"));
    expect(stored.path.startsWith("/oauth/consent?")).toBe(true);
    expect(stored.path).not.toMatch(/secret|whsec_|fvm_live/i);
    assign.mockRestore();
  });

  test("shows the catalog name and scopes, and follows only the validated https redirect", async () => {
    axiosAuth.post.mockResolvedValue({
      data: {
        redirect_url: "https://partner.example.test/callback?code=authcode_example&state=state_example",
      },
    });
    const assign = jest.spyOn(developerApi, "followBrowserRedirect").mockImplementation(() => {});
    renderConsent("session-token");

    expect(await screen.findByText("Example App")).toBeInTheDocument();
    expect(screen.getByText("sites:read")).toBeInTheDocument();
    expect(screen.getByText("profile:read")).toBeInTheDocument();
    expect(screen.queryByText("Spoofed FindVirtualMe")).not.toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Example Site" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));

    await waitFor(() => expect(axiosAuth.post).toHaveBeenCalled());
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/oauth/authorize", expect.objectContaining({
      client_id: "fvm_app_example",
      redirect_uri: "https://partner.example.test/callback",
      response_type: "code",
      code_challenge_method: "S256",
    }));
    expect(axiosAuth.post.mock.calls.some(([url]) => url === "/api/oauth/consent")).toBe(false);
    expect(screen.queryByText("authcode_example")).not.toBeInTheDocument();
    expect(assign).toHaveBeenCalledWith(
      "https://partner.example.test/callback?code=authcode_example&state=state_example"
    );
    assign.mockRestore();
  });

  test("deny and a mismatched authorize URL stay on this site", async () => {
    axiosAuth.post.mockResolvedValue({
      data: { redirect_url: "https://evil.example/phish?code=stolen" },
    });
    const assign = jest.spyOn(developerApi, "followBrowserRedirect").mockImplementation(() => {});
    renderConsent("session-token");
    expect(await screen.findByRole("option", { name: "Example Site" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(mockNavigate).toHaveBeenCalledWith("/integrations");
    expect(assign).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Allow" }));
    await waitFor(() => expect(axiosAuth.post).toHaveBeenCalled());
    expect(assign).not.toHaveBeenCalled();
    expect(await screen.findByText(/did not return the redirect URI/)).toBeInTheDocument();
    assign.mockRestore();
  });

  test("authorize redirect helper rejects open redirects", () => {
    const ok = "https://partner.example.test/callback?code=authcode_example&state=state_example";
    expect(authorizeRedirectTarget(ok, "https://partner.example.test/callback")).toBe(ok);
    expect(authorizeRedirectTarget("https://evil.example/phish", "https://partner.example.test/callback")).toBeNull();
    expect(authorizeRedirectTarget("http://partner.example.test/callback", "http://partner.example.test/callback")).toBeNull();
    expect(authorizeRedirectTarget("/\\evil.example", "/\\evil.example")).toBeNull();
    expect(authorizeRedirectTarget("javascript:alert(1)", "javascript:alert(1)")).toBeNull();
    expect(safeReturnPath("/oauth/consent?client_id=fvm_app_example")).toBe(
      "/oauth/consent?client_id=fvm_app_example"
    );
    expect(safeReturnPath("//evil.example")).toBeNull();
    expect(safeReturnPath("/\\evil.example")).toBeNull();
    expect(safeReturnPath("/%2F%2Fevil.example")).toBeNull();
    expect(safeReturnPath("https://evil.example")).toBeNull();
  });
});
