import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WidgetOverlay from "../WidgetOverlay";

const mockUsePortfolio = jest.fn();

jest.mock("@/shared/context/PortfolioContext", () => ({
  usePortfolio: () => mockUsePortfolio(),
}));

jest.mock("../../Widgets/ContactMe/ContactMeWidget", () => ({
  __esModule: true,
  default: () => <div data-testid="contact-widget">Contact</div>,
}));
jest.mock("../../Widgets/QRCode/QRCodeWidget", () => ({
  __esModule: true,
  default: () => <div data-testid="qr-widget">QR</div>,
}));

const authValue = {
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

const authWithPortfolio = {
  ...authValue,
  user: {
    portfolios: [{ portfolioId: "pid1" }],
  },
};

import { AuthContext } from "@/shared/context/AuthContext";

function renderOverlay(providerValue = authValue) {
  return render(
    <AuthContext.Provider value={providerValue}>
      <WidgetOverlay />
    </AuthContext.Provider>
  );
}

describe("WidgetOverlay", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockUsePortfolio.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null when portfolioId is missing", () => {
    mockUsePortfolio.mockReturnValue({
      portfolioId: null,
      portfolioType: null,
      portfolioOwner: {},
      isOwnerReady: false,
    });
    const { container } = renderOverlay();
    expect(container.firstChild).toBeNull();
  });

  it("renders floating toggle when portfolioId is set", () => {
    mockUsePortfolio.mockReturnValue({
      portfolioId: "pid1",
      portfolioType: "agent",
      portfolioOwner: { email: "a@b.com", name: "Owner" },
      isOwnerReady: true,
    });
    const { container } = renderOverlay();
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("opens backdrop and shows widget mocks when toggle is activated", async () => {
    const user = userEvent.setup();
    mockUsePortfolio.mockReturnValue({
      portfolioId: "pid1",
      portfolioType: "agent",
      portfolioOwner: { email: "a@b.com", name: "Owner" },
      isOwnerReady: true,
    });
    renderOverlay(authWithPortfolio);
    const toggle = screen.getByRole("button");
    await user.click(toggle);
    expect(document.querySelector('[class*="backdrop-blur"]')).toBeTruthy();
    expect(screen.getByTestId("contact-widget")).toBeInTheDocument();
    expect(screen.getByTestId("qr-widget")).toBeInTheDocument();
  });

  it("closes overlay when backdrop is clicked", async () => {
    const user = userEvent.setup();
    mockUsePortfolio.mockReturnValue({
      portfolioId: "pid1",
      portfolioType: "agent",
      portfolioOwner: { email: "o@o.com", name: "O" },
      isOwnerReady: true,
    });
    renderOverlay();
    await user.click(screen.getByRole("button"));
    const backdrop = document.querySelector('[class*="backdrop-blur"]');
    expect(backdrop).toBeTruthy();
    await user.click(backdrop);
    expect(document.querySelector('[class*="backdrop-blur"]')).toBeFalsy();
  });
});
