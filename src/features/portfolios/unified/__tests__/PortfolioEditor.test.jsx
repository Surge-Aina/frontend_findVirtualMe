import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PortfolioEditor from "../PortfolioEditor";
import { AuthContext } from "@/shared/context/AuthContext";
import axiosAuth from "@/shared/api/axiosAuth";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

jest.mock("@/shared/api/portfolioApi", () => ({
  portfolioApi: {
    getById: jest.fn(),
    getBlockTypes: jest.fn(() =>
      Promise.resolve({ data: [{ type: "contact", label: "Contact" }] })
    ),
    update: jest.fn(),
    create: jest.fn(),
    removeSection: jest.fn(),
    reorderSections: jest.fn(),
    addSection: jest.fn(),
    proposeAgentEdit: jest.fn(),
  },
}));

jest.mock("@/shared/api/axiosAuth", () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(),
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
  PortfolioSiteSettingsPanel: ({ setSocialLink }) => (
    <div>
      <p>Mock Site Panel</p>
      <button type="button" onClick={() => setSocialLink("github", "https://github.com/mock")}>
        Mock Set Social
      </button>
    </div>
  ),
  PortfolioAgentDesignPanel: ({ clearThemeOverrides, setThemeToken }) => (
    <div>
      <p>Mock Design Panel</p>
      <button type="button" onClick={() => setThemeToken("page", "#123456")}>
        Mock Theme Token
      </button>
      <button type="button" onClick={clearThemeOverrides}>
        Mock Clear Theme
      </button>
    </div>
  ),
  PortfolioPublishReadinessPanel: ({ readiness }) => (
    <div>Mock Publish Panel {readiness.score}</div>
  ),
  PortfolioAgentAiPanel: ({
    aiAccessLoading,
    hasAiAccess,
    aiProposal,
    setAiInstruction,
    handleGenerateAiProposal,
    handleApplyAiProposal,
  }) => (
    <div>
      <p>Mock AI Panel</p>
      <p>{aiAccessLoading ? "AI access loading" : hasAiAccess ? "AI access granted" : "AI access denied"}</p>
      <button
        type="button"
        onClick={() => {
          setAiInstruction("Make it bolder");
          handleGenerateAiProposal("Make it bolder");
        }}
      >
        Mock Generate AI
      </button>
      {aiProposal ? (
        <button type="button" onClick={handleApplyAiProposal}>
          Mock Apply AI
        </button>
      ) : null}
    </div>
  ),
}));
jest.mock("../PageBannersPanel", () => ({
  __esModule: true,
  default: ({ sections, onPatchPageBanner }) => (
    <div>
      <p>Mock Banners Panel</p>
      <button
        type="button"
        onClick={() => onPatchPageBanner(sections[0]?._id, { title: "Updated banner" })}
      >
        Mock Patch Banner
      </button>
    </div>
  ),
}));
jest.mock("../ai-creator/AgentDesignPreview", () => ({
  AgentDesignPreview: () => null,
}));

import { portfolioApi } from "@/shared/api/portfolioApi";

const user = { _id: "u1", email: "e@e.com" };

const auth = {
  user,
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

const minimalPortfolio = {
  _id: "p1",
  template: "handyman",
  title: "Edit me",
  owner: user._id,
  sections: [{ _id: "sec1", type: "hero", order: 0, data: { title: "H" }, visible: true }],
};

const multiSectionPortfolio = {
  ...minimalPortfolio,
  sections: [
    { _id: "sec1", type: "hero", order: 0, data: { title: "Hero" }, visible: true },
    { _id: "sec2", type: "contact", order: 1, data: { title: "Contact" }, visible: true },
  ],
};

const agentPortfolio = {
  ...multiSectionPortfolio,
  template: "agent",
  themeId: "aurora",
  themeTokens: {},
  layoutMode: "stacked",
  socialLinks: {},
  navBrand: {},
  pageBannerDefaults: {},
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

function renderEditor(prefetched) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/portfolios/view/p1/edit"]}>
        <Routes>
          <Route
            path="/portfolios/view/:id/edit"
            element={<PortfolioEditor portfolioData={prefetched} />}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("PortfolioEditor", () => {
  beforeEach(() => {
    setMatchMedia(false);
    portfolioApi.getById.mockReset();
    portfolioApi.update.mockReset();
    portfolioApi.create.mockReset();
    portfolioApi.removeSection.mockReset();
    portfolioApi.reorderSections.mockReset();
    portfolioApi.addSection.mockReset();
    portfolioApi.proposeAgentEdit.mockReset();
    portfolioApi.getBlockTypes.mockImplementation(() =>
      Promise.resolve({ data: [{ type: "contact", label: "Contact" }] })
    );
    portfolioApi.update.mockImplementation(() =>
      Promise.resolve({ data: { portfolio: minimalPortfolio } })
    );
    axiosAuth.get.mockReset();
    axiosAuth.patch.mockReset();
    axiosAuth.get.mockResolvedValue({ data: {} });
    axiosAuth.patch.mockResolvedValue({ data: {} });
    auth.refreshUser.mockClear();
    toast.error.mockClear();
    toast.success.mockClear();
    toast.info.mockClear();
    window.confirm = jest.fn(() => true);
  });

  it("renders editor chrome with prefetched portfolio", async () => {
    renderEditor(minimalPortfolio);
    expect(await screen.findByDisplayValue("Edit me")).toBeInTheDocument();
    expect(screen.getByLabelText(/preview portfolio/i)).toBeInTheDocument();
  });

  it("shows sections workspace and save action", async () => {
    renderEditor(minimalPortfolio);
    expect(await screen.findByRole("button", { name: /save portfolio/i })).toBeInTheDocument();
    expect((await screen.findAllByRole("button", { name: /^sections$/i })).length).toBeGreaterThan(0);
  });

  it("loads portfolio from API when portfolioData is not prefetched", async () => {
    portfolioApi.getById.mockResolvedValue({ data: minimalPortfolio });
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={["/portfolios/view/p1/edit"]}>
          <Routes>
            <Route path="/portfolios/view/:id/edit" element={<PortfolioEditor />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      expect(portfolioApi.getById).toHaveBeenCalledWith("p1");
    });
    expect(await screen.findByDisplayValue("Edit me")).toBeInTheDocument();
  });

  it("persists changes when save is clicked", async () => {
    const user = userEvent.setup();
    renderEditor(minimalPortfolio);
    const titleInput = await screen.findByDisplayValue("Edit me");
    await user.clear(titleInput);
    await user.type(titleInput, "Saved title");
    await user.click(screen.getByRole("button", { name: /save portfolio/i }));
    await waitFor(() => {
      expect(portfolioApi.update).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ title: "Saved title" })
      );
    });
  });

  it("shows not found when API returns no portfolio", async () => {
    portfolioApi.getById.mockResolvedValue({ data: null });
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={["/portfolios/view/p1/edit"]}>
          <Routes>
            <Route path="/portfolios/view/:id/edit" element={<PortfolioEditor />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(await screen.findByText(/portfolio not found/i)).toBeInTheDocument();
  });

  it("shows AI inspector tab for agent template", async () => {
    const agentPortfolio = {
      ...minimalPortfolio,
      template: "agent",
      themeId: "aurora",
      layoutMode: "stacked",
    };
    portfolioApi.getBlockTypes.mockResolvedValue({
      data: [{ type: "contact", label: "Contact" }],
    });
    renderEditor(agentPortfolio);
    expect(await screen.findByDisplayValue("Edit me")).toBeInTheDocument();
    const aiTabs = await screen.findAllByRole("button", { name: /^ai$/i });
    expect(aiTabs.length).toBeGreaterThan(0);
  });

  it("calls getBlockTypes with agent mode for agent template", async () => {
    portfolioApi.getBlockTypes.mockResolvedValue({ data: [] });
    renderEditor(agentPortfolio);
    await waitFor(() => {
      expect(portfolioApi.getBlockTypes).toHaveBeenCalledWith("agent", { mode: "agent" });
    });
  });

  it("renders desktop site and banner inspector panels", async () => {
    const user = userEvent.setup();
    setMatchMedia(true);
    renderEditor(minimalPortfolio);

    await screen.findByDisplayValue("Edit me");
    await user.click(screen.getAllByRole("button", { name: /^site$/i })[0]);
    expect(screen.getAllByText(/mock site panel/i).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /^banners$/i })[0]);
    expect(screen.getAllByText(/mock banners panel/i).length).toBeGreaterThan(0);
  });

  it("renders mobile site inspector panel", async () => {
    const user = userEvent.setup();
    setMatchMedia(false);
    renderEditor(minimalPortfolio);

    await screen.findByDisplayValue("Edit me");
    const siteButtons = screen.getAllByRole("button", { name: /^site$/i });
    await user.click(siteButtons[siteButtons.length - 1]);
    expect(screen.getAllByText(/mock site panel/i).length).toBeGreaterThan(0);
  });

  it("reorders sections after saving dirty changes", async () => {
    const user = userEvent.setup();
    setMatchMedia(true);
    portfolioApi.update.mockResolvedValue({
      data: {
        portfolio: {
          ...multiSectionPortfolio,
          title: "Dirty title",
        },
      },
    });
    portfolioApi.reorderSections.mockResolvedValue({
      data: {
        portfolio: {
          ...multiSectionPortfolio,
          sections: [
            { ...multiSectionPortfolio.sections[1], order: 0 },
            { ...multiSectionPortfolio.sections[0], order: 1 },
          ],
        },
      },
    });

    renderEditor(multiSectionPortfolio);
    const titleInput = await screen.findByDisplayValue("Edit me");
    await user.clear(titleInput);
    await user.type(titleInput, "Dirty title");
    await user.click(screen.getAllByTitle("Move down")[0]);

    await waitFor(() => {
      expect(portfolioApi.update).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ title: "Dirty title" })
      );
    });
    expect(portfolioApi.reorderSections).toHaveBeenCalledWith("p1", ["sec2", "sec1"]);
  });

  it("adds a section from the structure panel", async () => {
    const user = userEvent.setup();
    setMatchMedia(true);
    portfolioApi.addSection.mockResolvedValue({
      data: {
        portfolio: {
          ...multiSectionPortfolio,
          sections: [
            ...multiSectionPortfolio.sections,
            { _id: "sec3", type: "contact", order: 2, data: {}, visible: true },
          ],
        },
      },
    });

    renderEditor(minimalPortfolio);
    await screen.findByDisplayValue("Edit me");
    await user.click(screen.getByRole("button", { name: /add section/i }));

    await waitFor(() => {
      expect(portfolioApi.addSection).toHaveBeenCalledWith(
        "p1",
        "contact",
        expect.any(Object),
        1
      );
    });
  });

  it("removes the active section when confirmed", async () => {
    const user = userEvent.setup();
    setMatchMedia(true);
    portfolioApi.removeSection.mockResolvedValue({
      data: {
        portfolio: {
          ...multiSectionPortfolio,
          sections: [multiSectionPortfolio.sections[1]],
        },
      },
    });

    renderEditor(multiSectionPortfolio);
    await screen.findByDisplayValue("Edit me");
    await user.click(screen.getByTitle("Remove section"));

    await waitFor(() => {
      expect(portfolioApi.removeSection).toHaveBeenCalledWith("p1", "sec1");
    });
  });

  it("resets dirty edits after confirmation", async () => {
    const user = userEvent.setup();
    renderEditor(minimalPortfolio);

    const titleInput = await screen.findByDisplayValue("Edit me");
    await user.clear(titleInput);
    await user.type(titleInput, "Unsaved title");
    await user.click(screen.getByRole("button", { name: /reset unsaved changes/i }));

    expect(await screen.findByDisplayValue("Edit me")).toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledWith("Unsaved changes were discarded");
  });

  it("creates a remix and links it to the user", async () => {
    const user = userEvent.setup();
    portfolioApi.create.mockResolvedValue({
      data: {
        portfolio: {
          _id: "p2",
          title: "Edit me Remix",
        },
      },
    });

    renderEditor(minimalPortfolio);
    await screen.findByDisplayValue("Edit me");
    await user.click(screen.getByRole("button", { name: /remix portfolio/i }));

    await waitFor(() => {
      expect(portfolioApi.create).toHaveBeenCalledWith(
        "handyman",
        expect.objectContaining({
          title: "Edit me Remix",
          visibility: "private",
        })
      );
    });
    expect(axiosAuth.patch).toHaveBeenCalledWith("/api/users/portfolio-id", {
      portfolioId: "p2",
      portfolioType: "handyman",
      isPublic: false,
      portfolioName: "Edit me Remix",
    });
    expect(auth.refreshUser).toHaveBeenCalled();
  });

  it("renders agent design and AI panels and applies an AI proposal", async () => {
    const user = userEvent.setup();
    setMatchMedia(true);
    axiosAuth.get.mockResolvedValue({
      data: {
        hasAccess: true,
        usage: { remaining: 2, used: 1, limit: 3 },
      },
    });
    portfolioApi.proposeAgentEdit.mockResolvedValue({
      data: {
        source: "openai",
        usage: { remaining: 1, used: 2, limit: 3 },
        changes: { summary: ["Updated theme"] },
        proposal: {
          title: "AI Title",
          socialLinks: {},
          sections: [
            { _id: "sec1", type: "hero", order: 0, data: { title: "AI Hero" }, visible: true },
          ],
          themeId: "aurora",
          themeTokens: { page: "#101010" },
          layoutMode: "single",
          pageBannerDefaults: {},
          navBrand: {},
        },
      },
    });
    portfolioApi.update.mockResolvedValue({
      data: {
        portfolio: {
          ...agentPortfolio,
          title: "AI Title",
          layoutMode: "single",
        },
      },
    });

    renderEditor(agentPortfolio);
    await screen.findByDisplayValue("Edit me");

    await user.click(screen.getAllByRole("button", { name: /^design$/i })[0]);
    expect(screen.getAllByText(/mock design panel/i).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /^ai$/i })[0]);
    expect((await screen.findAllByText(/ai access granted/i)).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole("button", { name: /mock generate ai/i })[0]);
    await waitFor(() => {
      expect(portfolioApi.proposeAgentEdit).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ instruction: "Make it bolder" })
      );
    });

    await user.click(screen.getAllByRole("button", { name: /mock apply ai/i })[0]);
    await waitFor(() => {
      expect(portfolioApi.update).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({
          title: "AI Title",
          layoutMode: "single",
        })
      );
    });
  });

  it("disables add-section controls when block types cannot be loaded", async () => {
    setMatchMedia(true);
    portfolioApi.getBlockTypes.mockRejectedValue(new Error("no blocks"));

    renderEditor(minimalPortfolio);
    await screen.findByDisplayValue("Edit me");

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: /add section/i })).toBeDisabled();
  });
});
