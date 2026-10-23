import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import WebhooksPage from "../WebhooksPage";

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

const endpoint = {
  id: "wh_example_1",
  url: "https://hooks.example.test/events",
  events: ["lead.captured"],
  secretLast4: "c4e1",
  createdAt: "2026-03-01T00:00:00.000Z",
};

const SIGNING_SECRET = "whsec_example_signing_secret";

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: { _id: "user_example" }, token: "session-token" }}>
      <MemoryRouter>
        <WebhooksPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("WebhooksPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
    axiosAuth.get.mockImplementation((url) => {
      if (url === "/api/developer/webhooks") return Promise.resolve({ data: { data: [endpoint] } });
      if (url === "/api/developer/webhooks/wh_example_1/deliveries") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "del_example_1",
                eventId: "evt_example_1",
                type: "lead.captured",
                status: "succeeded",
                attempts: 1,
                lastStatusCode: 204,
                createdAt: "2026-03-02T00:00:00.000Z",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error(`unexpected ${url}`));
    });
  });

  test("creates an endpoint and shows the signing secret once", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axiosAuth.post.mockResolvedValue({
      data: {
        data: { ...endpoint, id: "wh_example_2" },
        secret: SIGNING_SECRET,
        note: "Store this signing secret now.",
      },
    });

    renderPage();
    expect(await screen.findByRole("heading", { name: "Signature verification" })).toBeInTheDocument();
    expect(screen.getByText(/X-FindVirtualMe-Signature/)).toBeInTheDocument();
    expect(await screen.findByText("https://hooks.example.test/events")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Endpoint URL"), {
      target: { value: "https://hooks.example.test/other" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add endpoint" }));

    expect(await screen.findByText(SIGNING_SECRET)).toBeInTheDocument();
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/webhooks", {
      url: "https://hooks.example.test/other",
      events: ["lead.captured"],
    });
    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(SIGNING_SECRET)).not.toBeInTheDocument();

    const logged = [...errorSpy.mock.calls, ...logSpy.mock.calls].flat().join(" ");
    expect(logged).not.toContain(SIGNING_SECRET);
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  test("rotates the secret, sends a test, and shows the delivery log", async () => {
    const rotated = "whsec_example_rotated_secret";
    axiosAuth.post.mockImplementation((url) => {
      if (url.endsWith("/rotate")) {
        return Promise.resolve({ data: { data: endpoint, secret: rotated, note: "Store this signing secret now." } });
      }
      if (url.endsWith("/test")) return Promise.resolve({ data: { data: { id: "del_example_2", status: "queued" } } });
      return Promise.reject(new Error(`unexpected ${url}`));
    });

    renderPage();
    expect(await screen.findByRole("button", { name: "Send test" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rotate secret" }));
    expect(await screen.findByText(rotated)).toBeInTheDocument();
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/webhooks/wh_example_1/rotate");
    fireEvent.click(screen.getByRole("button", { name: "I have stored this" }));
    expect(screen.queryByText(rotated)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send test" }));
    await waitFor(() => expect(axiosAuth.post).toHaveBeenCalledWith("/api/developer/webhooks/wh_example_1/test"));
    expect(toast.success).toHaveBeenCalledWith("Test delivery queued.");

    fireEvent.click(screen.getByRole("button", { name: "Delivery log" }));
    expect(await screen.findByText("succeeded")).toBeInTheDocument();
    expect(screen.getByText("204")).toBeInTheDocument();
    expect(axiosAuth.get).toHaveBeenCalledWith("/api/developer/webhooks/wh_example_1/deliveries");
  });
});
