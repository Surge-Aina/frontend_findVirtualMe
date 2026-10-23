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
    window.history.pushState(
      {},
      "",
      "/success?session_id=sess_1"
    );
  });

  it("loads session and shows status", async () => {
    render(
      <AuthContext.Provider
        value={{
          refreshUser,
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
    expect(refreshUser).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
  });
});
