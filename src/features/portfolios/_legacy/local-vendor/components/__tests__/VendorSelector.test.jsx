import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import VendorSelector from "../VendorSelector";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  authFailureMessage: (error) => {
    const status = error?.response?.status;
    if (status === 401) return "Please sign in to continue.";
    if (status === 403) return "You do not have permission to do that.";
    return null;
  },
}));

jest.mock("@/features/portfolios/_legacy/local-vendor/context/VendorContext", () => ({
  useVendor: () => ({ vendorId: null, setVendorId: jest.fn() }),
}));

function httpError(status) {
  const error = new Error("request failed");
  error.response = { status, data: {} };
  return error;
}

function renderSelector(user, loading = false) {
  return render(
    <AuthContext.Provider value={{ user, loading, token: user ? "t" : null }}>
      <VendorSelector />
    </AuthContext.Provider>
  );
}

describe("VendorSelector", () => {
  beforeEach(() => {
    axiosAuth.get.mockReset();
    axiosAuth.post.mockReset();
  });

  test("lists vendors from the owner endpoint", async () => {
    axiosAuth.get.mockResolvedValueOnce({ data: [{ _id: "1", name: "Mine Cafe" }] });
    renderSelector({ role: "user", email: "a@b.com" });

    fireEvent.click(screen.getByRole("button", { name: /select vendor/i }));
    expect(await screen.findByRole("button", { name: "Mine Cafe" })).toBeInTheDocument();
    expect(axiosAuth.get).toHaveBeenCalledWith("/vendor/mine", { skipAuthToast: true });
    expect(axiosAuth.get).toHaveBeenCalledTimes(1);
  });

  test("admins fall back to GET /vendor when the owner list is missing", async () => {
    axiosAuth.get
      .mockRejectedValueOnce(httpError(500))
      .mockResolvedValueOnce({ data: [{ _id: "2", name: "All Vendors" }] });
    renderSelector({ role: "admin" });

    fireEvent.click(screen.getByRole("button", { name: /select vendor/i }));
    expect(await screen.findByRole("button", { name: "All Vendors" })).toBeInTheDocument();
    expect(axiosAuth.get).toHaveBeenNthCalledWith(2, "/vendor", { skipAuthToast: true });
  });

  test("non-admins do not call the admin vendor list when the owner route is missing", async () => {
    axiosAuth.get.mockRejectedValueOnce(httpError(500));
    renderSelector({ role: "user" });

    await waitFor(() => expect(axiosAuth.get).toHaveBeenCalledTimes(1));
    expect(axiosAuth.get).toHaveBeenCalledWith("/vendor/mine", { skipAuthToast: true });
  });

  test("shows a sign-in message when the owner list returns 401", async () => {
    axiosAuth.get.mockRejectedValueOnce(httpError(401));
    renderSelector(null);

    expect(await screen.findByRole("alert")).toHaveTextContent("Please sign in to continue.");
    expect(axiosAuth.get).toHaveBeenCalledTimes(1);
  });

  test("creates a vendor with the shared client", async () => {
    axiosAuth.get.mockResolvedValueOnce({ data: [] });
    axiosAuth.post.mockResolvedValueOnce({ data: { _id: "new", name: "New Cafe" } });
    renderSelector({ role: "user", email: "owner@example.com" });

    fireEvent.click(screen.getByRole("button", { name: /select vendor/i }));
    fireEvent.click(screen.getByRole("button", { name: /new vendor \(manual\)/i }));
    fireEvent.change(screen.getByPlaceholderText("Vendor name"), { target: { value: "New Cafe" } });
    fireEvent.change(screen.getByPlaceholderText("Vendor email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(axiosAuth.post).toHaveBeenCalledWith(
        "/vendor",
        { name: "New Cafe", email: "owner@example.com" },
        { skipAuthToast: true }
      )
    );
  });
});
