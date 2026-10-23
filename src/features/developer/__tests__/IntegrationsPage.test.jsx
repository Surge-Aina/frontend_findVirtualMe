import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import IntegrationsPage from "../IntegrationsPage";

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

const missing = Object.assign(new Error("missing"), { response: { status: 404 } });

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: { _id: "user_example" }, token: "session-token" }}>
      <MemoryRouter>
        <IntegrationsPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const exampleApp = {
  slug: "app_example",
  name: "Example App",
  summary: "Reads sites for this account.",
  scopes: ["sites:read", "profile:read"],
  clientId: "fvm_app_example",
  redirectUris: ["https://partner.example.test/callback"],
};

describe("Integrations marketplace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosAuth.get.mockImplementation((url) => {
      if (url === "/api/marketplace/apps") return Promise.resolve({ data: { data: [exampleApp] } });
      if (url === "/api/developer/installations") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "inst_example_1",
                slug: "app_example",
                name: "Example App",
                scopes: ["sites:read", "profile:read"],
                installedAt: "2026-04-01T00:00:00.000Z",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    });
  });

  test("lists catalog apps and shows installed apps", async () => {
    renderPage();
    expect(await screen.findByRole("button", { name: /Example App/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Installed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Uninstall" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Webhooks" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Example App/ }));
    expect(mockNavigate).toHaveBeenCalledWith("/integrations/apps/app_example");
  });

  test("shows an empty marketplace when the catalog is unavailable", async () => {
    axiosAuth.get.mockImplementation((url) => {
      if (url === "/api/marketplace/apps") return Promise.reject(missing);
      if (url === "/api/developer/installations") return Promise.resolve({ data: { data: [] } });
      return Promise.reject(new Error(`unexpected ${url}`));
    });
    renderPage();
    expect(await screen.findByText(/No apps are listed yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Example App/ })).not.toBeInTheDocument();
  });

  test("opens the build-an-app page from the marketplace", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Marketplace" })).toBeInTheDocument();
    const [headerAction] = screen.getAllByRole("button", { name: "Build an app" });
    fireEvent.click(headerAction);
    expect(mockNavigate).toHaveBeenCalledWith("/developer/apps");
  });

  test("uninstalls an app after confirmation", async () => {
    axiosAuth.delete.mockResolvedValue({ data: { data: { id: "inst_example_1", deleted: true } } });
    renderPage();
    expect(await screen.findByRole("button", { name: "Uninstall" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Uninstall" }));
    const dialog = screen.getByRole("dialog", { name: "Uninstall app" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Uninstall" }));
    await waitFor(() =>
      expect(axiosAuth.delete).toHaveBeenCalledWith("/api/developer/installations/inst_example_1")
    );
  });
});
