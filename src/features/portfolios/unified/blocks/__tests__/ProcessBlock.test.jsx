import React from "react";
import { render, screen } from "@testing-library/react";
import ProcessBlock from "../ProcessBlock";

describe("ProcessBlock", () => {
  it("returns null when steps empty", () => {
    const { container } = render(
      <ProcessBlock template="agent" steps={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders custom section title and step titles", () => {
    render(
      <ProcessBlock
        template="agent"
        sectionTitle="How we work"
        steps={[{ title: "Discover", description: "Learn context" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /how we work/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /discover/i })).toBeInTheDocument();
  });
});
