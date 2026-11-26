import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PortfolioEditor from "../PortfolioEditor";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const draftsDisabledError = {
  response: { status: 404, data: { code: "DRAFTS_DISABLED", error: "Site drafts are not enabled" } },
};

jest.mock("@/shared/api/portfolioApi", () => ({
  isPortfolioDraftsDisabledError: (err) =>
    err?.response?.status === 404 && err?.response?.data?.code === "DRAFTS_DISABLED",
  portfolioApi: {
    getById: jest.fn(),
    getDraft: jest.fn(),
    getBlockTypes: jest.fn(() => Promise.resolve({ data: [{ type: "contact", label: "Contact" }] })),
    update: jest.fn(),
    publish: jest.fn(),
    listVersions: jest.fn(() => Promise.resolve({ data: { versions: [] } })),
    removeSection: jest.fn(),
    reorderSections: jest.fn(),
    addSection: jest.fn(),
  },
}));

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: { get: jest.fn(() => Promise.resolve({ data: {} })), patch: jest.fn() },
}));

jest.mock("../portfolioSectionEditors", () => {
  const C = () => null;
  return {
    StatsEditor: C,
    HoursEditor: C,
    SeoEditor: C,
    SummarySectionEditor: C,
    SkillsEditor: C,
    ExperienceEditor: C,
    EducationEditor: C,
    ProjectsEditor: C,
    ServicesDataEditor: C,
    GalleryDataEditor: C,
    BlogDataEditor: C,
    ProcessEditor: C,
    TestimonialsEditor: C,
    FaqEditor: C,
    ClientLogosEditor: C,
    CertificationsEditor: C,
    LanguagesEditor: C,
    TeamEditor: C,
    VideoEmbedEditor: C,
    CaseStudyEditor: C,
    AccountEditor: C,
  };
});
jest.mock("../PortfolioEditorFields", () => ({
  HeroEditor: () => null,
  ContactEditor: () => null,
  JsonEditor: () => null,
}));
jest.mock("../DashboardBlockEditors", () => ({
  DashboardChartEditor: () => null,
  DashboardTableEditor: () => null,
}));
jest.mock("../ai-creator/PortfolioEditorWorkspacePanels", () => ({
  PortfolioSiteSettingsPanel: () => <div>Mock Site Panel</div>,
  PortfolioPublishReadinessPanel: () => <div>Mock Publish Panel</div>,
  PortfolioAgentDesignPanel: () => null,
  PortfolioAgentAiPanel: () => null,
}));
jest.mock("../PageBannersPanel", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../ai-creator/AgentDesignPreview", () => ({
  AgentDesignPreview: () => null,
}));

import { portfolioApi } from "@/shared/api/portfolioApi";

const examplePortfolio = {
  _id: "example-portfolio-id",
  template: "handyman",
  title: "Example Site",
  owner: "example-owner-id",
  sections: [{ _id: "sec-1", type: "hero", order: 0, data: { title: "Hello" }, visible: true }],
};

const auth = {
  user: { _id: "example-owner-id", email: "owner@example.test" },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  token: "example-token",
  refreshUser: jest.fn(),
  setUser: jest.fn(),
  setPendingFile: jest.fn(),
  pendingFile: null,
  contextLoggedIn: true,
  contextLogin: jest.fn(),
  contextLogout: jest.fn(),
};

function setMatchMedia(matches) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

function renderEditor() {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/portfolios/view/example-portfolio-id/edit"]}>
        <Routes>
          <Route path="/portfolios/view/:id/edit" element={<PortfolioEditor />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("PortfolioEditor draft mode", () => {
  beforeEach(() => {
    setMatchMedia(true);
    portfolioApi.getDraft.mockReset();
    portfolioApi.getById.mockReset();
    portfolioApi.getById.mockResolvedValue({ data: examplePortfolio });
    portfolioApi.getDraft.mockRejectedValue(draftsDisabledError);
  });

  it("hides draft UI when drafts API returns DRAFTS_DISABLED", async () => {
    renderEditor();

    await waitFor(() => {
      expect(portfolioApi.getDraft).toHaveBeenCalledWith("example-portfolio-id");
    });
    expect(await screen.findByDisplayValue("Example Site")).toBeInTheDocument();
    expect(screen.queryByText(/draft — not live yet/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /publish draft to live site/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/version history/i)).not.toBeInTheDocument();
  });

  it("shows draft banner and publish when drafts are enabled", async () => {
    portfolioApi.getDraft.mockResolvedValue({
      data: {
        hasDraft: true,
        published: examplePortfolio,
        draft: {
          portfolioId: "example-portfolio-id",
          source: "ai",
          approvalState: "pending_owner",
          title: "Example Draft Title",
          sections: examplePortfolio.sections,
        },
      },
    });

    renderEditor();
    expect(await screen.findByText(/draft — not live yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish draft to live site/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view live site/i })).toBeInTheDocument();
    expect(screen.getByText(/pending your approval/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Example Draft Title")).toBeInTheDocument();
  });
});