import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUp from "@/features/auth/SignUp";
import { AuthContext } from "@/shared/context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("SignUp Component", () => {
  let mockContextLogin, mockNavigate;

  const renderWithContext = () =>
    render(
      <AuthContext.Provider value={{ contextLogin: mockContextLogin }}>
        <SignUp />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    mockContextLogin = jest.fn();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    jest.clearAllMocks();
    localStorage.clear();
  });

  // -----------------------------------------------------------------
  test("renders input fields and button", () => {
    renderWithContext();

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  // -----------------------------------------------------------------
  test("typing updates form fields", () => {
    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass123" },
    });

    expect(screen.getByPlaceholderText("Name").value).toBe("John");
    expect(screen.getByPlaceholderText("Username").value).toBe("john123");
    expect(screen.getByPlaceholderText("Email").value).toBe("john@test.com");
    expect(screen.getByPlaceholderText("Password").value).toBe("pass123");
  });

  // -----------------------------------------------------------------
  test("shows error toast when fields are missing", () => {
    renderWithContext();

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(toast.error).toHaveBeenCalledWith("Please fill in all fields");
    expect(axios.post).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  test("successful signup triggers API call, updates storage, contextLogin, and navigates", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "abc123",
        email: "new@test.com",
      },
    });

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Wait for success UI
    const successMsg = await screen.findByText(/sign up successful/i);
    expect(successMsg).toBeInTheDocument();

    expect(axios.post).toHaveBeenCalled();
    expect(mockContextLogin).toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBe("abc123");

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // -----------------------------------------------------------------
  test("failed signup shows error toast", async () => {
    axios.post.mockRejectedValueOnce(new Error("fail"));

    renderWithContext();

    // fill all fields
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Sign up failed"));
  });

  // -----------------------------------------------------------------
  test("success state displays confirmation message", async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: "xyz123", email: "john@test.com" },
    });

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    const successMsg = await screen.findByText(/sign up successful/i);
    expect(successMsg).toBeInTheDocument();
  });
});
