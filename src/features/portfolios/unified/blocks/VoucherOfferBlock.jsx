import { useEffect, useState } from "react";
import axios from "axios";
import PublicVoucherOfferCard from "@/features/vouchers/PublicVoucherOfferCard";

function pickPublicVoucherMeta(payload) {
  if (!payload || typeof payload !== "object") return null;
  const def = payload.voucherId && typeof payload.voucherId === "object" ? payload.voucherId : payload;
  if (!def || typeof def !== "object") return null;
  return {
    name: typeof def.name === "string" ? def.name : undefined,
    type: typeof def.type === "string" ? def.type : undefined,
    discountAmount:
      typeof def.discountAmount === "number" ? def.discountAmount : undefined,
    discountPercentage:
      typeof def.discountPercentage === "number" ? def.discountPercentage : undefined,
  };
}

export default function VoucherOfferBlock({ template, ...data }) {
  const userVoucherId = data.userVoucherId || data.voucherId || "";
  const [voucherMeta, setVoucherMeta] = useState(null);

  useEffect(() => {
    if (!userVoucherId) {
      setVoucherMeta(null);
      return undefined;
    }
    let cancelled = false;
    const base = import.meta.env.VITE_BACKEND_API || "";
    axios
      .get(`${base}/api/vouchers/public/${userVoucherId}`)
      .then((res) => {
        if (!cancelled) setVoucherMeta(pickPublicVoucherMeta(res.data));
      })
      .catch(() => {
        if (!cancelled) setVoucherMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [userVoucherId]);

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
          voucherMeta={voucherMeta}
        />
      </div>
    </section>
  );
}