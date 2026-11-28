import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeamPage from "../TeamPage";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));
import { AuthContext } from "@/shared/context/AuthContext";
import { AccountContext } from "@/shared/context/AccountContext";

jest.mock("@/shared/config/accountTeams", () => ({
  isAccountTeamsEnabled: () => true,
}));

jest.mock("@/shared/api/accountsApi", () => ({
  accountsApi: {
    listMembers: jest.fn(() =>
      Promise.resolve({
        data: {
          members: [
            {
              id: "m1",
              userId: "u2",
              email: "editor@example.test",
              role: "editor",
              status: "active",
            },
          ],
        },
      })
    ),
    addMember: jest.fn(),
    updateMember: jest.fn(),
    removeMember: jest.fn(),
  },
}));

const authValue = {
  user: { _id: "u1", role: "customer" },
  token: "tok",
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

const accountValue = {
  accounts: [{ id: "acc1", name: "Workspace", role: "account_admin" }],
  activeAccountId: "acc1",
  activeAccount: { id: "acc1", name: "Workspace", role: "account_admin" },
  setActiveAccountId: jest.fn(),
  refreshAccounts: jest.fn(),
  loading: false,
};

describe("TeamPage", () => {
  it("renders members for account admins when teams are enabled", async () => {
    render(
      <AuthContext.Provider value={authValue}>
        <AccountContext.Provider value={accountValue}>
          <MemoryRouter>
            <TeamPage />
          </MemoryRouter>
        </AccountContext.Provider>
      </AuthContext.Provider>
    );
    expect(await screen.findByRole("heading", { name: /^Team$/i })).toBeInTheDocument();
    expect(await screen.findByText(/editor@example.test/i)).toBeInTheDocument();
  });
});