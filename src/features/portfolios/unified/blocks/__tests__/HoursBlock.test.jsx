import React from "react";
import { render, screen } from "@testing-library/react";
import HoursBlock from "../HoursBlock";

describe("HoursBlock", () => {
  it("returns null when no hour fields are set", () => {
    const { container } = render(<HoursBlock template="agent" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders business hours when weekdays is set", () => {
    render(
      <HoursBlock template="agent" weekdays="9:00–17:00" />
    );
    expect(screen.getByRole("heading", { name: /business hours/i })).toBeInTheDocument();
    expect(screen.getByText("Weekdays")).toBeInTheDocument();
    expect(screen.getByText("9:00–17:00")).toBeInTheDocument();
  });
});
