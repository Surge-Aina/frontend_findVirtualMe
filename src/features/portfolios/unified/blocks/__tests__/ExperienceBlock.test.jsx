import React from "react";
import { render, screen } from "@testing-library/react";
import ExperienceBlock from "../ExperienceBlock";

describe("ExperienceBlock", () => {
  it("returns null when no items and template is not PM-style", () => {
    const { container } = render(
      <ExperienceBlock template="healthcare" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows placeholder for agent when items empty", () => {
    render(<ExperienceBlock template="agent" items={[]} />);
    expect(
      screen.getByText(/add roles, engagements/i)
    ).toBeInTheDocument();
  });

  it("renders job title and company", () => {
    render(
      <ExperienceBlock
        template="agent"
        items={[{ title: "Lead", company: "Contoso" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /^lead$/i })).toBeInTheDocument();
    expect(screen.getByText(/contoso/i)).toBeInTheDocument();
  });
});
