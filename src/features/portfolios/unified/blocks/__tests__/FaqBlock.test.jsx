import React from "react";
import { render, screen } from "@testing-library/react";
import FaqBlock from "../FaqBlock";

describe("FaqBlock", () => {
  it("renders section title and a question", () => {
    render(
      <FaqBlock
        template="agent"
        sectionTitle="FAQ"
        items={[{ question: "Pricing?", answer: "It depends." }]}
      />
    );
    expect(screen.getByRole("heading", { name: /^faq$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pricing\?/i })).toBeInTheDocument();
    expect(screen.getByText(/it depends/i)).toBeInTheDocument();
  });

  it("renders default placeholder when items empty", () => {
    render(<FaqBlock template="agent" items={[]} />);
    expect(
      screen.getByRole("heading", { name: /add a common question/i })
    ).toBeInTheDocument();
  });
});
