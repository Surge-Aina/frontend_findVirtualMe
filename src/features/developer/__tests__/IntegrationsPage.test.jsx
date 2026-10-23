import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import IntegrationsPage from "@/features/developer/IntegrationsPage";

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

const WALLETME_KEY = "wm_example_key_value_w9k2";
const SIGNING_SECRET = "whsec_example_signing_secret";

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: { _id: "user_example" }, token: "session-token" }}>
      <MemoryRouter>
        <IntegrationsPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

function mockGets({ wallet, webhooks, deliveries }) {
  axiosAuth.get.mockImplementation((url) => {
    if (url === "/api/developer/integrations/walletme") return Promise.resolve({ data: { data: wallet } });
    if (url === "/api/developer/webhooks") {
      if (webhooks instanceof Error) return Promise.reject(webhooks);
      return Promise.resolve({ data: { data: webhooks } });
    }
    if (url === "/api/developer/webhooks/deliveries") {
      return Promise.resolve({ data: { data: deliveries || [] } });
    }
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

describe("IntegrationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("connects WalletMe with a masked key and then shows only the last 4", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGets({
      wallet: { connected: false, last4: null, updatedAt: null },
      webhooks: Object.assign(new Error("missing"), { response: { status: 404 } }),
    });
    axiosAuth.put.mockResolvedValue({
      data: { data: { connected: true, last4: "w9k2", updatedAt: "2026-02-01T00:00:00.000Z" } },
    });

    renderPage();
    expect(await screen.findByText("No WalletMe key saved.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Webhooks" })).not.toBeInTheDocument();

    const input = screen.getByLabelText("WalletMe API key");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.change(input, { target: { value: WALLETME_KEY } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    expect(await screen.findByText("w9k2")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(axiosAuth.put).toHaveBeenCalledWith("/api/developer/integrations/walletme", { apiKey: WALLETME_KEY });
    expect(screen.queryByDisplayValue(WALLETME_KEY)).not.toBeInTheDocument();

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain(WALLETME_KEY);
    errorSpy.mockRestore();
  });

  test("disconnects WalletMe after confirmation", async () => {
    mockGets({
      wallet: { connected: true, last4: "w9k2", updatedAt: "2026-02-01T00:00:00.000Z" },
      webhooks: Object.assign(new Error("missing"), { response: { status: 501 } }),
    });
    axiosAuth.delete.mockResolvedValue({ data: { data: { connected: false, last4: null } } });

    renderPage();
    expect(await screen.findByText("w9k2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    const dialog = screen.getByRole("dialog", { name: "Disconnect WalletMe" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Disconnect" }));

    await waitFor(() => expect(axiosAuth.delete).toHaveBeenCalledWith("/api/developer/integrations/walletme"));
    expect(toast.success).toHaveBeenCalledWith("WalletMe disconnected.");
    expect(await screen.findByText("No WalletMe key saved.")).toBeInTheDocument();
  });

  test("shows webhook settings and a one-time signing secret when the API exposes them", async () => {
    mockGets({
      wallet: { connected: false, last4: null },
      webhooks: {
        endpointUrl: "https://hooks.example.test/lead",
        secretLast4: "c4e1",
        events: ["lead.captured"],
      },
      deliveries: [
        {
          id: "evt_example_1",
          type: "lead.captured",
          status: "succeeded",
          responseStatus: 204,
          createdAt: "2026-03-01T00:00:00.000Z",
          payload: { email: "person@example.test", note: "do not render" },
        },
      ],
    });

    renderPage();
    expect(await screen.findByRole("heading", { name: "Webhooks" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://hooks.example.test/lead")).toBeInTheDocument();
    expect(screen.getByText("c4e1")).toBeInTheDocument();
    expect(screen.getByText("evt_example_1")).toBeInTheDocument();
    expect(screen.getByText("succeeded")).toBeInTheDocument();
    expect(screen.getByText(/HTTP 204/)).toBeInTheDocument();
    expect(screen.queryByText("person@example.test")).not.toBeInTheDocument();
    expect(screen.queryByText("do not render")).not.toBeInTheDocument();

    axiosAuth.put.mockResolvedValue({
      data: {
        data: { endpointUrl: "https://hooks.example.test/lead", secretLast4: "c4e1" },
        secret: SIGNING_SECRET,
        note: "Store this signing secret now.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save endpoint" }));

    expect(await screen.findByText(SIGNING_SECRET)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent(/signing secret is shown once/i);
    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(SIGNING_SECRET)).not.toBeInTheDocument();
  });
});
