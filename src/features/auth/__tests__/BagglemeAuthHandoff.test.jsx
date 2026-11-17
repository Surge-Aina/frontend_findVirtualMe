import { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import BagglemeAuthHandoff from "../BagglemeAuthHandoff";
import { AuthContext, defaultAuthContextValue } from "@/shared/context/AuthContext";

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const setUserAfterLogin = jest.fn();

function renderHandoff() {
  return render(
    <MemoryRouter initialEntries={["/auth/baggleme"]}>
      <AuthContext.Provider value={{ ...defaultAuthContextValue, setUserAfterLogin }}>
        <BagglemeAuthHandoff />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("BagglemeAuthHandoff", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState(null, "", "/auth/baggleme");
    jest.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function setHandoffHash(fragment) {
    const hash = fragment.startsWith("#") ? fragment : `#${fragment}`;
    window.history.replaceState(null, "", `/auth/baggleme${hash}`);
  }

  test("clears hash, posts token, logs in, and navigates to safe next", async () => {
    setHandoffHash("t=handoff-jwt&next=%2Fdashboard");
    axios.post.mockResolvedValue({
      data: { token: "session", user: { email: "a@b.com" }, portfolioIds: [] },
    });

    renderHandoff();

    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", "/auth/baggleme");

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/auth\/baggleme$/),
        { token: "handoff-jwt" }
      );
    });

    expect(setUserAfterLogin).toHaveBeenCalledWith(
      expect.objectContaining({ token: "session", user: { email: "a@b.com" } })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test("defaults to /dashboard when next is unsafe", async () => {
    setHandoffHash("t=handoff-jwt&next=%2F%2Fevil.example");
    axios.post.mockResolvedValue({
      data: { token: "session", user: { email: "a@b.com" } },
    });

    renderHandoff();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  test("redirects to login when token is missing", async () => {
    setHandoffHash("next=%2Fdashboard");

    renderHandoff();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
    expect(toast.info).toHaveBeenCalledWith("Please sign in");
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("redirects to login on API failure", async () => {
    setHandoffHash("t=handoff-jwt");
    axios.post.mockRejectedValue({ response: { status: 401 } });

    renderHandoff();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
    expect(toast.info).toHaveBeenCalledWith("Please sign in");
    expect(setUserAfterLogin).not.toHaveBeenCalled();
  });

  test("does not POST twice when React StrictMode remounts", async () => {
    setHandoffHash("t=handoff-jwt");
    axios.post.mockResolvedValue({
      data: { token: "session", user: { email: "a@b.com" } },
    });

    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/auth/baggleme"]}>
          <AuthContext.Provider value={{ ...defaultAuthContextValue, setUserAfterLogin }}>
            <BagglemeAuthHandoff />
          </AuthContext.Provider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});