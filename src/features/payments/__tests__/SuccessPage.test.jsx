import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import SuccessPage from "../SuccessPage";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        data: { id: "sess_1", payment_status: "paid" },
      })
    ),
  },
}));

describe("SuccessPage", () => {
  const refreshUser = jest.fn();

  beforeEach(() => {
    refreshUser.mockClear();
    axios.get.mockClear();
    localStorage.clear();
    window.history.pushState(
      {},
      "",
      "/success?session_id=sess_1"
    );
  });

  it("loads session with the logged-in token and ignores extra fields", async () => {
    localStorage.setItem("token", "user-token");
    axios.get.mockResolvedValueOnce({
      data: {
        id: "sess_1",
        payment_status: "paid",
        status: "complete",
        customer_email: "secret@example.com",
        customer: "cus_secret",
        subscription: "sub_secret",
      },
    });

    render(
      <AuthContext.Provider
        value={{
          refreshUser,
          token: "user-token",
          user: null,
          login: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <SuccessPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/loading payment details/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/sess_1/)).toBeInTheDocument();
    });
    expect(screen.getByText(/paid/)).toBeInTheDocument();
    expect(screen.getByText(/complete/)).toBeInTheDocument();
    expect(screen.queryByText(/secret@example.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cus_secret/)).not.toBeInTheDocument();
    expect(screen.queryByText(/sub_secret/)).not.toBeInTheDocument();
    expect(refreshUser).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/payments\/checkout\/session\/sess_1$/),
      { headers: { Authorization: "Bearer user-token" } }
    );
  });
});
