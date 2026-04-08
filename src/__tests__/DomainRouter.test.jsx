import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { portfolioApi } from "../api/portfolioApi.js";

jest.mock("../utils/windowHost.js", () => ({
  getBrowserHostname: jest.fn(() => "localhost"),
}));

jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    __esModule: true,
    default: {
      ...actual.default,
      get: jest.fn(),
    },
  };
});

jest.mock("../api/portfolioApi.js", () => ({
  portfolioApi: {
    getById: jest.fn(),
  },
}));

jest.mock("../components/WidgetOverlay/WidgetOverlay.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="widget-overlay" />,
}));

jest.mock("../components/PortfolioRenderer.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="portfolio-renderer">Renderer</div>,
}));

jest.mock("../components/PortfolioEditor.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="portfolio-editor">Editor</div>,
}));

import { getBrowserHostname } from "../utils/windowHost.js";
import DomainRouter from "../utils/DomainRouter.jsx";

describe("DomainRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockReset();
    portfolioApi.getById.mockReset();
    getBrowserHostname.mockReturnValue("localhost");
  });

  test("renders children on localhost without calling domain lookup", async () => {
    render(
      <MemoryRouter>
        <DomainRouter>
          <div data-testid="main-app">App</div>
        </DomainRouter>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("main-app")).toBeInTheDocument();
    });
    expect(axios.get).not.toHaveBeenCalled();
  });

  test("shows not-found message when domain lookup returns 404", async () => {
    getBrowserHostname.mockReturnValue("unknown.custom.test");

    const err = new Error("Request failed");
    err.isAxiosError = true;
    err.response = { status: 404 };
    err.config = { url: "http://localhost:5001/domainRouter/domainLookup?domain=unknown.custom.test" };
    axios.get.mockRejectedValue(err);

    render(
      <MemoryRouter>
        <DomainRouter>
          <div data-testid="main-app">App</div>
        </DomainRouter>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("This domain is not connected to a portfolio.")
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId("main-app")).toBeNull();
  });

  test("renders portfolio route when lookup and getById succeed", async () => {
    getBrowserHostname.mockReturnValue("mapped.custom.test");

    axios.get.mockResolvedValue({
      data: { portfolioId: "507f1f77bcf86cd799439011", portfolioType: "agent" },
    });
    portfolioApi.getById.mockResolvedValue({
      data: {
        _id: "507f1f77bcf86cd799439011",
        template: "agent",
        sections: [{ type: "summary", order: 0, data: {} }],
      },
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DomainRouter>
          <div data-testid="main-app">App</div>
        </DomainRouter>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("portfolio-renderer")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("main-app")).toBeNull();
    expect(portfolioApi.getById).toHaveBeenCalledWith("507f1f77bcf86cd799439011", {
      headers: { "X-Portfolio-Domain-Host": "mapped.custom.test" },
    });
  });

  test("shows portfolio_unavailable when lookup succeeds but getById returns 404", async () => {
    getBrowserHostname.mockReturnValue("stale.custom.test");

    axios.get.mockResolvedValue({
      data: { portfolioId: "507f1f77bcf86cd799439011" },
    });
    const err = new Error("Not found");
    err.isAxiosError = true;
    err.response = { status: 404 };
    err.config = { url: "http://localhost:5001/api/portfolios/507f1f77bcf86cd799439011" };
    portfolioApi.getById.mockRejectedValue(err);

    render(
      <MemoryRouter>
        <DomainRouter>
          <div data-testid="main-app">App</div>
        </DomainRouter>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("This portfolio is not available.")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("main-app")).toBeNull();
  });
});
