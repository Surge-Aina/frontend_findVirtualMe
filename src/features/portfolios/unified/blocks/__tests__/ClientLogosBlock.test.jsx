import React from "react";
import { render, screen } from "@testing-library/react";
import ClientLogosBlock from "../ClientLogosBlock";

describe("ClientLogosBlock", () => {
  it("renders logo image when logoUrl provided", () => {
    render(
      <ClientLogosBlock
        template="agent"
        sectionTitle="Partners"
        items={[{ name: "Acme", logoUrl: "https://example.com/logo.png" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /partners/i })).toBeInTheDocument();
    const img = screen.getByRole("img", { name: /acme/i });
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("wraps logo in external link when url provided", () => {
    render(
      <ClientLogosBlock
        items={[{ name: "Beta", logoUrl: "https://example.com/b.png", url: "https://beta.example" }]}
      />
    );
    const link = screen.getByRole("link", { name: /beta/i });
    expect(link).toHaveAttribute("href", "https://beta.example");
  });
});
