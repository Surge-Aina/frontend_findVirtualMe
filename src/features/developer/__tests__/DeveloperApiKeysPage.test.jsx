import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import DeveloperApiKeysPage from "../DeveloperApiKeysPage";

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

const activeKey = {
  id: "key_example_1",
  name: "Partner reader",
  prefix: "fvm_example1",
  scopes: ["sites:read", "profile:read"],
  createdAt: "2026-01-02T00:00:00.000Z",
  lastUsedAt: null,
  revokedAt: null,
  replacedBy: null,
};

const EXAMPLE_SECRET = "fvm_example_secret_shown_once";

function renderPage(token = "session-token") {
  return render(
    <AuthContext.Provider value={{ user: { _id: "user_example" }, token }}>
      <MemoryRouter>
        <DeveloperApiKeysPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("DeveloperApiKeysPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
    axiosAuth.get.mockResolvedValue({ data: { data: [activeKey] } });
  });

  test("redirects home when there is no session", () => {
    renderPage(null);
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(axiosAuth.get).not.toHaveBeenCalled();
  });

  test("lists keys with prefix, scopes, and actions", async () => {
    renderPage();

    expect(await screen.findByText("Partner reader")).toBeInTheDocument();
    expect(screen.getByText("fvm_example1…")).toBeInTheDocument();
    expect(screen.getAllByText("sites:read").length).toBeGreaterThan(0);
    expect(screen.getAllByText("profile:read").length).toBeGreaterThan(0);
    expect(screen.getByRole("checkbox", { name: /Leads/ })).toBeInTheDocument();
    expect(screen.getAllByText("leads:read").length).toBeGreaterThan(0);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/Last used Never/)).toBeInTheDocument();
    expect(axiosAuth.get).toHaveBeenCalledWith("/api/developer/api-keys");
    expect(screen.getByRole("link", { name: "API docs" }).getAttribute("href")).toMatch(/\/api\/public\/docs$/);
  });

  test("creates a key and shows the secret once", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axiosAuth.post.mockResolvedValue({
      data: {
        data: { ...activeKey, id: "key_example_2", name: "Partner key", prefix: "fvm_example2" },
        secret: EXAMPLE_SECRET,
        note: "Store this secret now. It cannot be retrieved again.",
      },
    });

    renderPage();
    await screen.findByText("Partner reader");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Partner key" } });
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));

    expect(await screen.findByRole("dialog", { name: "Copy your API key" })).toBeInTheDocument();
    expect(screen.getByText(/shown once/i)).toBeInTheDocument();
    expect(screen.getByText(EXAMPLE_SECRET)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(EXAMPLE_SECRET));

    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(EXAMPLE_SECRET)).not.toBeInTheDocument();

    expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/api-keys", {
      name: "Partner key",
      scopes: ["sites:read", "profile:read"],
    });

    const logged = [...errorSpy.mock.calls, ...logSpy.mock.calls].flat().join(" ");
    expect(logged).not.toContain(EXAMPLE_SECRET);
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  test("requires a scope before creating a key", async () => {
    renderPage();
    await screen.findByText("Partner reader");

    fireEvent.click(screen.getByRole("checkbox", { name: /Sites/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Business profile/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));

    expect(screen.getByText("Select at least one scope.")).toBeInTheDocument();
    expect(axiosAuth.post).not.toHaveBeenCalled();
  });

  test("revokes a key after confirmation", async () => {
    axiosAuth.delete.mockResolvedValue({ data: { data: { ...activeKey, revokedAt: "2026-01-03T00:00:00.000Z" } } });
    axiosAuth.get
      .mockResolvedValueOnce({ data: { data: [activeKey] } })
      .mockResolvedValueOnce({
        data: { data: [{ ...activeKey, revokedAt: "2026-01-03T00:00:00.000Z" }] },
      });

    renderPage();
    await screen.findByText("Partner reader");
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    expect(screen.getByRole("dialog", { name: "Revoke API key" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Revoke key" }));

    await waitFor(() => expect(axiosAuth.delete).toHaveBeenCalledWith("/api/developer/api-keys/key_example_1"));
    expect(toast.success).toHaveBeenCalledWith("API key revoked.");
    expect(await screen.findByText("Revoked")).toBeInTheDocument();
  });

  test("rotates a key and shows the new secret once", async () => {
    const rotatedSecret = "fvm_example_rotated_secret";
    axiosAuth.post.mockResolvedValue({
      data: {
        data: { ...activeKey, id: "key_example_3", prefix: "fvm_example3" },
        secret: rotatedSecret,
        revokedKeyId: "key_example_1",
        note: "Store this secret now. It cannot be retrieved again.",
      },
    });

    renderPage();
    await screen.findByText("Partner reader");
    fireEvent.click(screen.getByRole("button", { name: "Rotate" }));
    fireEvent.click(screen.getByRole("button", { name: "Rotate key" }));

    expect(await screen.findByText(rotatedSecret)).toBeInTheDocument();
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/api-keys/key_example_1/rotate");
    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(rotatedSecret)).not.toBeInTheDocument();
  });
});
