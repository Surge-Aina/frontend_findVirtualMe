import React from "react";
import { render, screen } from "@testing-library/react";
import HeroBlock from "../HeroBlock";

describe("HeroBlock", () => {
  it("renders healthcare default with practice name and primary CTA", () => {
    render(
      <HeroBlock
        template="healthcare"
        practiceName="Care Clinic"
        primaryButtonText="Book"
        primaryButtonUrl="#contact"
      />
    );
    expect(screen.getByRole("heading", { name: /care clinic/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /book/i })).toHaveAttribute("href", "#contact");
  });

  it("renders projectManager variant with name and title", () => {
    render(
      <HeroBlock template="projectManager" name="Sam" title="PM" bio="Bio text" />
    );
    expect(screen.getByRole("heading", { name: /^sam$/i })).toBeInTheDocument();
    expect(screen.getByText("PM")).toBeInTheDocument();
    expect(screen.getByText("Bio text")).toBeInTheDocument();
  });

  it("renders agent variant with resolved title and default CTAs", () => {
    render(<HeroBlock template="agent" />);
    expect(
      screen.getByRole("heading", { name: /your custom portfolio/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore work/i })).toBeInTheDocument();
  });

  it("renders handyman variant with external CTA opening new tab", () => {
    render(
      <HeroBlock
        template="handyman"
        title="FixIt"
        ctaText="Book"
        ctaUrl="https://example.com/book"
      />
    );
    const link = screen.getByRole("link", { name: /book/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses same-tab link for hash CTAs", () => {
    render(
      <HeroBlock
        template="handyman"
        title="FixIt"
        ctaText="Go"
        ctaUrl="#contact"
      />
    );
    const link = screen.getByRole("link", { name: /go/i });
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("href", "#contact");
  });
});
