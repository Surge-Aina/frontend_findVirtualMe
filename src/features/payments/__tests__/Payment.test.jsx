import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axiosAuth from "@/shared/api/axiosAuth";
import Payment from "../Payment";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  authFailureMessage: (error) => {
    const status = error?.response?.status;
    if (status === 401) return "Please sign in to continue.";
    if (status === 403) return "You do not have permission to do that.";
    return null;
  },
}));

describe("Payment", () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    axiosAuth.post.mockReset();
  });

  afterEach(() => {
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("alerts for free tier without posting checkout", () => {
    render(<Payment />);
    fireEvent.click(screen.getAllByText("Get Started")[0]);
    expect(alertSpy).toHaveBeenCalled();
    expect(axiosAuth.post).not.toHaveBeenCalled();
  });

  it("prices a plan from the payment-intent response and still opens checkout", async () => {
    axiosAuth.post.mockImplementation((url) => {
      if (String(url).includes("payment-intent")) {
        return Promise.resolve({
          data: {
            clientSecret: "sec",
            id: "pi_1",
            amount: 900,
            currency: "usd",
            plan: "basic",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Payment />);
    fireEvent.click(screen.getAllByText("Get Started")[1]);

    await waitFor(() => {
      expect(axiosAuth.post).toHaveBeenCalledWith("/api/payments/checkout/payment-intent", {
        plan: "basic",
      });
    });

    const intentBody = axiosAuth.post.mock.calls.find((call) =>
      String(call[0]).includes("payment-intent")
    )[1];
    expect(intentBody).not.toHaveProperty("amount");
    expect(axiosAuth.post).toHaveBeenCalledWith("/api/payments/checkout/session", { plan: "basic" });
    expect(await screen.findAllByText("$9.00")).not.toHaveLength(0);
  });

  it("continues to checkout when the current payment-intent route rejects a plan-only body", async () => {
    axiosAuth.post.mockImplementation((url) => {
      if (String(url).includes("payment-intent")) {
        return Promise.reject({ response: { status: 400, data: { error: "Invalid order" } } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Payment />);
    fireEvent.click(screen.getAllByText("Get Started")[1]);

    await waitFor(() => {
      expect(axiosAuth.post).toHaveBeenCalledWith("/api/payments/checkout/session", {
        plan: "basic",
      });
    });
    const intentBody = axiosAuth.post.mock.calls.find((call) =>
      String(call[0]).includes("payment-intent")
    )[1];
    expect(intentBody).toEqual({ plan: "basic" });
  });
});
