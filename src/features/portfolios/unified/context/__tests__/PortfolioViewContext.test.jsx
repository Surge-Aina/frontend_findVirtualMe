import React from "react";
import { render, screen } from "@testing-library/react";
import {
  PortfolioViewProvider,
  usePortfolioView,
} from "../PortfolioViewContext";

function Consumer() {
  const v = usePortfolioView();
  if (!v) return <div data-testid="null-view">null</div>;
  return (
    <div>
      <span data-testid="pid">{v.portfolioId}</span>
      <span data-testid="tpl">{v.template}</span>
      <span data-testid="owner">{v.ownerId}</span>
      <span data-testid="title">{v.title}</span>
      <span data-testid="social">{JSON.stringify(v.socialLinks)}</span>
      <span data-testid="summary">{JSON.stringify(v.summaryData)}</span>
      <span data-testid="services">{JSON.stringify(v.servicesItems)}</span>
    </div>
  );
}

describe("PortfolioViewContext", () => {
  it("provides null when portfolio is missing", () => {
    render(
      <PortfolioViewProvider portfolio={null}>
        <Consumer />
      </PortfolioViewProvider>
    );
    expect(screen.getByTestId("null-view")).toBeInTheDocument();
  });

  it("derives summary and services from first matching sections", () => {
    const portfolio = {
      _id: "p1",
      template: "agent",
      owner: "u1",
      title: "My Site",
      socialLinks: { twitter: "https://x.com/a" },
      sections: [
        { type: "summary", order: 1, data: { headline: "H" } },
        { type: "services", order: 0, data: { items: [{ id: 1 }] } },
        { type: "summary", order: 2, data: { headline: "ignored" } },
      ],
    };

    render(
      <PortfolioViewProvider portfolio={portfolio}>
        <Consumer />
      </PortfolioViewProvider>
    );

    expect(screen.getByTestId("pid")).toHaveTextContent("p1");
    expect(screen.getByTestId("tpl")).toHaveTextContent("agent");
    expect(screen.getByTestId("owner")).toHaveTextContent("u1");
    expect(screen.getByTestId("title")).toHaveTextContent("My Site");
    expect(screen.getByTestId("social")).toHaveTextContent("twitter");
    expect(screen.getByTestId("summary")).toContainHTML("headline");
    expect(screen.getByTestId("services")).toContainHTML("1");
  });

  it("defaults socialLinks to empty object", () => {
    const portfolio = {
      _id: "p2",
      template: "handyman",
      sections: [],
    };
    render(
      <PortfolioViewProvider portfolio={portfolio}>
        <Consumer />
      </PortfolioViewProvider>
    );
    expect(screen.getByTestId("social")).toHaveTextContent("{}");
  });
});
