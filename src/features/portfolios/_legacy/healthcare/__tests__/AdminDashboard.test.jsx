import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { api } from "../lib/api";

// -------------------------
// MOCK REACT ROUTER DOM
// -------------------------
const mockNavigate = jest.fn();
const mockHealthcarePath = jest.fn(() => ({
  basePath: "/portfolios/healthcare/12345",
  practiceId: "12345",
}));

jest.mock("@/features/portfolios/_legacy/healthcare/hooks/useHealthcareBasePath", () => ({
  useHealthcareBasePath: () => mockHealthcarePath(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ practiceId: "12345" }),
  Link: ({ children, to, ...props }) => (
    <a href={typeof to === "string" ? to : undefined} {...props}>
      {children}
    </a>
  ),
}));

// -------------------------
// MOCK API FILE
// -------------------------
jest.mock("../lib/api", () => ({
  api: {
    getAdminData: jest.fn(),
    saveAdminData: jest.fn(),
    uploadImageToS3: jest.fn(),
  }
}));

// -------------------------
// MOCK LOCAL STORAGE
// -------------------------
let lsStore = { adminToken: "mock-token", token: "mock-token", practiceId: "12345" };
const localStorageMock = {
  getItem: jest.fn((key) => lsStore[key]),
  setItem: jest.fn((key, value) => {
    lsStore[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete lsStore[key];
  }),
  clear: jest.fn(() => {
    lsStore = {};
  }),
};
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
  contact: { phone: "555-0100", whatsapp: "555-0199", email: "test@test.com", address: {} },
  hours: {},
  stats: {},
  services: [],
  blogPosts: [],
  gallery: { facilityImages: [], beforeAfterCases: [] },
  seo: { siteTitle: "", metaDescription: "", keywords: "" },
  ui: { hero: {} },
  practiceId: "12345"
};

// -------------------------
// TEST SUITE
// -------------------------
describe("AdminDashboard (Fully Mocked)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    mockHealthcarePath.mockReturnValue({
      basePath: "/portfolios/healthcare/12345",
      practiceId: "12345",
    });
    lsStore = { adminToken: "mock-token", token: "mock-token", practiceId: "12345" };
    api.getAdminData.mockResolvedValue(mockUserData);
    api.saveAdminData.mockResolvedValue({ success: true });
  });

  it("renders dashboard and loads user data", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(api.getAdminData).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });
  });

  it("allows updating fields and saving", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    const input = await screen.findByDisplayValue("Test Practice");

    fireEvent.change(input, { target: { value: "Updated Practice" } });

    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.saveAdminData).toHaveBeenCalled();
    });
  });

  it("redirects to login when no token", async () => {
    lsStore = {};

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("navigates to dashboard when admin data fails to load", async () => {
    api.getAdminData.mockRejectedValue(new Error("load failed"));

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows services tab content when Services tab is selected", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /services/i }));
    });

    expect(await screen.findByText("Services Editor Loaded")).toBeInTheDocument();
  });

  it("shows blog tab content when Blog Posts tab is selected", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /blog posts/i }));
    });

    expect(await screen.findByText("Blog Editor Loaded")).toBeInTheDocument();
  });

  it("shows gallery tab content when Gallery tab is selected", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^gallery$/i }));
    });

    expect(await screen.findByText("Gallery Editor Loaded")).toBeInTheDocument();
  });

  it("navigates to dashboard when practiceId is missing", async () => {
    mockHealthcarePath.mockReturnValueOnce({ basePath: "", practiceId: undefined });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("loads admin data with portfolio id from healthcare path", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(api.getAdminData).toHaveBeenCalledWith("12345");
    });
  });

  it("shows contact tab fields when Contact & Hours is selected", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /contact & hours/i }));
    });

    expect(screen.getByDisplayValue("555-0100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@test.com")).toBeInTheDocument();
  });

  it("shows SEO fields when SEO Settings tab is selected", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /seo settings/i }));
    });

    expect(screen.getByText("Site Title")).toBeInTheDocument();
    expect(screen.getByText("Meta Description")).toBeInTheDocument();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
  });

  it("shows save error status when API returns success false", async () => {
    api.saveAdminData.mockResolvedValue({ success: false });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Practice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/❌ error/i)).toBeInTheDocument();
    });
  });

  it("shows View Site link when portfolio has _id", async () => {
    api.getAdminData.mockResolvedValue({
      ...mockUserData,
      _id: "portfolio-abc",
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByRole("link", { name: /view site/i })).toHaveAttribute(
      "href",
      "/portfolios/healthcare/12345"
    );
  });

  it("shows thrown save error details when saving fails", async () => {
    api.saveAdminData.mockRejectedValue(new Error("network down"));

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByDisplayValue("Test Practice")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/❌ network down/i)).toBeInTheDocument();
    });
  });

  it("uploads a logo image and saves the updated practice data", async () => {
    api.uploadImageToS3.mockResolvedValue("https://cdn.example/logo.png");

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByDisplayValue("Test Practice")).toBeInTheDocument();

    const file = new File(["logo"], "logo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/upload logo/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(api.uploadImageToS3).toHaveBeenCalledWith(file);
    });
    expect(api.saveAdminData).toHaveBeenCalledWith(
      expect.objectContaining({
        practice: expect.objectContaining({
          logoImage: "https://cdn.example/logo.png",
        }),
      }),
      "12345"
    );
  });

  it("alerts when hero image upload does not return a URL", async () => {
    api.uploadImageToS3.mockResolvedValue(null);

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByDisplayValue("Test Practice")).toBeInTheDocument();

    const file = new File(["hero"], "hero.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/upload hero image/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Image upload failed");
    });
  });

  it("removes logo and hero background images from the form state", async () => {
    api.getAdminData.mockResolvedValue({
      ...mockUserData,
      practice: {
        ...mockUserData.practice,
        logoImage: "https://cdn.example/logo.png",
      },
      ui: {
        hero: {
          backgroundImage: "https://cdn.example/hero.jpg",
        },
      },
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByAltText(/logo preview/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove logo/i }));
    expect(screen.queryByAltText(/logo preview/i)).not.toBeInTheDocument();

    expect(screen.getByAltText(/hero background preview/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove image/i }));
    expect(screen.queryByAltText(/hero background preview/i)).not.toBeInTheDocument();
  });
});
