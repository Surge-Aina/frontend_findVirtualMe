import React from "react";
import { render, screen } from "@testing-library/react";
import CaseStudyBlock from "../CaseStudyBlock";

describe("CaseStudyBlock", () => {
  it("renders custom title and challenge section", () => {
    render(
      <CaseStudyBlock
        template="agent"
        title="Retail uplift"
        challenge="Legacy stack"
        solution="Cloud migration"
        outcome="40% faster"
      />
    );
    expect(screen.getByRole("heading", { name: /retail uplift/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^challenge$/i })).toBeInTheDocument();
    expect(screen.getByText(/legacy stack/i)).toBeInTheDocument();
  });

  it("renders external case study link when link is set", () => {
    render(
      <CaseStudyBlock
        template="dataScientist"
        link="https://example.com/study"
        title="DS Case"
      />
    );
    const link = screen.getByRole("link", { name: /view full case study/i });
    expect(link).toHaveAttribute("href", "https://example.com/study");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
