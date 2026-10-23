import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PortfolioRenderer from "../PortfolioRenderer";
import { PortfolioProvider } from "@/shared/context/PortfolioContext";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        data: { user: { username: "Owner", email: "owner@test.com" } },
      })
    ),
  },
}));

jest.mock("@/shared/api/portfolioApi", () => ({
  portfolioApi: {
    getById: jest.fn(),
  },
}));

jest.mock("../PortfolioSectionNav", () => ({
  __esModule: true,
  default: () => <nav data-testid="section-nav">Nav</nav>,
}));
jest.mock("../PortfolioFooter/PortfolioFooter", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">F</footer>,
}));
jest.mock("../WidgetOverlay/WidgetOverlay", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../blocks", () => ({
  __esModule: true,
  default: {
    hero: () => <div data-testid="hero-block">Hero</div>,
    stats: () => <div data-testid="stats-block">Stats</div>,
  },
}));

import { portfolioApi } from "@/shared/api/portfolioApi";

const ownerId = "owner-1";

const auth = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  token: null,
  refreshUser: jest.fn(),
  setUser: jest.fn(),
  setPendingFile: jest.fn(),
  pendingFile: null,
  contextLoggedIn: false,
  contextLogin: jest.fn(),
  contextLogout: jest.fn(),
};

function renderRoute(initialPath, prefetched) {
  return render(
    <AuthContext.Provider value={auth}>
      <PortfolioProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route
              path="/portfolios/view/:id"
              element={<PortfolioRenderer portfolioData={prefetched} />}
            />
          </Routes>
        </MemoryRouter>
      </PortfolioProvider>
    </AuthContext.Provider>
  );
}

describe("PortfolioRenderer", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    portfolioApi.getById.mockReset();
  });

  it("shows loading spinner when fetching by id", () => {
    portfolioApi.getById.mockReturnValue(new Promise(() => {}));
    renderRoute("/portfolios/view/abc123", null);
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders portfolio from prefetched data without calling getById", () => {
    const data = {
      _id: "p1",
      template: "handyman",
      owner: "o1",
      title: "T",
      sections: [
        { type: "hero", order: 0, data: { title: "Hi" }, visible: true },
      ],
    };
    renderRoute("/portfolios/view/p1", data);
    expect(portfolioApi.getById).not.toHaveBeenCalled();
    expect(screen.getByTestId("hero-block")).toBeInTheDocument();
  });

  it("shows error when getById fails", async () => {
    portfolioApi.getById.mockRejectedValue({
      response: { data: { error: "missing" } },
    });
    renderRoute("/portfolios/view/badid", null);
    expect(await screen.findByText(/missing/i)).toBeInTheDocument();
  });

  it("renders page banner heading when section pageBanner is enabled", () => {
    const data = {
      _id: "p1",
      template: "healthcare",
      owner: "o1",
      title: "Clinic",
      sections: [
        {
          type: "hero",
          order: 0,
          data: {
            pageBanner: { enabled: true, bannerBackground: "gradient" },
          },
          visible: true,
        },
      ],
    };
    renderRoute("/portfolios/view/p1", data);
    expect(screen.getByRole("heading", { name: /^home$/i })).toBeInTheDocument();
  });

  it("shows owner edit strip when viewer is the portfolio owner", () => {
    const authOwner = {
      ...auth,
      user: { _id: ownerId, id: ownerId },
      contextLoggedIn: true,
    };
    const data = {
      _id: "p1",
      template: "handyman",
      owner: ownerId,
      title: "Mine",
      sections: [{ type: "hero", order: 0, data: {}, visible: true }],
    };
    render(
      <AuthContext.Provider value={authOwner}>
        <PortfolioProvider>
          <MemoryRouter initialEntries={["/portfolios/view/p1"]}>
            <Routes>
              <Route
                path="/portfolios/view/:id"
                element={<PortfolioRenderer portfolioData={data} />}
              />
            </Routes>
          </MemoryRouter>
        </PortfolioProvider>
      </AuthContext.Provider>
    );
    expect(
      screen.getByRole("link", { name: /edit portfolio/i })
    ).toBeInTheDocument();
  });
});
