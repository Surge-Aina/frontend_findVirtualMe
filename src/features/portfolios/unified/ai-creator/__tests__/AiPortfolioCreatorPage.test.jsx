import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AiPortfolioCreatorPage from "../AiPortfolioCreatorPage";
import { AuthContext } from "@/shared/context/AuthContext";
import { toast } from "react-toastify";

jest.mock("@/shared/api/portfolioApi", () => ({
  portfolioApi: {
    generateAgent: jest.fn(),
  },
}));
jest.mock("@/shared/api/axiosAuth.js", () => ({
  __esModule: true,
  default: { patch: jest.fn(() => Promise.resolve({})) },
}));
jest.mock("@/shared/utils/portfolioEditLogger", () => ({
  logPortfolioAction: jest.fn(() => Promise.resolve()),
}));
jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

import { portfolioApi } from "@/shared/api/portfolioApi";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("AiPortfolioCreatorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "tok");
    portfolioApi.generateAgent.mockResolvedValue({
      data: { portfolio: { _id: "newid", title: "AI" } },
    });
  });

  function renderPage(entryState = {}) {
    return render(
      <AuthContext.Provider
        value={{
          user: { _id: "u1", email: "a@b.com" },
          refreshUser: jest.fn(() => Promise.resolve()),
        }}
      >
        <MemoryRouter
          initialEntries={[
            { pathname: "/portfolios/create/ai", state: entryState },
          ]}
        >
          <AiPortfolioCreatorPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  }

  it("shows validation toast when prompt empty", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /create portfolio/i }));
    expect(toast.error).toHaveBeenCalledWith(
      "Enter a prompt to generate your portfolio."
    );
  });

  it("calls generateAgent and navigates to edit on success", async () => {
    renderPage();
    fireEvent.change(
      screen.getByPlaceholderText(/Example: Create a warm consulting portfolio/i),
      { target: { value: "A portfolio for a designer with contact section." } }
    );
    fireEvent.click(screen.getByRole("button", { name: /create portfolio/i }));
    await waitFor(() => {
      expect(portfolioApi.generateAgent).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/portfolios/view/newid/edit");
    });
  });

  it("requires login when token is absent", async () => {
    localStorage.removeItem("token");
    renderPage();
    fireEvent.change(
      screen.getByPlaceholderText(/Example: Create a warm consulting portfolio/i),
      { target: { value: "Some prompt" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /create portfolio/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please log in to create a portfolio.");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    localStorage.setItem("token", "tok");
  });

  it("shows unsupported-block toast with suggestions from API", async () => {
    portfolioApi.generateAgent.mockRejectedValueOnce({
      response: {
        data: {
          code: "UNSUPPORTED_BLOCK_NEED",
          details: { closestKnownBlocks: ["hero", "contact"] },
        },
      },
    });
    renderPage();
    fireEvent.change(
      screen.getByPlaceholderText(/Example: Create a warm consulting portfolio/i),
      { target: { value: "Need exotic blocks" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /create portfolio/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/hero.*contact|contact.*hero/)
      );
    });
  });

  it("applies a prompt example when an idea chip is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      screen.getByRole("button", {
        name: /Create a warm consulting portfolio for a product strategist/i,
      })
    );
    const textarea = screen.getByPlaceholderText(
      /Example: Create a warm consulting portfolio/i
    );
    expect(textarea.value).toContain("product strategist");
  });

  it("renders back link to dashboard when opened from dashboard", () => {
    renderPage({ source: "dashboard" });
    const back = screen.getByRole("link", { name: /back to dashboard/i });
    expect(back).toHaveAttribute("href", "/dashboard");
  });
});
