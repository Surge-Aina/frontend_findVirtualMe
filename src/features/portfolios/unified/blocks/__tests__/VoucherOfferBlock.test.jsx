import { render, screen } from "@testing-library/react";
import VoucherOfferBlock from "../VoucherOfferBlock";

describe("VoucherOfferBlock", () => {
  it("shows presentation fields and never renders voucher codes", () => {
    render(
      <VoucherOfferBlock
        template="healthcare"
        sectionTitle="Welcome offer"
        userVoucherId="507f1f77bcf86cd799439011"
        description="Thanks for visiting our site."
        cta="Learn more"
        ctaUrl="https://example.test/offer"
        code="SECRET-SHOULD-NOT-APPEAR"
        voucherCode="ALSO-HIDDEN"
      />
    );

    expect(screen.getByText("Welcome offer")).toBeInTheDocument();
    expect(screen.getByText("Thanks for visiting our site.")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Learn more" });
    expect(cta).toHaveAttribute("href", "https://example.test/offer");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
    expect(document.body.textContent).not.toContain("SECRET");
    expect(document.body.textContent).not.toContain("ALSO-HIDDEN");
  });
});