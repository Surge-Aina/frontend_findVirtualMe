import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PortfolioFooter from "../PortfolioFooter";

jest.mock("@/features/legal/PrivacyPolicy/PrivacyPolicyFooterLink", () => ({
  __esModule: true,
  default: ({ label, className }) => (
    <a href="/privacy" className={className}>
      {label}
    </a>
  ),
}));
jest.mock("@/features/legal/TermsOfService/TermsOfServiceFooterLink", () => ({
  __esModule: true,
  default: ({ label, className }) => (
    <a href="/terms" className={className}>
      {label}
    </a>
  ),
}));

function renderFooter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PortfolioFooter", () => {
  it("renders site map from sections and legal links", () => {
    renderFooter(
      <PortfolioFooter
        portfolioType="healthcare"
        sections={[
          { type: "hero", order: 0, visible: true },
          { type: "contact", order: 1, visible: true },
        ]}
        siteName="Acme"
      />
    );
    expect(screen.getByRole("navigation", { name: /site map/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^contact$/i })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByText(/acme\. all rights reserved/i)).toBeInTheDocument();
  });

  it("scrolls anchor target into view when behavior is scroll", () => {
    const scrollIntoView = jest.fn();
    const target = document.createElement("div");
    target.id = "contact";
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderFooter(
      <PortfolioFooter
        portfolioType="healthcare"
        sections={[{ type: "contact", order: 0, visible: true }]}
        siteMapAnchorBehavior="scroll"
      />
    );
    const link = screen.getByRole("link", { name: /^contact$/i });
    fireEvent.click(link);
    expect(scrollIntoView).toHaveBeenCalled();
    document.body.removeChild(target);
  });

  it("renders social links when provided", () => {
    renderFooter(
      <PortfolioFooter
        portfolioType="HandymanMainPortfolio"
        socialLinks={{ github: "github.com/u", linkedin: "linkedin.com/in/u" }}
      />
    );
    expect(screen.getByLabelText(/github profile/i)).toHaveAttribute("href", "https://github.com/u");
    expect(screen.getByLabelText(/linkedin profile/i)).toHaveAttribute("href", "https://linkedin.com/in/u");
  });

  it("hides branding when showBranding is false", () => {
    renderFooter(
      <PortfolioFooter portfolioType="ProjectManagerPortfolio" showBranding={false} />
    );
    expect(screen.queryByText(/powered by findvirtual\.me/i)).not.toBeInTheDocument();
  });
});
