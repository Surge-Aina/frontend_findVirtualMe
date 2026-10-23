import React from "react";
import { render, screen } from "@testing-library/react";
import PlatformPrivacyPolicyEmbed from "../PlatformPrivacyPolicyEmbed";

/** Global Jest mapper serves empty string for `*.html?raw` — tests empty-state UI. */
describe("PlatformPrivacyPolicyEmbed", () => {
  it("shows placeholder when bundled HTML is empty", () => {
    render(<PlatformPrivacyPolicyEmbed />);
    expect(
      screen.getByText(/privacy policy file is empty or not saved/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/termlyPrivacyPolicy\.html/)).toBeInTheDocument();
  });

  it("applies className and minHeight to empty state container", () => {
    const { container } = render(
      <PlatformPrivacyPolicyEmbed className="extra" minHeight="min-h-[50vh]" />
    );
    const box = container.firstChild;
    expect(box).toHaveClass("extra");
    expect(box).toHaveClass("min-h-[50vh]");
  });
});
