import React from "react";
import { render, screen } from "@testing-library/react";
import { PortfolioViewProvider } from "../../context/PortfolioViewContext";
import SummaryBlock from "../SummaryBlock";

const wrap = (ui, portfolio) => (
  <PortfolioViewProvider portfolio={portfolio}>{ui}</PortfolioViewProvider>
);

describe("SummaryBlock", () => {
  const basePortfolio = {
    _id: "p1",
    template: "projectManager",
    sections: [],
    socialLinks: {},
  };

  it("renders projectManager headline from data", () => {
    render(
      wrap(
        <SummaryBlock template="projectManager" name="Jane" title="Dev" bio="About me" />,
        basePortfolio
      )
    );
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Dev")).toBeInTheDocument();
  });

  it("renders dataScientist terminal layout with whoami output", () => {
    render(
      wrap(
        <SummaryBlock
          template="dataScientist"
          name="DS User"
          title="Analyst"
          bio="My bio"
        />,
        { ...basePortfolio, template: "dataScientist" }
      )
    );
    expect(screen.getByText("whoami")).toBeInTheDocument();
    expect(screen.getByText("DS User")).toBeInTheDocument();
    expect(screen.getByText("Analyst")).toBeInTheDocument();
    expect(screen.getByText("My bio")).toBeInTheDocument();
  });

  it("renders agent template with about and summary sections", () => {
    render(
      wrap(
        <SummaryBlock
          template="agent"
          name="Agent"
          title="Builder"
          bio="About agent"
          summary="Short sum"
        />,
        { ...basePortfolio, template: "agent" }
      )
    );
    expect(screen.getByRole("heading", { name: /^about$/i })).toBeInTheDocument();
    expect(screen.getByText("About agent")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^summary$/i })).toBeInTheDocument();
    expect(screen.getByText("Short sum")).toBeInTheDocument();
  });

  it("shows social Connect links when portfolio has socialLinks", () => {
    render(
      wrap(
        <SummaryBlock template="projectManager" name="Social" title="T" />,
        {
          ...basePortfolio,
          socialLinks: { github: "https://github.com/u", website: "example.com" },
        }
      )
    );
    expect(screen.getByRole("heading", { name: /connect/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^github$/i })).toHaveAttribute(
      "href",
      "https://github.com/u"
    );
    expect(screen.getByRole("link", { name: /^website$/i })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });
});
