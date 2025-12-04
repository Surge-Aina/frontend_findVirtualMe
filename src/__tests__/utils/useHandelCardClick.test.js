import { renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useHandleCardClick } from "../../utils/useHandleCardClick";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify"; // 💡 Import toast for mocking

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

// 💡 Mock react-toastify's toast object (for error testing)
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// --- DEFAULT WRAPPER FOR NON-OWNER/LOGGED-IN ---
// This user is logged in but owns no portfolios.
// Used for tests that should hit the "portfolio not found"/error path.
const mockDefaultAuthContextValue = {
  user: {
    portfolios: [], // Empty array for non-owner case
    role: "customer",
  },
};
const DefaultWrapper = ({ children }) => (
  <AuthContext.Provider value={mockDefaultAuthContextValue}>{children}</AuthContext.Provider>
);

// --- WRAPPER FOR LOGGED-OUT USER ---
const mockLoggedOutAuthContextValue = {
  user: null, // User is null when logged out
};
const LoggedOutWrapper = ({ children }) => (
  <AuthContext.Provider value={mockLoggedOutAuthContextValue}>{children}</AuthContext.Provider>
);

describe("useHandleCardClick", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(console, "log").mockImplementation(jest.fn()); // Mock console.log
    toast.error.mockClear(); // Clear toast spy
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Helper to create an Owner Wrapper for specific tests ---
  // This is necessary because the hook logic relies on user.portfolios
  // containing the clicked item.
  const createOwnerWrapper = (id, type, name) => {
    const ownerMock = {
      user: {
        portfolios: [{ portfolioId: id, portfolioType: type, name: name }],
        role: "owner",
      },
    };
    return ({ children }) => <AuthContext.Provider value={ownerMock}>{children}</AuthContext.Provider>;
  };

  // --- CORE TESTS ---

  it("returns handleCardClick function", () => {
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: DefaultWrapper });
    expect(typeof result.current.handleCardClick).toBe("function");
  });

  // --- NAVIGATION TESTS (REQUIRE OWNER WRAPPER) ---

  it("navigates to handyman portfolio (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("123", "Handyman");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({ type: "handyman", _id: "123" });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/handyman/123");
  });

  it("navigates to cleaning service portfolio (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("456", "CleaningLady");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({ type: "cleaningLady", _id: "456" });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/cleaningService/456/about");
  });

  it("navigates to vendor portfolio with formatted username (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("789", "LocalVendor");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({
      type: "vendor",
      _id: "789",
      name: "John Doe",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/vendor/john-doe/789");
  });

  it("navigates to vendor portfolio using email when no name (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("789", "LocalVendor");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({
      type: "vendor",
      _id: "789",
      email: "vendor@test.com",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/vendor/vendor@test.com/789");
  });

  it("navigates to vendor portfolio with default username (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("789", "LocalVendor");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({ type: "vendor", _id: "789" });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/vendor/vendor/789");
  });

  it("navigates to project manager portfolio (Owner)", () => {
    const OwnerWrapper = createOwnerWrapper("101", "ProjectManager");
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: OwnerWrapper });

    result.current.handleCardClick({
      type: "other", // The card type is ignored if portfolio match is found
      _id: "101",
      email: "user@example.com",
      name: "mock-name",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/project-manager/mock-name/101");
  });

  // --- ERROR/GUARD CLAUSE TESTS ---

  it("handles logged-out user (Guard Clause 1)", () => {
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: LoggedOutWrapper });
    result.current.handleCardClick({ type: "handyman", _id: "123" }); // Should show error and not navigate
    expect(toast.error).toHaveBeenCalledWith("You must be logged in to manage portfolios.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles non-owner user (Guard Clause 2)", () => {
    const { result } = renderHook(() => useHandleCardClick(), { wrapper: DefaultWrapper });
    result.current.handleCardClick({ type: "handyman", _id: "999" }); // ID 999 is not in user.portfolios // Should show error and not navigate
    expect(toast.error).toHaveBeenCalledWith("Portfolio match not found in user account.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
