import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import {
  PortfolioContext,
  defaultPortfolioContextValue,
} from "@/shared/context/PortfolioContext";
import { PLATFORM_TERMS_OF_SERVICE_TEXT } from "@/shared/legal/platformLegalContent";
import TermsOfServiceFooterLink from "../TermsOfService/TermsOfServiceFooterLink";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
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

describe("TermsOfServiceFooterLink", () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it("opens dialog with platform terms and close control", async () => {
    const user = userEvent.setup();
    renderWithPortfolio(<TermsOfServiceFooterLink />);

    await user.click(
      screen.getByRole("button", { name: /view terms of service/i })
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: /^terms of service$/i })
    ).toBeInTheDocument();
    expect(dialog.textContent).toContain(
      PLATFORM_TERMS_OF_SERVICE_TEXT.trim().slice(0, 60)
    );
  });

  it("does not fetch portfolio terms when portfolio context is missing", async () => {
    const user = userEvent.setup();
    renderWithPortfolio(<TermsOfServiceFooterLink />);

    await user.click(
      screen.getByRole("button", { name: /view terms of service/i })
    );
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("loads and shows portfolio-specific terms when portfolio is set", async () => {
    axios.get.mockResolvedValue({
      data: {
        name: "Custom ToS",
        termsOfServiceText: "Portfolio-specific terms body.",
      },
    });

    const user = userEvent.setup();
    renderWithPortfolio(<TermsOfServiceFooterLink />, {
      portfolioId: "p1",
      portfolioType: "agent",
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/legal\/terms-of-service\/public\/byPortfolio$/),
        expect.objectContaining({
          params: { portfolioId: "p1", type: "Portfolio" },
        })
      );
    });

    await user.click(
      screen.getByRole("button", { name: /view terms of service/i })
    );

    expect(
      screen.getByText("Portfolio-specific terms body.")
    ).toBeInTheDocument();
    expect(screen.getByText(/custom tos/i)).toBeInTheDocument();
  });

  it("treats 404 as no portfolio terms without surfacing an error", async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });

    const user = userEvent.setup();
    renderWithPortfolio(<TermsOfServiceFooterLink />, {
      portfolioId: "p1",
      portfolioType: "projectManager",
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await user.click(
      screen.getByRole("button", { name: /view terms of service/i })
    );

    expect(
      screen.queryByText(/portfolio-specific terms of service could not be loaded/i)
    ).not.toBeInTheDocument();
  });

  it("shows error when portfolio terms request fails with non-404", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValue({ response: { status: 502 } });

    const user = userEvent.setup();
    try {
      renderWithPortfolio(<TermsOfServiceFooterLink />, {
        portfolioId: "p1",
        portfolioType: "agent",
      });

      await waitFor(() => expect(axios.get).toHaveBeenCalled());

      await user.click(
        screen.getByRole("button", { name: /view terms of service/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/portfolio-specific terms of service could not be loaded/i)
        ).toBeInTheDocument();
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
