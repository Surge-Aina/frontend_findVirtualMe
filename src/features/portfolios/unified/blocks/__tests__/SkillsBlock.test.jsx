import React from "react";
import { render, screen } from "@testing-library/react";
import SkillsBlock from "../SkillsBlock";

describe("SkillsBlock", () => {
  it("returns null when no items and template is not PM-style", () => {
    const { container } = render(
      <SkillsBlock template="healthcare" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows empty placeholder for agent when items empty", () => {
    render(<SkillsBlock template="agent" items={[]} />);
    expect(screen.getByText(/no skills yet/i)).toBeInTheDocument();
  });

  it("renders skill chips when items provided", () => {
    render(<SkillsBlock template="agent" items={["React", "Node"]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node")).toBeInTheDocument();
  });
});
