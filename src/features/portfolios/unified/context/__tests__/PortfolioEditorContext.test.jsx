import React from "react";
import { render, screen } from "@testing-library/react";
import {
  PortfolioEditorContext,
  usePortfolioEditorId,
} from "../PortfolioEditorContext";

function IdConsumer() {
  const { portfolioId } = usePortfolioEditorId();
  return <span data-testid="pid">{portfolioId ?? "null"}</span>;
}

describe("PortfolioEditorContext", () => {
  it("defaults portfolioId to null outside provider", () => {
    render(<IdConsumer />);
    expect(screen.getByTestId("pid")).toHaveTextContent("null");
  });

  it("reads portfolioId from provider", () => {
    render(
      <PortfolioEditorContext.Provider value={{ portfolioId: "abc123" }}>
        <IdConsumer />
      </PortfolioEditorContext.Provider>
    );
    expect(screen.getByTestId("pid")).toHaveTextContent("abc123");
  });
});
