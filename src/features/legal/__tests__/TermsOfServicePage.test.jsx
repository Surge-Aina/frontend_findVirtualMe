import React from "react";
import { render, screen } from "@testing-library/react";
import {
  PLATFORM_TERMS_LAST_UPDATED,
  PLATFORM_TERMS_OF_SERVICE_TEXT,
} from "@/shared/legal/platformLegalContent";
import TermsOfServicePage from "../TermsOfServicePage";

describe("TermsOfServicePage", () => {
  it("renders title, last updated, and platform terms body", () => {
    const { container } = render(<TermsOfServicePage />);

    expect(
      screen.getByRole("heading", { name: /^terms of service$/i })
    ).toBeInTheDocument();
    expect(container.textContent).toContain(PLATFORM_TERMS_LAST_UPDATED);
    expect(container.textContent).toContain(
      PLATFORM_TERMS_OF_SERVICE_TEXT.trim().slice(0, 80)
    );
    expect(container.textContent).toMatch(/Acceptance/i);
  });
});
