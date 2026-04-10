import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { api } from "../lib/api";

// -------------------------
// MOCK REACT ROUTER DOM
// -------------------------
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),  // prevent actual redirects
  useParams: () => ({ practiceId: "12345" }),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

// -------------------------
// MOCK API FILE
// -------------------------
jest.mock("../lib/api", () => ({
  api: {
    getAdminData: jest.fn(),
    saveAdminData: jest.fn(),
  }
}));

// -------------------------
// MOCK LOCAL STORAGE
// -------------------------
const localStorageMock = (() => {
  let store = { adminToken: "mock-token", practiceId: "12345" };
  return {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => (store[key] = value)),
    removeItem: jest.fn((key) => delete store[key]),
    clear: jest.fn(() => (store = {})),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// -------------------------
// MOCK LAZY-LOADED COMPONENTS
// -------------------------
jest.mock("../components/admin/ServicesEditor", () => () => (
  <div>Services Editor Loaded</div>
));
jest.mock("../components/admin/BlogEditor", () => () => (
    <div>Blog Editor Loaded</div>
));
jest.mock("../components/admin/GalleryEditor", () => () => (
  <div>Gallery Editor Loaded</div>
));

// -------------------------
// DUMMY USER DATA
// -------------------------
const mockUserData = {
  practice: { name: "Test Practice", tagline: "Tagline", description: "Desc" },
  contact: { phone: "123", whatsapp: "123", email: "test@test.com", address: {} },
  hours: {},
  stats: {},
  services: [],
  blogPosts: [],
  gallery: { facilityImages: [], beforeAfterCases: [] },
  seo: { siteTitle: "", metaDescription: "", keywords: "" },
  ui: {},
  practiceId: "12345"
};

// -------------------------
// TEST SUITE
// -------------------------
describe("AdminDashboard (Fully Mocked)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getAdminData.mockResolvedValue(mockUserData);
    api.saveAdminData.mockResolvedValue({ success: true });
  });

  it("renders dashboard and loads user data", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    expect(api.getAdminData).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/practice name/i)).toBeInTheDocument();
    });
  });

  it("allows updating fields and saving", async () => {
    await act(async () => {
      render(<AdminDashboard />);
    });

    const input = await screen.findByPlaceholderText(/practice name/i);

    fireEvent.change(input, { target: { value: "Updated Practice" } });

    const saveBtn = screen.getByText("Save Changes");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.saveAdminData).toHaveBeenCalled();
    });
  });
});
