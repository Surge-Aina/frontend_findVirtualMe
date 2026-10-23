import axiosAuth from "@/shared/api/axiosAuth";

/**
 * Checkout payment intent. Send a plan name or a server price id.
 * The charged amount comes back on the response; do not send amount.
 */
export async function createPaymentIntent({ plan, priceId } = {}) {
  const body = {};
  if (priceId) body.priceId = priceId;
  else body.plan = plan;

  const { data } = await axiosAuth.post("/api/payments/checkout/payment-intent", body);
  return {
    clientSecret: data?.clientSecret,
    id: data?.id,
    amount: data?.amount,
    currency: data?.currency,
    plan: data?.plan || plan || null,
  };
}

export function formatCharge(amount, currency = "usd") {
  if (!Number.isInteger(amount)) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "usd").toUpperCase(),
    }).format(amount / 100);
  } catch {
    return null;
  }
}
