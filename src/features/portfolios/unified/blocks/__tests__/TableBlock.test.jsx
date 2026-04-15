import React from "react";
import { render, screen } from "@testing-library/react";
import TableBlock from "../TableBlock";

describe("TableBlock", () => {
  it("shows empty state when tableData empty", () => {
    render(
      <TableBlock template="agent" sectionTitle="Metrics" tableData={[]} />
    );
    expect(screen.getByRole("heading", { name: /metrics/i })).toBeInTheDocument();
    expect(screen.getByText(/add rows in the portfolio editor/i)).toBeInTheDocument();
  });

  it("renders table headers and cell values from rows", () => {
    render(
      <TableBlock
        template="agent"
        sectionTitle="Report"
        tableData={[{ name: "Row A", value: 42 }]}
      />
    );
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /value/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /row a/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "42" })).toBeInTheDocument();
  });

  it("renders cards layout when displayMode is cards", () => {
    render(
      <TableBlock
        template="agent"
        sectionTitle="Cards"
        tableData={[{ label: "A", status: "done" }]}
        displayMode="cards"
      />
    );
    expect(screen.getByRole("heading", { name: /cards/i })).toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
  });

  it("renders link cells for URL-like values", () => {
    render(
      <TableBlock
        template="agent"
        sectionTitle="Links"
        tableData={[{ website: "https://example.com", buttonText: "Open" }]}
      />
    );
    const link = screen.getByRole("link", { name: /open/i });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("shows inactive label when isActive is false", () => {
    render(
      <TableBlock
        template="dataScientist"
        sectionTitle="DS"
        tableData={[{ x: 1 }]}
        isActive={false}
      />
    );
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it("renders percentage column with bar when value is numeric", () => {
    render(
      <TableBlock
        template="agent"
        sectionTitle="Progress"
        tableData={[{ progress: 40 }]}
        columns={[{ key: "progress", label: "Progress", type: "percentage" }]}
      />
    );
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
});
