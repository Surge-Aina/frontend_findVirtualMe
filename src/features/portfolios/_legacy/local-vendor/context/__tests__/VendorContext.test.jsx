import { render, waitFor } from "@testing-library/react";
import { VendorProvider, useVendor } from "../VendorContext";
import { useParams } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";
// ---- MOCKS ----
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

const mockAuthContextValue = {
  user: { role: "customer", portfolios: [] },
};

// Helper component to extract values from context
function TestConsumer({ callback }) {
  const ctx = useVendor();
  callback(ctx);
  return null;
}

describe("VendorContext", () => {
  let contextValue;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    contextValue = null;
  });

  const renderContext = (props = {}) =>
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <VendorProvider {...props}>
          <TestConsumer callback={(v) => (contextValue = v)} />
        </VendorProvider>
      </AuthContext.Provider>
    );

  test("uses forceDefault vendorId when forceDefault = true", () => {
    useParams.mockReturnValue({ id: undefined });

    renderContext({ forceDefault: true });

    expect(contextValue.vendorId).toBe("68af9176f5115d59643841d9");
  });

  test("initializes vendorId from route params when provided", () => {
    useParams.mockReturnValue({ id: "routeVendor123" });

    renderContext();

    expect(contextValue.vendorId).toBe("routeVendor123");
  });

  test("initializes vendorId from localStorage when no route param", () => {
    useParams.mockReturnValue({ id: undefined });
    localStorage.setItem("vendorId", "storedVendor999");

    renderContext();

    expect(contextValue.vendorId).toBe("storedVendor999");
  });

  test("updates vendorId when route param changes", async () => {
    let mockId = "first123";
    useParams.mockImplementation(() => ({ id: mockId }));

    const wrapper = (children) => <AuthContext.Provider value={mockAuthContextValue}>{children}</AuthContext.Provider>;

    const { rerender } = render(
      wrapper(
        <VendorProvider>
          <TestConsumer callback={(v) => (contextValue = v)} />
        </VendorProvider>
      )
    );

    // Initial load
    expect(contextValue.vendorId).toBe("first123");

    // Change URL param
    mockId = "second789";
    rerender(
      wrapper(
        <VendorProvider>
          <TestConsumer callback={(v) => (contextValue = v)} />
        </VendorProvider>
      )
    );

    await waitFor(() => expect(contextValue.vendorId).toBe("second789"));
  });

  test("persists vendorId to localStorage whenever it changes", () => {
    useParams.mockReturnValue({ id: "persist123" });

    renderContext();

    expect(localStorage.getItem("vendorId")).toBe("persist123");
  });

  test("setVendorId allows manual updates", async () => {
    useParams.mockReturnValue({ id: undefined });

    renderContext();

    contextValue.setVendorId("manual555");

    await waitFor(() => expect(contextValue.vendorId).toBe("manual555"));
  });
});
