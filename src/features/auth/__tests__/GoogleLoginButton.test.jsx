import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleLoginButton from "../GoogleLoginButton";
import { AuthContext, defaultAuthContextValue } from "@/shared/context/AuthContext";

jest.mock("@react-oauth/google", () => ({
  __esModule: true,
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: ({ onSuccess }) => (
    <button
      type="button"
      data-testid="google-login-mock"
      onClick={() => onSuccess({ credential: "mock-google-jwt" })}
    >
      Sign in with Google
    </button>
  ),
  googleLogout: jest.fn(),
}));

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("GoogleLoginButton", () => {
  const setUserAfterLogin = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithProviders(ui) {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ ...defaultAuthContextValue, setUserAfterLogin }}>
          {ui}
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  it("posts credential to backend, updates auth, toasts, and navigates to profile", async () => {
    axios.post.mockResolvedValue({
      data: { isNewUser: false, user: { id: "u1" } },
    });

    renderWithProviders(<GoogleLoginButton />);

    await userEvent.click(screen.getByTestId("google-login-mock"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/auth\/google$/),
        { idToken: "mock-google-jwt" }
      );
    });

    expect(setUserAfterLogin).toHaveBeenCalledWith(
      expect.objectContaining({ isNewUser: false, user: { id: "u1" } })
    );
    expect(toast.success).toHaveBeenCalledWith("Logged In with Google!");
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("shows new-user toast when isNewUser is true", async () => {
    axios.post.mockResolvedValue({
      data: { isNewUser: true, user: { id: "u2" } },
    });

    renderWithProviders(<GoogleLoginButton />);
    await userEvent.click(screen.getByTestId("google-login-mock"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Created profile with Google!");
    });
  });

  it("calls onClose after successful login when provided", async () => {
    axios.post.mockResolvedValue({ data: { isNewUser: false, user: {} } });

    renderWithProviders(<GoogleLoginButton onClose={onClose} />);
    await userEvent.click(screen.getByTestId("google-login-mock"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("toasts API error message on failure", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid token" } },
    });

    renderWithProviders(<GoogleLoginButton />);
    await userEvent.click(screen.getByTestId("google-login-mock"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid token");
    });
  });

  it("toasts generic message when error has no response message", async () => {
    axios.post.mockRejectedValue(new Error("network"));

    renderWithProviders(<GoogleLoginButton />);
    await userEvent.click(screen.getByTestId("google-login-mock"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Login failed");
    });
  });
});
