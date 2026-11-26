import { sanitizeHttpHref } from "../portfolios/unified/blocks/featureUrlUtils";

/**
 * Public marketing card for voucher offers (presentation fields only — never codes).
 */
export default function PublicVoucherOfferCard({
  title,
  description,
  cta,
  ctaUrl,
  voucherMeta = null,
  className = "",
}) {
  const safeCtaUrl = sanitizeHttpHref(ctaUrl);
  const headline = title || voucherMeta?.name || "Special offer";
  const body =
    description ||
    (voucherMeta?.type === "free_domain" && voucherMeta?.discountAmount
      ? `Save up to $${voucherMeta.discountAmount} on your domain.`
      : "");

  if (!headline && !body && !cta) return null;

  return (
    <article
      className={`rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 ${className}`}
      data-testid="public-voucher-offer-card"
    >
      {headline ? (
        <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">{headline}</h2>
      ) : null}
      {body ? (
        <p className="mt-3 text-sm text-amber-900/90 dark:text-amber-100/80">{body}</p>
      ) : null}
      {cta && safeCtaUrl ? (
        <a
          href={safeCtaUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          {cta}
        </a>
      ) : null}
    </article>
  );
}