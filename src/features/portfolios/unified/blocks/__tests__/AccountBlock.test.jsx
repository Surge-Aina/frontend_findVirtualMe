import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioViewProvider } from "../../context/PortfolioViewContext";
import { PortfolioProvider } from "@/shared/context/PortfolioContext";
import AccountBlock from "../AccountBlock";

jest.mock("@/shared/api/portfolioUserApi", () => ({
  portfolioUserApi: {
    login: jest.fn(),
    signup: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
    listMyActivities: jest.fn(),
    createMyActivity: jest.fn(),
    cancelMyActivity: jest.fn(),
  },
}));

import { portfolioUserApi } from "@/shared/api/portfolioUserApi";

const healthcarePortfolio = {
  _id: "p-health-1",
  template: "healthcare",
  sections: [],
};

function renderAccountBlock(props = {}) {
  return render(
    <MemoryRouter>
      <PortfolioProvider
        initialPortfolioId="p-health-1"
        initialPortfolioType="healthcare"
      >
        <PortfolioViewProvider portfolio={healthcarePortfolio}>
          <AccountBlock
            template="healthcare"
            title="Patient Portal"
            subtitle="Sign in"
            ctaLoggedOut="Sign in"
            ctaLoggedIn="Open account"
            {...props}
          />
        </PortfolioViewProvider>
      </PortfolioProvider>
    </MemoryRouter>
  );
}

describe("AccountBlock", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("renders sign in / create account tabs when logged out", () => {
    renderAccountBlock();
    expect(screen.getByText("Patient Portal")).toBeInTheDocument();
    // Tab + submit button both read "Sign in".
    expect(screen.getAllByRole("button", { name: /^sign in$/i }).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("button", { name: /^create account$/i })
    ).toBeInTheDocument();
  });

  it("logs the user in and switches to the logged-in state", async () => {
    const user = userEvent.setup();
    portfolioUserApi.login.mockResolvedValueOnce({
      data: {
        token: "tok-123",
        user: { email: "pat@test.com", name: "Pat" },
      },
    });

    const { container } = renderAccountBlock();

    await user.type(container.querySelector('input[name="email"]'), "pat@test.com");
    await user.type(container.querySelector('input[name="password"]'), "secret123");
    await user.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(portfolioUserApi.login).toHaveBeenCalledWith({
        email: "pat@test.com",
        password: "secret123",
        portfolioType: "healthcare",
        portfolioId: "p-health-1",
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/welcome, pat/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /open account/i })).toHaveAttribute(
      "href",
      "/p/p-health-1/my-account"
    );
    expect(
      localStorage.getItem("portfolioUserToken:p-health-1")
    ).toBe("tok-123");
  });

  it("renders welcome state when a session already exists for this portfolio", () => {
    localStorage.setItem("portfolioUserToken:p-health-1", "tok-existing");
    localStorage.setItem(
      "portfolioUser:p-health-1",
      JSON.stringify({ email: "already@test.com", name: "Already" })
    );
    renderAccountBlock();
    expect(screen.getByText(/welcome, already/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("isolates sessions between portfolios", () => {
    localStorage.setItem("portfolioUserToken:other-portfolio", "other-tok");
    localStorage.setItem(
      "portfolioUser:other-portfolio",
      JSON.stringify({ email: "other@test.com", name: "Other" })
    );
    renderAccountBlock();
    expect(screen.queryByText(/welcome, other/i)).not.toBeInTheDocument();
    // Logged-out view is rendered: form + tab switcher visible.
    expect(screen.getByRole("button", { name: /^create account$/i })).toBeInTheDocument();
  });
});
