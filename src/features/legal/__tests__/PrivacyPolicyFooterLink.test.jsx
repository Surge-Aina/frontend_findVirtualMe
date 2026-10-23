import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import {
  PortfolioContext,
  defaultPortfolioContextValue,
} from "@/shared/context/PortfolioContext";
import PrivacyPolicyFooterLink from "../PrivacyPolicy/PrivacyPolicyFooterLink";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("@/shared/legal/PlatformPrivacyPolicyEmbed", () => ({
  __esModule: true,
  default: function MockEmbed() {
    return <div data-testid="platform-privacy-embed">Platform policy</div>;
  },
}));

function renderWithPortfolio(ui, overrides = {}) {
  return render(
    <PortfolioContext.Provider
      value={{
        ...defaultPortfolioContextValue,
        ...overrides,
      }}
    >
      {ui}
    </PortfolioContext.Provider>
  );
}

describe("PrivacyPolicyFooterLink", () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it("opens modal with platform embed and default label", async () => {
    const user = userEvent.setup();
    renderWithPortfolio(<PrivacyPolicyFooterLink />);

    await user.click(screen.getByRole("button", { name: /^privacy policy$/i }));

    expect(screen.getByRole("heading", { name: /^privacy policy$/i })).toBeInTheDocument();
    expect(screen.getByTestId("platform-privacy-embed")).toBeInTheDocument();
  });

  it("does not fetch portfolio policy when portfolio context is missing", async () => {
    const user = userEvent.setup();
    renderWithPortfolio(<PrivacyPolicyFooterLink />);

    await user.click(screen.getByRole("button", { name: /^privacy policy$/i }));
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("loads and shows portfolio-specific policy when portfolio is set", async () => {
    axios.get.mockResolvedValue({
      data: {
        name: "Seller policy",
        privacyPolicyText: "Custom privacy text for this portfolio.",
      },
    });

    const user = userEvent.setup();
    renderWithPortfolio(<PrivacyPolicyFooterLink />, {
      portfolioId: "p1",
      portfolioType: "agent",
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/legal\/privacy-policy\/public\/byPortfolio$/),
        expect.objectContaining({
          params: { portfolioId: "p1", type: "Portfolio" },
        })
      );
    });

    await user.click(screen.getByRole("button", { name: /^privacy policy$/i }));

    expect(
      screen.getByText("Custom privacy text for this portfolio.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /seller policy/i })
    ).toBeInTheDocument();
  });

  it("treats 404 as no portfolio policy without surfacing an error", async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });

    const user = userEvent.setup();
    renderWithPortfolio(<PrivacyPolicyFooterLink />, {
      portfolioId: "p1",
      portfolioType: "handyman",
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /^privacy policy$/i }));

    expect(
      screen.queryByText(/portfolio-specific privacy policy could not be loaded/i)
    ).not.toBeInTheDocument();
  });

  it("shows error when portfolio policy request fails with non-404", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValue({ response: { status: 500 } });

    const user = userEvent.setup();
    try {
      renderWithPortfolio(<PrivacyPolicyFooterLink />, {
        portfolioId: "p1",
        portfolioType: "agent",
      });

      await waitFor(() => expect(axios.get).toHaveBeenCalled());

      await user.click(screen.getByRole("button", { name: /^privacy policy$/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/portfolio-specific privacy policy could not be loaded/i)
        ).toBeInTheDocument();
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
