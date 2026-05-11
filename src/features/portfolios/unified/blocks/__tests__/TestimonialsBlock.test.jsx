import React from "react";
import { render, screen } from "@testing-library/react";
import TestimonialsBlock from "../TestimonialsBlock";

describe("TestimonialsBlock", () => {
  it("returns null when items empty", () => {
    const { container } = render(
      <TestimonialsBlock template="agent" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders quote and author for agent template", () => {
    render(
      <TestimonialsBlock
        template="agent"
        items={[
          {
            quote: "Excellent work.",
            name: "Jamie",
            service: "Consulting",
          },
        ]}
      />
    );
    expect(screen.getByRole("heading", { name: /what our clients say/i })).toBeInTheDocument();
    expect(screen.getByText(/excellent work/i)).toBeInTheDocument();
    expect(screen.getByText(/jamie/i)).toBeInTheDocument();
  });
});
