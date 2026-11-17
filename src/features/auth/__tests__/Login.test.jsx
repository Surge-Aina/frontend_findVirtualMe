import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/features/auth/Login";
import { AuthContext } from "@/shared/context/AuthContext";
import { MaintenanceProvider } from "@/shared/maintenance/MaintenanceProvider";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login page", () => {
  let mockLogin;

  const renderPage = () =>
    render(
      <MemoryRouter>
        <MaintenanceProvider>
          <AuthContext.Provider value={{ login: mockLogin }}>
            <Login />
          </AuthContext.Provider>
        </MaintenanceProvider>
      </MemoryRouter>
    );

  beforeEach(() => {
    mockLogin = jest.fn().mockResolvedValue(undefined);
    mockNavigate.mockReset();
    delete import.meta.env.VITE_MAINTENANCE_MODE;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  });

  test("shows email or username, password, and a link to sign up", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
    expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
  });

  test("asks for both fields before calling login", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/email or username and password/i);
  });

  test("submits the identifier and password", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: "ada" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("ada", "secret"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("disables submit while maintenance mode is on", () => {
    import.meta.env.VITE_MAINTENANCE_MODE = "true";
    renderPage();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
  });

  test("shows a sign-in failure message", async () => {
    mockLogin.mockRejectedValue(new Error("nope"));
    renderPage();
    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/sign-in failed/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
