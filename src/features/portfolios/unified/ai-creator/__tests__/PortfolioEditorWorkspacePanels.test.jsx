import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PortfolioSiteSettingsPanel,
  PortfolioAgentDesignPanel,
  PortfolioPublishReadinessPanel,
  PortfolioAgentAiPanel,
} from "../PortfolioEditorWorkspacePanels";
import { AGENT_THEME_PRESETS } from "../../portfolio-themes/agentThemeResolver";
import { mergeNavBrandDefaults } from "../../PortfolioNavBrand";

jest.mock("../AgentDesignPreview", () => ({
  AgentDesignPreview: () => <div data-testid="agent-design-preview" />,
}));

function SiteHarness({ initial }) {
  const [portfolio, setPortfolio] = useState(initial);
  const nb = mergeNavBrandDefaults(portfolio.navBrand);
  const sl = portfolio.socialLinks || {};
  const setSocialLink = (key, val) =>
    setPortfolio((p) => ({
      ...p,
      socialLinks: { ...(p.socialLinks || {}), [key]: val },
    }));
  return (
    <PortfolioSiteSettingsPanel
      portfolio={portfolio}
      setPortfolio={setPortfolio}
      nb={nb}
      sl={sl}
      setSocialLink={setSocialLink}
    />
  );
}

describe("PortfolioEditorWorkspacePanels", () => {
  describe("PortfolioPublishReadinessPanel", () => {
    it("shows score badge", () => {
      const readiness = {
        score: 80,
        issues: ["Fix X"],
        positives: ["Good"],
      };
      render(<PortfolioPublishReadinessPanel readiness={readiness} />);
      expect(screen.getByText(/score 80/i)).toBeInTheDocument();
    });

    it("uses emerald styling for high score with no issues", () => {
      render(
        <PortfolioPublishReadinessPanel
          readiness={{ score: 90, issues: [], positives: ["A", "B"] }}
        />
      );
      expect(screen.getByText(/no major readiness issues/i)).toBeInTheDocument();
    });

    it("uses red styling for low score", () => {
      const { container } = render(
        <PortfolioPublishReadinessPanel
          readiness={{ score: 40, issues: ["Missing"], positives: [] }}
        />
      );
      expect(screen.getByText(/score 40/i)).toBeInTheDocument();
      expect(container.querySelector(".bg-red-100")).toBeTruthy();
    });
  });

  describe("PortfolioSiteSettingsPanel", () => {
    it("updates GitHub link via FieldEditor", async () => {
      const user = userEvent.setup();
      render(
        <SiteHarness
          initial={{
            socialLinks: {},
            navBrand: {},
            pageBannerDefaults: {},
          }}
        />
      );
      const gh = screen.getAllByRole("textbox")[0];
      await user.type(gh, "https://github.com/me");
      expect(gh).toHaveValue("https://github.com/me");
    });

    it("sets nav brand mode to icon and shows icon grid", async () => {
      const user = userEvent.setup();
      render(
        <SiteHarness
          initial={{
            socialLinks: {},
            navBrand: { mode: "none" },
            pageBannerDefaults: {},
          }}
        />
      );
      await user.click(screen.getByRole("button", { name: /^icon$/i }));
      expect(screen.getByTitle("Briefcase")).toBeInTheDocument();
    });

    it("updates default page banner background URL", async () => {
      const user = userEvent.setup();
      render(
        <SiteHarness
          initial={{
            socialLinks: {},
            navBrand: {},
            pageBannerDefaults: {},
          }}
        />
      );
      const field = screen.getByPlaceholderText(/\/uploads\//i);
      await user.type(field, "https://cdn.example/bg.jpg");
      expect(field).toHaveValue("https://cdn.example/bg.jpg");
    });

    it("supports initials mode with color and image fill settings", async () => {
      const user = userEvent.setup();
      render(
        <SiteHarness
          initial={{
            socialLinks: {},
            navBrand: { mode: "none" },
            pageBannerDefaults: {},
          }}
        />
      );

      await user.click(screen.getByRole("button", { name: /^initials$/i }));
      const lettersInput = screen.getByPlaceholderText("AB");
      await user.type(lettersInput, "ABCD");
      expect(lettersInput).toHaveValue("AB");

      await user.click(screen.getByRole("button", { name: /color fill/i }));
      const colorPicker = screen.getAllByDisplayValue("#2563eb")[0];
      fireEvent.change(colorPicker, { target: { value: "#112233" } });
      expect(screen.getAllByDisplayValue("#112233").length).toBeGreaterThan(0);

      await user.click(screen.getByRole("button", { name: /picture background/i }));
      const imageField = screen.getAllByPlaceholderText(/https:\/\/\.\.\. or \/uploads/i)[0];
      await user.type(imageField, "https://cdn.example/initials.jpg");
      expect(imageField).toHaveValue("https://cdn.example/initials.jpg");
    });
  });

  describe("PortfolioAgentDesignPanel", () => {
    const preset = AGENT_THEME_PRESETS.aurora;

    it("renders preview and theme select", () => {
      const setPortfolio = jest.fn();
      render(
        <PortfolioAgentDesignPanel
          portfolio={{ themeId: "aurora", layoutMode: "stacked", themeTokens: {} }}
          setPortfolio={setPortfolio}
          activeThemePreset={preset}
          clearThemeOverrides={jest.fn()}
          setThemeToken={jest.fn()}
        />
      );
      expect(screen.getByTestId("agent-design-preview")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("calls clearThemeOverrides when Reset colors is clicked", async () => {
      const user = userEvent.setup();
      const clearThemeOverrides = jest.fn();
      render(
        <PortfolioAgentDesignPanel
          portfolio={{ themeId: "aurora", layoutMode: "stacked", themeTokens: { page: "#111111" } }}
          setPortfolio={jest.fn()}
          activeThemePreset={preset}
          clearThemeOverrides={clearThemeOverrides}
          setThemeToken={jest.fn()}
        />
      );
      await user.click(screen.getByRole("button", { name: /reset colors/i }));
      expect(clearThemeOverrides).toHaveBeenCalled();
    });

    it("lists layout mode options as radios", () => {
      render(
        <PortfolioAgentDesignPanel
          portfolio={{ themeId: "aurora", layoutMode: "stacked", themeTokens: {} }}
          setPortfolio={jest.fn()}
          activeThemePreset={preset}
          clearThemeOverrides={jest.fn()}
          setThemeToken={jest.fn()}
        />
      );
      expect(screen.getAllByRole("radio").length).toBeGreaterThan(0);
    });

    it("updates theme and token inputs", async () => {
      const user = userEvent.setup();
      const setPortfolio = jest.fn();
      const setThemeToken = jest.fn();
      render(
        <PortfolioAgentDesignPanel
          portfolio={{ themeId: "aurora", layoutMode: "stacked", themeTokens: {} }}
          setPortfolio={setPortfolio}
          activeThemePreset={preset}
          clearThemeOverrides={jest.fn()}
          setThemeToken={setThemeToken}
        />
      );

      await user.selectOptions(screen.getByRole("combobox"), "sunrise");
      expect(setPortfolio).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/^page$/i), { target: { value: "#111111" } });
      expect(setThemeToken).toHaveBeenCalledWith("page", "#111111");
    });
  });

  describe("PortfolioAgentAiPanel", () => {
    const baseProps = {
      aiEditShortcuts: ["Short 1"],
      handleGenerateAiProposal: jest.fn(),
      handleApplyAiProposal: jest.fn(),
      setAiInstruction: jest.fn(),
      aiInstruction: "",
      portfolio: { themeId: "aurora", layoutMode: "stacked" },
      sections: [{ visible: true }, { visible: false }],
      aiProposalDiff: [],
    };

    it("shows loading copy while checking access", () => {
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          aiAccessLoading
          hasAiAccess={false}
          aiUsage={null}
          aiProposalDisabled={false}
          aiLoading={false}
          saveDisabled={false}
          aiProposal={null}
        />
      );
      expect(screen.getByText(/checking subscription access/i)).toBeInTheDocument();
    });

    it("shows paywall when no AI access", () => {
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          aiAccessLoading={false}
          hasAiAccess={false}
          aiUsage={null}
          aiProposalDisabled
          aiLoading={false}
          saveDisabled={false}
          aiProposal={null}
        />
      );
      expect(screen.getByText(/ai editing is reserved for paid subscriptions/i)).toBeInTheDocument();
    });

    it("shows usage and shortcut when access granted", async () => {
      const user = userEvent.setup();
      const handleGenerateAiProposal = jest.fn();
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          handleGenerateAiProposal={handleGenerateAiProposal}
          aiAccessLoading={false}
          hasAiAccess
          aiUsage={{ remaining: 3, used: 1, limit: 4 }}
          aiProposalDisabled={false}
          aiLoading={false}
          saveDisabled={false}
          aiProposal={null}
        />
      );
      expect(screen.getByText(/3/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /short 1/i }));
      expect(handleGenerateAiProposal).toHaveBeenCalledWith("Short 1");
    });

    it("renders proposal preview and invokes apply", async () => {
      const user = userEvent.setup();
      const handleApplyAiProposal = jest.fn();
      const proposal = {
        source: "openai",
        changes: { summary: ["Theme tweak"] },
        proposal: {
          themeId: "ember",
          layoutMode: "single",
          sections: [{ visible: true }],
        },
      };
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          handleApplyAiProposal={handleApplyAiProposal}
          aiAccessLoading={false}
          hasAiAccess
          aiUsage={{ remaining: 1, used: 0, limit: 10 }}
          aiProposalDisabled={false}
          aiLoading={false}
          saveDisabled={false}
          aiProposal={proposal}
        />
      );
      expect(screen.getByText(/proposal preview/i)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /^apply$/i }));
      expect(handleApplyAiProposal).toHaveBeenCalled();
    });

    it("shows monthly limit message when remaining is zero", () => {
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          aiAccessLoading={false}
          hasAiAccess
          aiUsage={{ remaining: 0, used: 10, limit: 10 }}
          aiProposalDisabled
          aiLoading={false}
          saveDisabled={false}
          aiProposal={null}
        />
      );
      expect(screen.getByText(/used all ai edit proposals/i)).toBeInTheDocument();
    });

    it("submits the typed AI instruction from the main button", async () => {
      const user = userEvent.setup();
      const handleGenerateAiProposal = jest.fn();
      const setAiInstruction = jest.fn();
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          handleGenerateAiProposal={handleGenerateAiProposal}
          setAiInstruction={setAiInstruction}
          aiAccessLoading={false}
          hasAiAccess
          aiUsage={{ remaining: 2, used: 0, limit: 2 }}
          aiProposalDisabled={false}
          aiLoading={false}
          saveDisabled={false}
          aiProposal={null}
        />
      );

      await user.type(screen.getByRole("textbox"), "Make it calmer");
      expect(setAiInstruction).toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /generate ai proposal/i }));
      expect(handleGenerateAiProposal).toHaveBeenCalledWith();
    });

    it("renders fallback source and section diff statuses", () => {
      const proposal = {
        source: "fallback",
        changes: { summary: ["Reworked sections"] },
        proposal: {
          themeId: "ember",
          layoutMode: "single",
          sections: [{ visible: true }, { visible: true }, { visible: false }],
        },
      };
      render(
        <PortfolioAgentAiPanel
          {...baseProps}
          aiAccessLoading={false}
          hasAiAccess
          aiUsage={{ remaining: 1, used: 1, limit: 2 }}
          aiProposalDisabled={false}
          aiLoading={false}
          saveDisabled={false}
          aiProposal={proposal}
          aiProposalDiff={[
            {
              type: "hero",
              status: "added",
              label: "Hero",
              beforePreview: "none",
              afterPreview: "new hero",
            },
            {
              type: "summary",
              status: "removed",
              label: "Summary",
              beforePreview: "old summary",
              afterPreview: "none",
            },
            {
              type: "contact",
              status: "updated",
              label: "Contact",
              beforePreview: "old contact",
              afterPreview: "new contact",
            },
          ]}
        />
      );

      expect(screen.getByText(/fallback composer/i)).toBeInTheDocument();
      expect(screen.getByText(/^added$/i)).toBeInTheDocument();
      expect(screen.getByText(/^removed$/i)).toBeInTheDocument();
      expect(screen.getByText(/^updated$/i)).toBeInTheDocument();
    });
  });
});
