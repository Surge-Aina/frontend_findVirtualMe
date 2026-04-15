import React from "react";
import { render, screen } from "@testing-library/react";
import { PLATFORM_PRIVACY_POLICY_LAST_UPDATED } from "@/shared/legal/platformLegalContent";
import PrivacyPolicyPage from "../PrivacyPolicyPage";

jest.mock("@/shared/legal/PlatformPrivacyPolicyEmbed", () => ({
  __esModule: true,
  default: function MockPlatformPrivacyPolicyEmbed({ minHeight }) {
    return (
      <div data-testid="privacy-embed" data-min-height={minHeight}>
        Privacy embed
      </div>
    );
  },
}));

describe("PrivacyPolicyPage", () => {
  it("renders title, last updated, and platform privacy embed", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByRole("heading", { name: /^privacy policy$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(PLATFORM_PRIVACY_POLICY_LAST_UPDATED))
    ).toBeInTheDocument();

    const embed = screen.getByTestId("privacy-embed");
    expect(embed).toHaveTextContent("Privacy embed");
    expect(embed).toHaveAttribute("data-min-height", "min-h-[75vh]");
  });
});
