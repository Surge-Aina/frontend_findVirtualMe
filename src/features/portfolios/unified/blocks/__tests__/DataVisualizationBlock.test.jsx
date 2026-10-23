import React from "react";
import { render, screen } from "@testing-library/react";
import DataVisualizationBlock from "../DataVisualizationBlock";

describe("DataVisualizationBlock", () => {
  it("renders with series-based data", () => {
    render(
      <DataVisualizationBlock
        template="agent"
        chartTitle="Sales"
        data={{
          series: [
            {
              name: "A",
              values: [1, 2],
              color: "#111",
            },
          ],
          xLabels: ["Q1", "Q2"],
        }}
      />
    );
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("renders with legacy sales/revenue when series empty", () => {
    render(
      <DataVisualizationBlock
        template="agent"
        chartTitle="Legacy"
        data={{
          sales: [1, 2],
          revenue: [3, 4],
        }}
      />
    );
    expect(screen.getByText("Legacy")).toBeInTheDocument();
  });
});
