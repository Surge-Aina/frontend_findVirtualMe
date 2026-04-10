import { renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useHandleCardClick } from "@/shared/utils/useHandleCardClick";
import { toast } from "react-toastify";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("useHandleCardClick", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    toast.error.mockClear();
  });

  it("returns handleCardClick function", () => {
    const { result } = renderHook(() => useHandleCardClick());
    expect(typeof result.current.handleCardClick).toBe("function");
  });

  it("navigates to unified view when portfolio has template (v2)", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({
      _id: "abc",
      template: "projectManager",
      sections: [{ type: "hero", order: 0, data: {} }],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/view/abc");
  });

  it("navigates to unified view when portfolio has sections array (v2)", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({
      _id: "def",
      sections: [],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/view/def");
  });

  it("navigates to handyman legacy route when portfolioType is Handyman and no v2 fields", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({ portfolioType: "Handyman", _id: "123" });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/handyman/123");
  });

  it("navigates to cleaning service legacy route", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({ portfolioType: "CleaningLady", _id: "456" });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/cleaningService/456/about");
  });

  it("navigates to vendor portfolio with formatted username", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({
      portfolioType: "LocalVendor",
      _id: "789",
      name: "John Doe",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/vendor/john-doe/789");
  });

  it("navigates to project manager legacy route", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({
      portfolioType: "ProjectManager",
      _id: "101",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/ProjectManager/101");
  });

  it("navigates to unified view by default when type unknown", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({ _id: "zzz" });
    expect(mockNavigate).toHaveBeenCalledWith("/portfolios/view/zzz");
  });

  it("shows error when portfolio missing _id", () => {
    const { result } = renderHook(() => useHandleCardClick());
    result.current.handleCardClick({ template: "x" });
    expect(toast.error).toHaveBeenCalledWith("Portfolio not found.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
