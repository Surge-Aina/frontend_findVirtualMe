import React from "react";
import { render, screen } from "@testing-library/react";
import ServicesBlock from "../ServicesBlock";

describe("ServicesBlock", () => {
  it("agent template returns null when items empty", () => {
    const { container } = render(
      <ServicesBlock template="agent" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("handyman template renders section title and service title", () => {
    render(
      <ServicesBlock
        template="handyman"
        sectionTitle="What we fix"
        items={[{ title: "Drywall", description: "Patch and paint" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /what we fix/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /drywall/i })).toBeInTheDocument();
  });

  it("healthcare default renders services grid", () => {
    render(
      <ServicesBlock
        template="healthcare"
        items={[{ title: "Checkup", description: "Annual" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /our services/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /checkup/i })).toBeInTheDocument();
  });

  it("healthcare renders image when service has image URL", () => {
    render(
      <ServicesBlock
        template="healthcare"
        items={[
          {
            title: "Scan",
            description: "MRI",
            image: "https://example.com/x.png",
          },
        ]}
      />
    );
    const img = screen.getByRole("img", { name: /scan/i });
    expect(img).toHaveAttribute("src", "https://example.com/x.png");
  });

  it("agent template renders services when items exist", () => {
    render(
      <ServicesBlock
        template="agent"
        sectionTitle="Offers"
        items={[{ title: "Audit", description: "Review", features: ["Report"] }]}
      />
    );
    expect(screen.getByRole("heading", { name: /offers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /audit/i })).toBeInTheDocument();
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  it("handyman renders bullets when present", () => {
    render(
      <ServicesBlock
        template="handyman"
        sectionTitle="Services"
        items={[{ title: "Paint", description: "Interior", bullets: ["  ", "Prep"] }]}
      />
    );
    expect(screen.getByText("Prep")).toBeInTheDocument();
  });
});
