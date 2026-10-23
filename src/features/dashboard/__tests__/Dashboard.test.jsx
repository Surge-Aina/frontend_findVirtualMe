import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Dashboard from "../Dashboard";
import { AuthContext } from "@/shared/context/AuthContext";
import { portfolioApi } from "@/shared/api/portfolioApi.js";

const mockNavigate = jest.fn();
const mockHandleCardClick = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/shared/api/portfolioApi.js", () => ({
  portfolioApi: {
    listPublic: jest.fn(() => Promise.resolve({ data: { portfolios: [] } })),
    getMine: jest.fn(() => Promise.resolve({ data: { portfolios: [] } })),
    toggleVisibility: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/shared/utils/useHandleCardClick", () => ({
  useHandleCardClick: () => ({ handleCardClick: mockHandleCardClick }),
}));

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const authLoggedIn = {
  user: { _id: "u1", email: "a@b.com" },
  token: "t",
  refreshUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

const authLoggedOut = {
  user: null,
  token: null,
  refreshUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

function renderDashboard(auth = authLoggedIn) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    portfolioApi.listPublic.mockResolvedValue({ data: { portfolios: [] } });
    portfolioApi.getMine.mockResolvedValue({ data: { portfolios: [] } });
    portfolioApi.toggleVisibility.mockResolvedValue({ data: { success: true, visibility: "public" } });
    portfolioApi.delete.mockResolvedValue({ data: { success: true } });
  });

  it("renders headings when authenticated", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/My Portfolios/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /^Public Portfolios$/i })).toBeInTheDocument();
  });

  it("does not show My Portfolios section when logged out", async () => {
    renderDashboard(authLoggedOut);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^Public Portfolios$/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/My Portfolios/i)).not.toBeInTheDocument();
  });

  it("loads public list when listPublic fails", async () => {
    portfolioApi.listPublic.mockRejectedValueOnce(new Error("network"));
    renderDashboard(authLoggedOut);
    await waitFor(() => {
      expect(screen.getByText(/No public portfolios available yet/i)).toBeInTheDocument();
    });
  });

  it("toasts when getMine fails for logged-in user", async () => {
    portfolioApi.getMine.mockRejectedValueOnce(new Error("fail"));
    renderDashboard();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not load your portfolios");
    });
  });

  it("navigates to resume and AI create flows", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText(/Add Portfolio/i);
    await user.click(screen.getByText(/Add Portfolio/i));
    expect(mockNavigate).toHaveBeenCalledWith("/resume");

    mockNavigate.mockClear();
    await user.click(screen.getByText(/Create with AI/i));
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/create/ai", { state: { source: "dashboard" } });
  });

  it("shows empty public state when API returns no portfolios", async () => {
    renderDashboard(authLoggedOut);
    expect(await screen.findByText(/No public portfolios available yet/i)).toBeInTheDocument();
  });

  it("shows public cards and invokes handleCardClick on card click", async () => {
    portfolioApi.listPublic.mockResolvedValue({
      data: {
        portfolios: [
          {
            _id: "pub1",
            template: "handyman",
            title: "Public One",
            name: "N1",
            email: "e@e.com",
            visibility: "public",
            updatedAt: "2024-01-02",
          },
        ],
      },
    });
    renderDashboard(authLoggedOut);
    const heading = await screen.findByText("Public One");
    await userEvent.setup().click(heading.closest("div.cursor-pointer"));
    expect(mockHandleCardClick).toHaveBeenCalled();
  });

  it("filters public list by search", async () => {
    portfolioApi.listPublic.mockResolvedValue({
      data: {
        portfolios: [
          { _id: "a", template: "agent", title: "Alpha", visibility: "public", updatedAt: "2024-01-01" },
          { _id: "b", template: "handyman", title: "Beta", visibility: "public", updatedAt: "2024-01-01" },
        ],
      },
    });
    const user = userEvent.setup();
    renderDashboard(authLoggedOut);
    await screen.findByText("Alpha");
    const search = screen.getByPlaceholderText(/Name, email, ID/i);
    await user.type(search, "Beta");
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows no match message when public search filters everything", async () => {
    portfolioApi.listPublic.mockResolvedValue({
      data: {
        portfolios: [{ _id: "x", template: "t", title: "Only", visibility: "public" }],
      },
    });
    const user = userEvent.setup();
    renderDashboard(authLoggedOut);
    await screen.findByText("Only");
    await user.type(screen.getByPlaceholderText(/Name, email, ID/i), "zzz");
    expect(screen.getByText(/No portfolios match your search or filters/i)).toBeInTheDocument();
  });

  it("toggles visibility and refreshes lists on success", async () => {
    portfolioApi.listPublic
      .mockResolvedValueOnce({ data: { portfolios: [] } })
      .mockResolvedValueOnce({ data: { portfolios: [] } });
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "p1", template: "handyman", title: "Mine", visibility: "private", isPublic: false }],
      },
    });
    portfolioApi.toggleVisibility.mockResolvedValue({ data: { success: true, visibility: "public" } });

    renderDashboard();
    const mySection = screen.getByRole("heading", { name: /^My Portfolios$/i }).closest("section");
    await within(mySection).findByText("Mine");
    const toggle = within(mySection).getByText("private").closest("div.absolute");
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(portfolioApi.toggleVisibility).toHaveBeenCalledWith("p1");
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Visibility updated");
    });
  });

  it("shows toast when toggle returns unsuccessful", async () => {
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "p1", template: "handyman", title: "Mine", visibility: "public" }],
      },
    });
    portfolioApi.toggleVisibility.mockResolvedValue({ data: { success: false } });
    renderDashboard();
    await screen.findByText("Mine");
    fireEvent.click(screen.getByText("public").closest("div.absolute"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not toggle visibility");
    });
  });

  it("deletes portfolio and calls refreshUser", async () => {
    const refreshUser = jest.fn();
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "del1", template: "handyman", title: "Delete Me", visibility: "public" }],
      },
    });
    renderDashboard({ ...authLoggedIn, refreshUser });
    await screen.findByText("Delete Me");
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    await waitFor(() => {
      expect(portfolioApi.delete).toHaveBeenCalledWith("del1");
    });
    await waitFor(() => {
      expect(refreshUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Deleted portfolio");
    });
  });

  it("shows filter-empty state when mine portfolios exist but filters exclude all", async () => {
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [
          { _id: "1", template: "handyman", title: "H", visibility: "private", updatedAt: "2024-01-01" },
        ],
      },
    });
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("H");
    const mySection = screen.getByRole("heading", { name: /my portfolios/i }).closest("section");
    const visibilitySelect = within(mySection).getByRole("combobox", { name: /visibility/i });
    await user.selectOptions(visibilitySelect, "public");
    expect(screen.getByText(/No portfolios match your search or filters/i)).toBeInTheDocument();
  });

  it("filters my portfolios to AI kind only", async () => {
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [
          { _id: "ai1", template: "agent", title: "AI P", visibility: "public" },
          { _id: "h1", template: "handyman", title: "Other", visibility: "public" },
        ],
      },
    });
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("AI P");
    const mySection = screen.getByRole("heading", { name: /my portfolios/i }).closest("section");
    const kindSelect = within(mySection).getByRole("combobox", { name: /kind/i });
    await user.selectOptions(kindSelect, "ai");
    expect(screen.getByText("AI P")).toBeInTheDocument();
    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("navigates to edit from Edit button without toggling card", async () => {
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "e1", template: "handyman", title: "Edit Card", visibility: "public" }],
      },
    });
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("Edit Card");
    await user.click(screen.getByRole("button", { name: /^Edit$/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/view/e1/edit");
  });

  it("shows toast when delete API returns unsuccessful", async () => {
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "bad", template: "handyman", title: "No Delete", visibility: "public" }],
      },
    });
    portfolioApi.delete.mockResolvedValue({ data: { success: false } });
    renderDashboard();
    await screen.findByText("No Delete");
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not delete portfolio");
    });
  });

  it("shows toast when toggle throws", async () => {
    portfolioApi.listPublic.mockResolvedValue({ data: { portfolios: [] } });
    portfolioApi.getMine.mockResolvedValue({
      data: {
        portfolios: [{ _id: "p1", template: "handyman", title: "T", visibility: "private" }],
      },
    });
    portfolioApi.toggleVisibility.mockRejectedValue({ response: { data: { error: "nope" } } });
    renderDashboard();
    const mySection = screen.getByRole("heading", { name: /^My Portfolios$/i }).closest("section");
    await within(mySection).findByText("T");
    fireEvent.click(within(mySection).getByText("private").closest("div.absolute"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("nope");
    });
  });
});
