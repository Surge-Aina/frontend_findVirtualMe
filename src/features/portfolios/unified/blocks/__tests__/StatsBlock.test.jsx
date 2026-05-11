import React from "react";
import { render, screen } from "@testing-library/react";
import StatsBlock from "../StatsBlock";

describe("StatsBlock", () => {
  it("returns null when showStatsSection is false", () => {
    const { container } = render(
      <StatsBlock template="healthcare" showStatsSection={false} yearsExperience={5} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when no stat values are visible", () => {
    const { container } = render(
      <StatsBlock template="healthcare" yearsExperience={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders stat label and value when data present", () => {
    render(
      <StatsBlock
        template="healthcare"
        yearsExperience={12}
        visibility={{ yearsExperience: true }}
      />
    );
    expect(screen.getByText("12+")).toBeInTheDocument();
    expect(screen.getByText("Years Experience")).toBeInTheDocument();
  });
});
