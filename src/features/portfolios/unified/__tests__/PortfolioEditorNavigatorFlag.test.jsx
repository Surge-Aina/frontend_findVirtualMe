import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PortfolioEditor from "../PortfolioEditor";
import { AuthContext } from "@/shared/context/AuthContext";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@/shared/api/portfolioApi", () => ({
  isPortfolioDraftsDisabledError: (err) =>
    err?.response?.status === 404 && err?.response?.data?.code === "DRAFTS_DISABLED",
  portfolioApi: {
    getDraft: jest.fn(() =>
      Promise.reject({
        response: { status: 404, data: { code: "DRAFTS_DISABLED" } },
      })
    ),
    getBlockTypes: jest.fn(() => Promise.resolve({ data: [] })),
    update: jest.fn(),
    listVersions: jest.fn(() => Promise.resolve({ data: { versions: [] } })),
  },
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
  PortfolioSiteSettingsPanel: () => null,
  PortfolioPublishReadinessPanel: () => null,
  PortfolioAgentDesignPanel: () => null,
  PortfolioAgentAiPanel: () => null,
}));
jest.mock("../PageBannersPanel", () => ({ __esModule: true, default: () => null }));
jest.mock("../ai-creator/AgentDesignPreview", () => ({ AgentDesignPreview: () => null }));
jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: { get: jest.fn(() => Promise.resolve({ data: {} })) },
}));

const auth = {
  user: { _id: "u1", email: "e@example.test" },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  token: "t",
  refreshUser: jest.fn(),
  setUser: jest.fn(),
  setPendingFile: jest.fn(),
  pendingFile: null,
  contextLoggedIn: true,
  contextLogin: jest.fn(),
  contextLogout: jest.fn(),
};

const portfolio = {
  _id: "p1",
  template: "handyman",
  title: "Flag test site",
  sections: [{ _id: "s1", type: "hero", order: 0, data: {}, visible: true }],
};

function setMatchMedia(matches) {
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

function renderWithFlag(flagValue) {
  if (flagValue === undefined) {
    delete import.meta.env.VITE_EDITOR_NAVIGATOR_ENABLED;
  } else {
    import.meta.env.VITE_EDITOR_NAVIGATOR_ENABLED = flagValue;
  }
  setMatchMedia(true);
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/portfolios/view/p1/edit"]}>
        <Routes>
          <Route path="/portfolios/view/:id/edit" element={<PortfolioEditor portfolioData={portfolio} />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("PortfolioEditor navigator flag", () => {
  afterEach(() => {
    delete import.meta.env.VITE_EDITOR_NAVIGATOR_ENABLED;
  });

  it("defaults to legacy sections UI when flag is unset", async () => {
    renderWithFlag(undefined);
    expect(await screen.findByDisplayValue("Flag test site")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sections" })).toBeInTheDocument();
    expect(screen.queryByText(/pages & sections/i)).not.toBeInTheDocument();
  });

  it("shows enhanced navigator when VITE_EDITOR_NAVIGATOR_ENABLED=true", async () => {
    renderWithFlag("true");
    expect(await screen.findByDisplayValue("Flag test site")).toBeInTheDocument();
    expect(screen.getByText(/pages & sections/i)).toBeInTheDocument();
    expect(screen.queryByText("Structure")).not.toBeInTheDocument();
  });
});