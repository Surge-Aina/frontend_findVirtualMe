import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";
import { MaintenanceProvider } from "@/shared/maintenance/MaintenanceProvider";
import PhoneLoginSection from "../PhoneLoginSection";
import * as phoneLoginApi from "../phoneLoginApi";

jest.mock("react-phone-number-input", () => ({
  __esModule: true,
  default: ({ value, onChange, disabled }) => (
    <input
      aria-label="Mobile number"
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

jest.mock("react-phone-number-input/locale/en", () => ({}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const EXAMPLE_US = "+15550100001";

describe("PhoneLoginSection", () => {
  let setUserAfterLogin;

  const renderSection = () =>
    render(
      <MemoryRouter>
        <MaintenanceProvider>
          <AuthContext.Provider value={{ setUserAfterLogin }}>
            <PhoneLoginSection />
          </AuthContext.Provider>
        </MaintenanceProvider>
      </MemoryRouter>,
    );

  beforeEach(() => {
    setUserAfterLogin = jest.fn();
    mockNavigate.mockReset();
    delete import.meta.env.VITE_PHONE_LOGIN_ENABLED;
    jest.spyOn(phoneLoginApi, "fetchPhoneLoginCountries").mockResolvedValue(["US", "GB", "IN"]);
    jest.spyOn(phoneLoginApi, "phoneLoginStart").mockResolvedValue({
      message: "If this number is eligible, a verification code was sent",
    });
    jest.spyOn(phoneLoginApi, "phoneLoginVerify").mockResolvedValue({
      token: "tok",
      user: { email: "user@example.test", id: "1" },
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders nothing when the feature flag is off", async () => {
    renderSection();
    await waitFor(() => {
      expect(phoneLoginApi.fetchPhoneLoginCountries).not.toHaveBeenCalled();
    });
    expect(screen.queryByText(/sign in with your phone/i)).not.toBeInTheDocument();
  });

  it("renders nothing when countries list is empty", async () => {
    import.meta.env.VITE_PHONE_LOGIN_ENABLED = "true";
    phoneLoginApi.fetchPhoneLoginCountries.mockResolvedValue([]);
    renderSection();
    await waitFor(() => expect(phoneLoginApi.fetchPhoneLoginCountries).toHaveBeenCalled());
    expect(screen.queryByText(/sign in with your phone/i)).not.toBeInTheDocument();
  });

  it("shows phone flow when enabled with countries", async () => {
    import.meta.env.VITE_PHONE_LOGIN_ENABLED = "true";
    renderSection();
    expect(await screen.findByText(/sign in with your phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
  });

  it("sends a code and verifies sign-in", async () => {
    import.meta.env.VITE_PHONE_LOGIN_ENABLED = "true";
    const user = userEvent.setup();
    renderSection();
    await screen.findByText(/sign in with your phone/i);

    await user.type(screen.getByLabelText(/mobile number/i), EXAMPLE_US);
    await user.click(screen.getByRole("button", { name: /send verification code/i }));

    await waitFor(() =>
      expect(phoneLoginApi.phoneLoginStart).toHaveBeenCalledWith(EXAMPLE_US, expect.any(String)),
    );

    const codeInput = await screen.findByLabelText(/verification code/i);
    await user.type(codeInput, "123456");
    await user.click(screen.getByRole("button", { name: /verify and sign in/i }));

    await waitFor(() => {
      expect(phoneLoginApi.phoneLoginVerify).toHaveBeenCalledWith(
        EXAMPLE_US,
        "123456",
        expect.any(String),
      );
      expect(setUserAfterLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows friendly errors from the API", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    import.meta.env.VITE_PHONE_LOGIN_ENABLED = "true";
    phoneLoginApi.phoneLoginStart.mockRejectedValue({
      response: { status: 400, data: { code: "PHONE_COUNTRY_NOT_SUPPORTED", message: "x" } },
    });
    renderSection();
    await screen.findByText(/sign in with your phone/i);

    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: EXAMPLE_US } });
    fireEvent.click(screen.getByRole("button", { name: /send verification code/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not available for this country/i);
    errorSpy.mockRestore();
  });
});