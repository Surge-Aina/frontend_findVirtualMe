import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import DeveloperAppsPage from "../DeveloperAppsPage";

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

const CLIENT_SECRET = "fvm_sec_example_client_secret";

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: { _id: "user_example" }, token: "session-token" }}>
      <MemoryRouter>
        <DeveloperAppsPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("DeveloperAppsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
    axiosAuth.get.mockResolvedValue({ data: { data: [] } });
  });

  test("registers an app and shows the client secret once", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axiosAuth.post.mockResolvedValue({
      data: {
        data: {
          id: "app_example_1",
          name: "Example App",
          clientId: "fvm_app_example",
          redirectUris: ["https://app.example.test/oauth/callback"],
          scopes: ["sites:read"],
          reviewStatus: "pending",
          secretLast4: "c9a1",
        },
        clientSecret: CLIENT_SECRET,
        note: "Store this client secret now.",
      },
    });

    renderPage();
    expect(await screen.findByText("No apps registered yet.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Example App" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Reads sites." } });
    fireEvent.change(screen.getByLabelText("Redirect URIs"), {
      target: { value: "https://app.example.test/oauth/callback" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register app" }));

    expect(await screen.findByText(CLIENT_SECRET)).toBeInTheDocument();
    expect(screen.getByText(/Client id: fvm_app_example/)).toBeInTheDocument();
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/apps", {
      name: "Example App",
      description: "Reads sites.",
      redirectUris: ["https://app.example.test/oauth/callback"],
      scopes: ["sites:read"],
    });
    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(CLIENT_SECRET)).not.toBeInTheDocument();

    const logged = [...errorSpy.mock.calls, ...logSpy.mock.calls].flat().join(" ");
    expect(logged).not.toContain(CLIENT_SECRET);
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });
});
