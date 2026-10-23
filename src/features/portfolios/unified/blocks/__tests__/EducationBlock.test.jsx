import React from "react";
import { render, screen } from "@testing-library/react";
import EducationBlock from "../EducationBlock";

describe("EducationBlock", () => {
  it("returns null when no items and template is not PM-style", () => {
    const { container } = render(
      <EducationBlock template="healthcare" items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows placeholder for agent when items empty", () => {
    render(<EducationBlock template="agent" items={[]} />);
    expect(
      screen.getByText(/list studies, certifications/i)
    ).toBeInTheDocument();
  });

  it("renders school name when items provided", () => {
    render(
      <EducationBlock
        template="agent"
        items={[{ school: "State University", fieldOfStudy: "CS" }]}
      />
    );
    expect(screen.getByRole("heading", { name: /state university/i })).toBeInTheDocument();
  });
});
