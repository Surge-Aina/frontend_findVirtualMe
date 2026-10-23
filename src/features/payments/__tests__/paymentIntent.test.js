import axiosAuth from "@/shared/api/axiosAuth";
import { createPaymentIntent, formatCharge } from "../paymentIntent";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

describe("createPaymentIntent", () => {
  beforeEach(() => {
    axiosAuth.post.mockReset();
  });

  test("sends plan and reads amount and currency from the response", async () => {
    axiosAuth.post.mockResolvedValue({
      data: {
        clientSecret: "sec",
        id: "pi_1",
        amount: 900,
        currency: "usd",
        plan: "basic",
      },
    });

    const priced = await createPaymentIntent({ plan: "basic" });

    expect(axiosAuth.post).toHaveBeenCalledWith("/api/payments/checkout/payment-intent", {
      plan: "basic",
    });
    expect(axiosAuth.post.mock.calls[0][1]).not.toHaveProperty("amount");
    expect(priced.amount).toBe(900);
    expect(priced.currency).toBe("usd");
    expect(formatCharge(priced.amount, priced.currency)).toBe("$9.00");
  });

  test("sends priceId without an amount", async () => {
    axiosAuth.post.mockResolvedValue({
      data: { clientSecret: "sec", id: "pi_2", amount: 2900, currency: "usd", plan: "pro" },
    });

    await createPaymentIntent({ priceId: "price_pro_test" });

    expect(axiosAuth.post).toHaveBeenCalledWith("/api/payments/checkout/payment-intent", {
      priceId: "price_pro_test",
    });
  });
});
