import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectsBlock from "../ProjectsBlock";

describe("ProjectsBlock", () => {
  it("returns null when no items and template is not PM-style", () => {
    const { container } = render(
      <ProjectsBlock template="healthcare" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows placeholder for agent when items empty", () => {
    render(<ProjectsBlock template="agent" items={[]} />);
    expect(
      screen.getByText(/add examples, offerings/i)
    ).toBeInTheDocument();
  });

  it("renders project name", () => {
    render(
      <ProjectsBlock
        template="agent"
        items={[{ name: "Alpha App", description: "A demo" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /alpha app/i })).toBeInTheDocument();
  });
});
