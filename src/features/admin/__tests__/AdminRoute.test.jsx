import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminRoute from "@/features/admin/AdminRoute";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: ({ to }) => (
    <div data-testid="navigate">Redirecting to {to}</div>
  ),
}));

describe("AdminRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithAuth = (user, tokenValue = null) => {
    if (tokenValue) localStorage.setItem("token", tokenValue);

    return render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <AdminRoute>
            <div data-testid="admin-content">Admin Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("shows loading when token exists but user is null", () => {
    renderWithAuth(null, "valid-token");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to home when no token (guest)", () => {
    renderWithAuth(null, null);
    expect(screen.getByText("Redirecting to /")).toBeInTheDocument();
  });

  it("renders children when user is admin", () => {
    renderWithAuth({ role: "admin" }, "valid-token");
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("redirects when user is not admin", () => {
    renderWithAuth({ role: "user" }, "valid-token");
    expect(screen.getByText("Redirecting to /")).toBeInTheDocument();
  });
});
