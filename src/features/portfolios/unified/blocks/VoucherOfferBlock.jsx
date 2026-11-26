import PublicVoucherOfferCard from "@/features/vouchers/PublicVoucherOfferCard";

export default function VoucherOfferBlock({ template, ...data }) {
  const title = data.sectionTitle || data.title;
  const description = data.description;
  const cta = data.cta || data.ctaLabel;
  const ctaUrl = data.ctaUrl;

  const isPM = template === "projectManager" || template === "dataScientist" || template === "agent";
  const sectionClass = isPM ? "py-12" : "py-12 bg-white";

  return (
    <section className={sectionClass} data-testid="voucher-offer-block">
      <div className="max-w-lg mx-auto px-4">
        <PublicVoucherOfferCard
          title={title}
          description={description}
          cta={cta}
          ctaUrl={ctaUrl}
        />
      </div>
    </section>
  );
}