import React from "react";
import { render, screen } from "@testing-library/react";
import RoadmapColumn from "@/features/support/ticketing/components/RoadmapColumn";

const items = [
  { ticketID: "T1", requestType: "Bug", message: "Broken button" },
  { ticketID: "T2", requestType: "Feature", message: "Add dark mode" },
];

describe("RoadmapColumn", () => {
  it("renders title and items with default renderer", () => {
    render(<RoadmapColumn title="Integration Roadmap" items={items} />);

    const list = screen.getByRole("list", { name: /Integration Roadmap items/i });
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);

    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("Broken button")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Add dark mode")).toBeInTheDocument();
  });

  it("uses custom renderItem when provided", () => {
    const renderItem = (it) => <div data-testid={`custom-${it.ticketID}`}>{it.requestType}</div>;
    render(<RoadmapColumn title="Custom" items={items} renderItem={renderItem} />);

    expect(screen.getByTestId("custom-T1")).toHaveTextContent("Bug");
    expect(screen.getByTestId("custom-T2")).toHaveTextContent("Feature");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
