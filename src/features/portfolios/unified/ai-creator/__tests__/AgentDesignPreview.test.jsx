import React from "react";
import { render, screen } from "@testing-library/react";
import { AgentDesignPreview } from "../AgentDesignPreview";

describe("AgentDesignPreview", () => {
  it("renders look preview label", () => {
    render(
      <AgentDesignPreview themeId="aurora" themeTokens={{}} layoutMode="stacked" />
    );
    expect(screen.getByText(/look preview/i)).toBeInTheDocument();
  });

  it("renders single section mini when layoutMode is singleSection", () => {
    const { container } = render(
      <AgentDesignPreview
        themeId="aurora"
        themeTokens={{}}
        layoutMode="singleSection"
      />
    );
    expect(container.querySelector('[style*="var(--agent-page)"]')).toBeTruthy();
  });
});
