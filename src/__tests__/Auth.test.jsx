import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Auth from "@/features/auth/Auth";
import { AuthContext } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// mocks
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("Auth Component", () => {
  let mockLogin, mockLogout, mockNavigate, mockOnClose;

  const renderAuth = (ctxValue = {}) => {
    return render(
      <AuthContext.Provider
        value={{
          login: mockLogin,
          logout: mockLogout,
          user: null,
          ...ctxValue,
        }}
      >
        <Auth onClose={mockOnClose} />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    mockLogin = jest.fn();
    mockLogout = jest.fn();
    mockOnClose = jest.fn();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  //test cases
  test("renders login UI correctly", () => {
    renderAuth();

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Sign in to manage your portfolio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("typing updates email and password fields", () => {
    renderAuth();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });

    expect(emailInput.value).toBe("test@test.com");
    expect(passwordInput.value).toBe("1234");
  });

  test("successful login calls login(), onClose(), and navigates", async () => {
    mockLogin.mockResolvedValueOnce();

    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  test("failed login shows error message", async () => {
    mockLogin.mockRejectedValueOnce(new Error("fail"));

    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "wrong" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad" } });

    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form"));

    expect(await screen.findByText("Invalid Credentials")).toBeInTheDocument();
  });

  test("clicking backdrop calls onClose", () => {
    renderAuth();

    fireEvent.click(screen.getByTestId("backdrop") || screen.getByRole("presentation"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("clicking inside modal content does NOT close modal", () => {
    renderAuth();

    fireEvent.click(screen.getByRole("heading", { name: /welcome/i }));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows Sign Out button when user exists", () => {
    renderAuth({
      user: { email: "abc@xyz.com" },
    });

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  test("clicking Sign Out calls logout() and navigates home", () => {
    renderAuth({
      user: { email: "abc@xyz.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("clicking Sign Up triggers onClose and navigates to onboarding", () => {
    renderAuth();

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding");
  });

  test("loading state shows 'Processing...'", async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 200)));

    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "x@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  test("sets loading=false after failed login", async () => {
    mockLogin.mockRejectedValueOnce(new Error("fail"));

    renderAuth();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // loading text shows first
    expect(screen.getByText("Processing...")).toBeInTheDocument();

    // wait for the error
    await screen.findByText("Invalid Credentials");

    // now check loading resets
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  test("logout clears form inputs", () => {
    renderAuth({ user: { email: "abc@xyz.com" } });

    // manually fill form before logging out
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "something@old.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "oldpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(screen.getByLabelText("Email").value).toBe("");
    expect(screen.getByLabelText("Password").value).toBe("");
  });

  test("sign up click does not retain old input values", () => {
    const { unmount } = renderAuth();

    // fill inputs
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "temp@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });

    // click Sign Up, triggers onClose
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(mockOnClose).toHaveBeenCalled();

    // simulate modal closing by unmounting component
    unmount();

    // simulate re-opening modal by rendering again
    renderAuth();

    expect(screen.getByLabelText("Email").value).toBe("");
    expect(screen.getByLabelText("Password").value).toBe("");
  });

  test("displays greeting when user is logged in", () => {
    renderAuth({ user: { email: "x@y.com" } });

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("clicking the close button triggers onClose", () => {
    renderAuth();

    fireEvent.click(screen.getByLabelText("Close"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("sign up button calls onClose before navigation", () => {
    renderAuth();

    const button = screen.getByRole("button", { name: /sign up/i });

    fireEvent.click(button);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding");
  });

  test("focus and blur update focusedField state", async () => {
    renderAuth();

    const email = screen.getByLabelText("Email");

    // focus input using real user event
    await userEvent.click(email);
    expect(email).toHaveFocus();

    // blur input
    await userEvent.tab();
    expect(email).not.toHaveFocus();
  });
});
