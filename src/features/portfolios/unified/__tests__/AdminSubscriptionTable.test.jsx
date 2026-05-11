import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubscriptionTable from "../AdminSubscriptionTable";

const baseSub = (overrides = {}) => ({
  _id: "row_1",
  subscriptionId: "sub_1",
  email: "a@b.com",
  name: "User A",
  status: "active",
  subscriptionType: "pro",
  customerId: "cus_a",
  cancelAtPeriodEnd: false,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date().toISOString(),
  ...overrides,
});

const mockGet = jest.fn(() =>
  Promise.resolve({
    data: [baseSub()],
  })
);
const mockPut = jest.fn(() => Promise.resolve({ data: {} }));
const mockPost = jest.fn(() => Promise.resolve({ data: {} }));

jest.mock("axios", () => {
  const interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
  return {
    __esModule: true,
    default: {
      get: (...a) => mockGet(...a),
      put: (...a) => mockPut(...a),
      post: (...a) => mockPost(...a),
      interceptors,
    },
  };
});

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

describe("AdminSubscriptionTable", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPut.mockClear();
    mockPost.mockClear();
    mockGet.mockImplementation(() =>
      Promise.resolve({
        data: [baseSub()],
      })
    );
    localStorage.setItem("token", "t");
  });

  it("loads subscriptions and shows email", async () => {
    render(<AdminSubscriptionTable />);
    await waitFor(() => {
      expect(screen.getAllByText("a@b.com").length).toBeGreaterThan(0);
    });
    expect(mockGet).toHaveBeenCalled();
  });

  it("shows error state when fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("network"));
    render(<AdminSubscriptionTable />);
    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });

  it("refetches when refresh is clicked", async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [
        baseSub({
          _id: "sub_x",
          subscriptionId: "sub_x",
          email: "solo@example.com",
          name: "Solo",
          customerId: "cus_1",
        }),
      ],
    });
    render(<AdminSubscriptionTable />);
    await waitFor(() => {
      expect(screen.getAllByText("solo@example.com").length).toBeGreaterThan(0);
    });
    const callsAfterLoad = mockGet.mock.calls.length;
    await user.click(screen.getByRole("button", { name: /refresh/i }));
    await waitFor(() => {
      expect(mockGet.mock.calls.length).toBeGreaterThan(callsAfterLoad);
    });
  });

  it("filters subscriptions by search and reset restores the full list", async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [
        baseSub({ _id: "r1", subscriptionId: "s1", email: "alpha@test.com", name: "A" }),
        baseSub({ _id: "r2", subscriptionId: "s2", email: "beta@test.com", name: "B" }),
      ],
    });
    render(<AdminSubscriptionTable />);
    await waitFor(() => {
      expect(screen.getAllByText("alpha@test.com").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("beta@test.com").length).toBeGreaterThan(0);

    const searchInput = screen.getByPlaceholderText(/search user by email/i);
    await user.type(searchInput, "beta");
    fireEvent.submit(searchInput.closest("form"));

    await waitFor(() => {
      expect(screen.queryByText("alpha@test.com")).not.toBeInTheDocument();
    });
    expect(screen.getAllByText("beta@test.com").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /reset/i }));
    await waitFor(() => {
      expect(screen.getAllByText("alpha@test.com").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("beta@test.com").length).toBeGreaterThan(0);
  });

  it("opens update plan modal and submits pro upgrade", async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [baseSub({ subscriptionId: "sub_plan", subscriptionType: "basic" })],
    });
    render(<AdminSubscriptionTable />);
    await waitFor(() => {
      expect(screen.getByText(/subscription management/i)).toBeInTheDocument();
    });

    await user.click(screen.getAllByTitle("Update Plan")[0]);

    expect(await screen.findByRole("heading", { name: /update subscription plan/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pro plan/i }));
    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(
        expect.stringContaining("/api/payments/subscriptions/update"),
        expect.objectContaining({ subscriptionId: "sub_plan", newPlan: "pro" })
      );
    });
  });

  it("loads payment history when history control is used", async () => {
    const user = userEvent.setup();
    mockGet.mockImplementation((url) => {
      if (String(url).includes("/subscriptions/payments/")) {
        return Promise.resolve({
          data: {
            charges: [
              {
                id: "ch_1",
                amount: 2000,
                currency: "usd",
                paid: true,
                created: 1700000000,
                amount_refunded: 0,
                status: "succeeded",
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: [baseSub({ customerId: "cus_hist", subscriptionId: "sub_h" })],
      });
    });

    render(<AdminSubscriptionTable />);
    await waitFor(() => {
      expect(screen.getAllByText("a@b.com").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByTitle("View Payment History")[0]);

    expect(await screen.findByRole("heading", { name: /payment history/i })).toBeInTheDocument();
    expect(screen.getByText("ch_1")).toBeInTheDocument();
  });
});
