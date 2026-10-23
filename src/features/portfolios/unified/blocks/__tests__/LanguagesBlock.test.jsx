import React from "react";
import { render, screen } from "@testing-library/react";
import LanguagesBlock from "../LanguagesBlock";

describe("LanguagesBlock", () => {
  it("renders language name and proficiency", () => {
    render(
      <LanguagesBlock
        template="agent"
        sectionTitle="Languages"
        items={[{ name: "Spanish", proficiency: "Fluent" }]}
      />
    );
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("Fluent")).toBeInTheDocument();
  });

  it("renders default chip when items empty", () => {
    render(<LanguagesBlock template="agent" items={[]} />);
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Proficiency")).toBeInTheDocument();
  });
});
