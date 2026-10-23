import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PortfolioCard from "../PortfolioCard";

describe("PortfolioCard", () => {
  it("renders add card and calls onAdd", () => {
    const onAdd = jest.fn();
    render(<PortfolioCard onAdd={onAdd} />);
    fireEvent.click(screen.getByText(/add portfolio/i));
    expect(onAdd).toHaveBeenCalled();
  });

  it("renders portfolio summary", () => {
    render(
      <PortfolioCard
        portfolio={{ name: "P1", description: "Desc" }}
      />
    );
    expect(screen.getByText("P1")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });
});
