import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
  useSyncExternalStore,
  lazy,
  Suspense,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  isFeatureComponentsDisabledError,
  isPortfolioDraftsDisabledError,
  portfolioApi,
} from "@/shared/api/portfolioApi";
import {
  FaSave,
  FaEye,
  FaArrowLeft,
  FaTrash,
  FaClone,
  FaUndo,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { HeroEditor, ContactEditor, JsonEditor } from "./PortfolioEditorFields";
import { PortfolioEditorContext } from "./context/PortfolioEditorContext";
import {
  StatsEditor,
  HoursEditor,
  SeoEditor,
  SummarySectionEditor,
  SkillsEditor,
  ExperienceEditor,
  EducationEditor,
  ProjectsEditor,
  ServicesDataEditor,
  GalleryDataEditor,
  BlogDataEditor,
  ProcessEditor,
  TestimonialsEditor,
  FaqEditor,
  ClientLogosEditor,
  CertificationsEditor,
  LanguagesEditor,
  TeamEditor,
  VideoEmbedEditor,
  CaseStudyEditor,
  AccountEditor,
} from "./portfolioSectionEditors";
import { DashboardChartEditor, DashboardTableEditor } from "./DashboardBlockEditors";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import { AGENT_THEME_PRESETS } from "./portfolio-themes/agentThemeResolver";
import {
  BLOCK_LABELS,
  getAiProposalDiff,
  getDefaultBlockData,
  getReadinessReport,
  toCreateSections,
} from "./portfolioEditorConfig";
import { AgentDesignPreview } from "./ai-creator/AgentDesignPreview";
import PageBannersPanel from "./PageBannersPanel";
import {
  PortfolioAgentAiPanel,
  PortfolioAgentDesignPanel,
  PortfolioPublishReadinessPanel,
  PortfolioSiteSettingsPanel,
} from "./ai-creator/PortfolioEditorWorkspacePanels";
import { mergeNavBrandDefaults } from "./PortfolioNavBrand";
import OwnerSubUsersPanel from "@/features/portfolio-users/OwnerSubUsersPanel";
import { logApiError } from "@/shared/api/safeLog";
import { PortfolioSectionNavigator } from "./PortfolioSectionNavigator";
import { SectionsStructurePanel } from "./SectionsStructurePanel";
import { isEditorNavigatorEnabled } from "./editorNavigatorFlag";
import { isEditorComponentsEnabled } from "./editorComponentsFlag";
import { buildPuckEditorConfig } from "./featureComponents/buildPuckEditorConfig";
import {
  isFeatureSectionBlockType,
  isUnifiedSiteTemplate,
} from "./featureComponents/puckBlockTypeMap";

const PuckFeatureSectionEditor = lazy(() =>
  import("./featureComponents/PuckFeatureSectionEditor").then((m) => ({
    default: m.PuckFeatureSectionEditor,
  }))
);

const PortfolioFeatureComponentsWorkspace = lazy(() =>
  import("./featureComponents/PortfolioFeatureComponentsWorkspace").then((m) => ({
    default: m.PortfolioFeatureComponentsWorkspace,
  }))
);
import { PortfolioDraftBanner } from "./PortfolioDraftBanner";
import { PortfolioVersionHistoryPanel } from "./PortfolioVersionHistoryPanel";
import {
  draftMetaFromDetail,
  draftMetaFromMutationResponse,
  mergeDraftMutationPortfolio,
  workingPortfolioFromDraftDetail,
} from "./portfolioDraftEditor";
import {
  MAX_PORTFOLIO_SECTIONS,
  SECTION_DISPLAY_LABEL_KEY,
  getSectionDisplayLabel,
  normalizeEditorDisplayLabel,
  sectionDataForPersistenceCompare,
} from "./portfolioEditorSections";

function clonePortfolio(value) {
  return value ? JSON.parse(JSON.stringify(value)) : null;
}

const LG_QUERY = "(min-width: 1024px)";

function useMediaQuery(query) {
  const getSnapshot = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;
  const subscribe = (callback) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", callback);
    return () => m.removeEventListener("change", callback);
  };
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

const INSPECTOR_TAB_LABELS = {
  sections: "Sections",
  components: "Components",
  site: "Site",
  banners: "Banners",
  design: "Design",
  publish: "Publish",
  ai: "AI",
  customers: "Customers",
};

const TEMPLATES_WITH_SUB_USERS = new Set(["healthcare"]);

const AI_EDIT_SHORTCUTS = [
  "Make it more minimal",
  "Make it bolder",
  "More professional",
  "More visual",
  "Switch to single-section",
];

function toComparablePortfolio(value) {
  if (!value) return null;
  return {
    title: value.title || "",
    socialLinks: value.socialLinks || {},
    sections: (value.sections || []).map((section) => ({
      _id: section._id || "",
      type: section.type,
      order: section.order,
      visible: section.visible !== false,
      data: sectionDataForPersistenceCompare(section.data, {
        includeEditorLabel: isEditorNavigatorEnabled(),
      }),
    })),
    themeId: value.themeId || "",
    themeTokens: value.themeTokens || {},
    layoutMode: value.layoutMode || "",
    pageBannerDefaults: value.pageBannerDefaults || {},
    navBrand: mergeNavBrandDefaults(value.navBrand),
  };
}

function SectionEditor({
  section,
  template,
  onDataChange,
  portfolioSections,
  featureComponentsActive,
  puckEditorConfig,
  onPersistFeatureSection,
  persistFeatureSectionDisabled,
}) {
  const { type, data } = section;

  if (featureComponentsActive && isFeatureSectionBlockType(type) && puckEditorConfig) {
    return (
      <Suspense
        fallback={
          <div className="text-sm text-gray-500 dark:text-neutral-400 py-8 text-center">
            Loading component editor…
          </div>
        }
      >
        <PuckFeatureSectionEditor
          section={section}
          puckConfig={puckEditorConfig}
          onPersistSection={(payload) => onPersistFeatureSection(section._id, payload)}
          persistDisabled={persistFeatureSectionDisabled}
        />
      </Suspense>
    );
  }

  const main = (() => {
    switch (type) {
      case "hero":
        return (
          <HeroEditor
            data={data}
            onChange={onDataChange}
            template={template}
            portfolioSections={portfolioSections}
          />
        );
      case "contact":
        return <ContactEditor data={data} onChange={onDataChange} template={template} />;
      case "stats":
        return <StatsEditor data={data} onChange={onDataChange} />;
      case "hours":
        return <HoursEditor data={data} onChange={onDataChange} />;
      case "seo":
        return <SeoEditor data={data} onChange={onDataChange} />;
      case "summary":
        return template === "projectManager" || template === "dataScientist" || template === "agent" ? (
          <SummarySectionEditor data={data} onChange={onDataChange} />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2">Summary section</p>
            <JsonEditor data={data} onChange={onDataChange} />
          </div>
        );
      case "skills":
        return <SkillsEditor data={data} onChange={onDataChange} />;
      case "experience":
        return <ExperienceEditor data={data} onChange={onDataChange} />;
      case "education":
        return <EducationEditor data={data} onChange={onDataChange} />;
      case "projects":
        return <ProjectsEditor data={data} onChange={onDataChange} />;
      case "services":
        return <ServicesDataEditor template={template} data={data} onChange={onDataChange} />;
      case "gallery":
        return <GalleryDataEditor template={template} data={data} onChange={onDataChange} />;
      case "blog":
        return <BlogDataEditor data={data} onChange={onDataChange} />;
      case "process":
        return <ProcessEditor data={data} onChange={onDataChange} />;
      case "testimonials":
        return <TestimonialsEditor data={data} onChange={onDataChange} />;
      case "dashboardChart":
        return <DashboardChartEditor data={data} onChange={onDataChange} />;
      case "dashboardTable":
        return <DashboardTableEditor data={data} onChange={onDataChange} />;
      case "faq":
        return <FaqEditor data={data} onChange={onDataChange} />;
      case "clientLogos":
        return <ClientLogosEditor data={data} onChange={onDataChange} />;
      case "certifications":
        return <CertificationsEditor data={data} onChange={onDataChange} />;
      case "languages":
        return <LanguagesEditor data={data} onChange={onDataChange} />;
      case "team":
        return <TeamEditor data={data} onChange={onDataChange} />;
      case "videoEmbed":
        return <VideoEmbedEditor data={data} onChange={onDataChange} />;
      case "caseStudy":
        return <CaseStudyEditor data={data} onChange={onDataChange} />;
      case "account":
        return <AccountEditor data={data} onChange={onDataChange} />;
      default:
        return (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Edit the JSON data for this <strong>{BLOCK_LABELS[type] || type}</strong> section:
            </p>
            <JsonEditor data={data} onChange={onDataChange} />
          </div>
        );
    }
  })();

  return <>{main}</>;
}

function MobileInspectorPanel({ tabId, panelVisible, children }) {
  const open = panelVisible(tabId);
  return <div className={open ? "block" : "hidden"}>{children}</div>;
}

export default function PortfolioEditor({ portfolioData: prefetched }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [portfolio, setPortfolio] = useState(prefetched || null);
  const [originalPortfolio, setOriginalPortfolio] = useState(
    prefetched ? clonePortfolio(prefetched) : null
  );
  const [loading, setLoading] = useState(!prefetched);
  const [saving, setSaving] = useState(false);
  const [structureBusy, setStructureBusy] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [remixing, setRemixing] = useState(false);
  const [aiAccessLoading, setAiAccessLoading] = useState(false);
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const [aiUsage, setAiUsage] = useState(null);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState(null);
  const [aiProposalBaseSnapshot, setAiProposalBaseSnapshot] = useState("");
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [addingSectionType, setAddingSectionType] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [inspectorTab, setInspectorTab] = useState("sections");
  const [mobileWorkspace, setMobileWorkspace] = useState("edit");
  const [draftsEnabled, setDraftsEnabled] = useState(false);
  const [draftSource, setDraftSource] = useState("owner");
  const [draftApprovalState, setDraftApprovalState] = useState(null);
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedBaseline, setPublishedBaseline] = useState(null);
  const [featureComponentsReady, setFeatureComponentsReady] = useState(false);
  const [featureComponentsPayload, setFeatureComponentsPayload] = useState(null);
  const [featureComponentsLoading, setFeatureComponentsLoading] = useState(false);
  const isLgUp = useMediaQuery(LG_QUERY);
  const navigatorEnabled = isEditorNavigatorEnabled();
  const componentsFlagOn = isEditorComponentsEnabled();

  const applyDraftDetail = useCallback((detail) => {
    const working = workingPortfolioFromDraftDetail(detail);
    if (!working) return false;
    setPortfolio(working);
    setOriginalPortfolio(clonePortfolio(working));
    setPublishedBaseline(detail.published ? clonePortfolio(detail.published) : null);
    const meta = draftMetaFromDetail({
      published: detail.published,
      draft: detail.draft,
      hasDraft: detail.hasDraft,
    });
    setHasUnpublishedDraft(meta.hasUnpublishedDraft);
    setDraftSource(meta.source);
    setDraftApprovalState(meta.approvalState);
    return true;
  }, []);

  const syncDraftMetaFromSave = useCallback(
    (savedPortfolio, publishedRef = null) => {
      if (!savedPortfolio?.draftMode) return;
      setDraftsEnabled(true);
      const meta = draftMetaFromMutationResponse(
        savedPortfolio,
        publishedRef ?? publishedBaseline
      );
      setHasUnpublishedDraft(meta.hasUnpublishedDraft);
      setDraftSource(meta.source);
      setDraftApprovalState(meta.approvalState);
    },
    [publishedBaseline]
  );

  const loadEditorPortfolio = useCallback(
    async (portfolioId, publishedFallback = null) => {
      try {
        const draftRes = await portfolioApi.getDraft(portfolioId);
        setDraftsEnabled(true);
        const detail = {
          published: draftRes.data?.published,
          draft: draftRes.data?.draft,
          hasDraft: Boolean(draftRes.data?.hasDraft),
        };
        applyDraftDetail(detail);
        return;
      } catch (err) {
        if (isPortfolioDraftsDisabledError(err)) {
          setDraftsEnabled(false);
          setHasUnpublishedDraft(false);
          setDraftSource("owner");
          setDraftApprovalState(null);
          setPublishedBaseline(null);
          const doc = publishedFallback || (await portfolioApi.getById(portfolioId)).data;
          setPortfolio(doc);
          setOriginalPortfolio(clonePortfolio(doc));
          return;
        }
        const res = await portfolioApi.getById(portfolioId);
        setPortfolio(res.data);
        setOriginalPortfolio(clonePortfolio(res.data));
      }
    },
    [applyDraftDetail]
  );

  useEffect(() => {
    if (!id && !prefetched) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        if (prefetched) {
          if (prefetched._id) {
            await loadEditorPortfolio(prefetched._id, prefetched);
          } else {
            setPortfolio(prefetched);
            setOriginalPortfolio(clonePortfolio(prefetched));
          }
        } else if (id) {
          await loadEditorPortfolio(id);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load portfolio");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, prefetched, loadEditorPortfolio]);

  useEffect(() => {
    if (!portfolio?.template) return;
    let cancelled = false;

    portfolioApi
      .getBlockTypes(
        portfolio.template,
        portfolio.template === "agent" ? { mode: "agent" } : {}
      )
      .then((res) => {
        if (!cancelled) {
          setAvailableBlocks(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableBlocks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [portfolio?.template]);

  useEffect(() => {
    if (!componentsFlagOn || !draftsEnabled || !portfolio?._id || !isUnifiedSiteTemplate(portfolio.template)) {
      setFeatureComponentsReady(false);
      setFeatureComponentsPayload(null);
      return;
    }

    let cancelled = false;
    setFeatureComponentsLoading(true);

    portfolioApi
      .getComponents(portfolio._id)
      .then((res) => {
        if (cancelled) return;
        setFeatureComponentsPayload(res.data);
        setFeatureComponentsReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isFeatureComponentsDisabledError(err)) {
          setFeatureComponentsReady(false);
          setFeatureComponentsPayload(null);
          return;
        }
        setFeatureComponentsReady(false);
        setFeatureComponentsPayload(null);
      })
      .finally(() => {
        if (!cancelled) setFeatureComponentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [componentsFlagOn, draftsEnabled, portfolio?._id, portfolio?.template]);

  const refreshFeatureComponentsData = useCallback((nextSections, title) => {
    setFeatureComponentsPayload((prev) => {
      if (!prev?.config) return prev;
      const content = (nextSections || [])
        .map((section) => {
          const puckType = Object.entries(prev.config.components || {}).find(
            ([, def]) => def?.metadata?.blockType === section.type
          )?.[0];
          if (!puckType) return null;
          return {
            type: puckType,
            props: { id: section._id, ...(section.data || {}) },
          };
        })
        .filter(Boolean);
      return {
        ...prev,
        data: {
          content,
          root: { props: { title: title || "" } },
          zones: {},
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!featureComponentsReady || !portfolio?.sections) return;
    refreshFeatureComponentsData(portfolio.sections, portfolio.title);
  }, [
    featureComponentsReady,
    portfolio?.sections,
    portfolio?.title,
    refreshFeatureComponentsData,
  ]);

  const isAgentTemplate = portfolio?.template === "agent";

  const supportsSubUsers = TEMPLATES_WITH_SUB_USERS.has(portfolio?.template);

  const puckEditorConfig = useMemo(() => {
    if (!featureComponentsReady || !featureComponentsPayload?.config || !portfolio?.template) {
      return null;
    }
    return buildPuckEditorConfig(featureComponentsPayload.config, portfolio.template);
  }, [featureComponentsReady, featureComponentsPayload, portfolio?.template]);

  const featureComponentsActive = Boolean(
    componentsFlagOn && featureComponentsReady && puckEditorConfig && draftsEnabled
  );

  const inspectorTabIds = useMemo(() => {
    const base = isAgentTemplate
      ? ["sections", "site", "banners", "design", "publish", "ai"]
      : ["sections", "site", "banners", "publish"];
    if (featureComponentsActive) {
      base.splice(1, 0, "components");
    }
    if (supportsSubUsers) base.push("customers");
    return base;
  }, [isAgentTemplate, supportsSubUsers, featureComponentsActive]);

  useEffect(() => {
    if (!inspectorTabIds.includes(inspectorTab)) {
      setInspectorTab("site");
    }
  }, [inspectorTabIds, inspectorTab]);

  useEffect(() => {
    if (!isAgentTemplate && (mobileWorkspace === "design" || mobileWorkspace === "ai")) {
      setMobileWorkspace("edit");
    }
  }, [isAgentTemplate, mobileWorkspace]);

  const mobileWorkspaceTabs = useMemo(
    () => [
      { id: "edit", label: "Edit" },
      { id: "sections", label: "Sections" },
      ...(featureComponentsActive ? [{ id: "components", label: "Components" }] : []),
      { id: "site", label: "Site" },
      { id: "banners", label: "Banners" },
      ...(isAgentTemplate
        ? [
            { id: "design", label: "Design" },
            { id: "ai", label: "AI" },
          ]
        : []),
      { id: "publish", label: "Publish" },
    ],
    [isAgentTemplate, featureComponentsActive]
  );

  useEffect(() => {
    if (!isAgentTemplate || !user?._id) {
      setHasAiAccess(false);
      setAiUsage(null);
      setAiAccessLoading(false);
      return;
    }
    let cancelled = false;

    setAiAccessLoading(true);
    axiosAuth
      .get("/api/users/ai-edit-access")
      .then((res) => {
        if (!cancelled) {
          setHasAiAccess(Boolean(res.data?.hasAccess));
          setAiUsage(res.data?.usage || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasAiAccess(false);
          setAiUsage(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAiAccessLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAgentTemplate, user?._id, user?.email]);

  const sections = useMemo(
    () => (portfolio?.sections ? [...portfolio.sections].sort((a, b) => a.order - b.order) : []),
    [portfolio?.sections]
  );

  const addableBlocks = useMemo(() => {
    const existingTypes = new Set(sections.map((section) => section.type));
    return availableBlocks.filter((block) => !existingTypes.has(block.type));
  }, [availableBlocks, sections]);
  const readiness = useMemo(() => getReadinessReport(portfolio), [portfolio]);
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(toComparablePortfolio(portfolio)) !==
      JSON.stringify(toComparablePortfolio(originalPortfolio))
    );
  }, [portfolio, originalPortfolio]);
  const portfolioSnapshot = useMemo(
    () => JSON.stringify(toComparablePortfolio(portfolio)),
    [portfolio]
  );
  const aiProposalDiff = useMemo(() => {
    if (!aiProposal?.proposal || !portfolio) return [];
    return getAiProposalDiff(portfolio, aiProposal.proposal);
  }, [aiProposal, portfolio]);

  useEffect(() => {
    if (activeIdx > Math.max(0, sections.length - 1)) {
      setActiveIdx(Math.max(0, sections.length - 1));
    }
  }, [activeIdx, sections.length]);

  useEffect(() => {
    if (aiProposal && aiProposalBaseSnapshot && portfolioSnapshot !== aiProposalBaseSnapshot) {
      setAiProposal(null);
      setAiProposalBaseSnapshot("");
    }
  }, [aiProposal, aiProposalBaseSnapshot, portfolioSnapshot]);

  useEffect(() => {
    if (!addableBlocks.length) {
      setAddingSectionType("");
      return;
    }
    if (!addableBlocks.some((block) => block.type === addingSectionType)) {
      setAddingSectionType(addableBlocks[0].type);
    }
  }, [addableBlocks, addingSectionType]);

  const handleSectionDataChange = useCallback((sectionId, newData) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s._id === sectionId ? { ...s, data: newData } : s)),
    }));
  }, []);

  const patchSectionPageBanner = useCallback((sectionId, patch) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s._id !== sectionId) return s;
        const data = s.data || {};
        const pb = data.pageBanner && typeof data.pageBanner === "object" ? data.pageBanner : {};
        return { ...s, data: { ...data, pageBanner: { ...pb, ...patch } } };
      }),
    }));
  }, []);

  const handleSectionVisibilityChange = useCallback((sectionId, visible) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s._id === sectionId ? { ...s, visible } : s)),
    }));
  }, []);

  const handleRenameSection = useCallback((sectionId, label) => {
    const trimmed = normalizeEditorDisplayLabel(label);
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s._id !== sectionId) return s;
        const data = { ...(s.data || {}) };
        if (trimmed) {
          data[SECTION_DISPLAY_LABEL_KEY] = trimmed;
        } else {
          delete data[SECTION_DISPLAY_LABEL_KEY];
        }
        return { ...s, data };
      }),
    }));
  }, []);

  const applyPortfolioFromServer = useCallback(
    (nextPortfolio, options = {}) => {
      const { resetBaseline = true, currentPortfolio = null, publishedRef = null } = options;
      setPortfolio((prev) => {
        const base = currentPortfolio ?? prev;
        if (nextPortfolio?.draftMode) {
          return mergeDraftMutationPortfolio(base, nextPortfolio);
        }
        return nextPortfolio;
      });
      if (resetBaseline) {
        setOriginalPortfolio((prev) => {
          const base = currentPortfolio ?? prev;
          if (nextPortfolio?.draftMode) {
            return clonePortfolio(mergeDraftMutationPortfolio(base, nextPortfolio));
          }
          return clonePortfolio(nextPortfolio);
        });
      }
      syncDraftMetaFromSave(nextPortfolio, publishedRef);
    },
    [syncDraftMetaFromSave]
  );

  const handleDraftRestored = useCallback(
    async (revertPayload) => {
      const draft = revertPayload?.draft;
      if (!portfolio || !draft) return;
      const merged = workingPortfolioFromDraftDetail({
        published: portfolio,
        draft,
        hasDraft: true,
      });
      setPortfolio(merged);
      setOriginalPortfolio(clonePortfolio(merged));
      const meta = draftMetaFromDetail({
        published: publishedBaseline,
        draft,
        hasDraft: true,
      });
      setHasUnpublishedDraft(meta.hasUnpublishedDraft);
      setDraftSource(meta.source);
      setDraftApprovalState(meta.approvalState);
      setActiveIdx(0);
    },
    [portfolio, publishedBaseline]
  );

  const setSocialLink = (key, val) => {
    setPortfolio((p) => ({
      ...p,
      socialLinks: { ...(p.socialLinks || {}), [key]: val },
    }));
  };

  const persistPortfolio = useCallback(async (current, options = {}) => {
    if (!current?._id) return null;
    const { showToast = true } = options;

    const response = await portfolioApi.update(current._id, {
      title: current.title,
      socialLinks: current.socialLinks,
      sections: current.sections,
      themeId: current.themeId,
      themeTokens: current.themeTokens,
      layoutMode: current.layoutMode,
      pageBannerDefaults: current.pageBannerDefaults || {},
      navBrand: mergeNavBrandDefaults(current.navBrand),
    });

    const nextPortfolio = response.data?.portfolio || current;
    applyPortfolioFromServer(nextPortfolio, {
      currentPortfolio: current,
      publishedRef: publishedBaseline,
    });
    if (showToast) {
      toast.success(draftsEnabled ? "Draft saved" : "Portfolio saved");
    }
    return nextPortfolio;
  }, [applyPortfolioFromServer, draftsEnabled, publishedBaseline]);

  const saveCurrentChangesIfNeeded = useCallback(async () => {
    if (!portfolio || !isDirty) return portfolio;
    setSaving(true);
    try {
      return await persistPortfolio(portfolio, { showToast: false });
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed before applying that change");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [isDirty, persistPortfolio, portfolio]);

  const handleSave = async () => {
    if (!portfolio) return;
    setSaving(true);
    try {
      await persistPortfolio(portfolio);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSection = async (sectionId) => {
    if (!window.confirm("Remove this section?")) return;
    try {
      setStructureBusy(true);
      await saveCurrentChangesIfNeeded();
      const res = await portfolioApi.removeSection(portfolio._id, sectionId);
      applyPortfolioFromServer(res.data.portfolio, { currentPortfolio: portfolio });
      if (activeIdx >= sections.length - 1) setActiveIdx(Math.max(0, activeIdx - 1));
      toast.success("Section removed");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove section");
    } finally {
      setStructureBusy(false);
    }
  };

  const handleMoveSection = async (index, direction) => {
    if (!portfolio?._id) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const orderedIds = [...sections].map((section) => section._id).filter(Boolean);
    if (orderedIds.length !== sections.length) {
      toast.error("This portfolio cannot be reordered yet.");
      return;
    }

    const nextIds = [...orderedIds];
    [nextIds[index], nextIds[targetIndex]] = [nextIds[targetIndex], nextIds[index]];

    try {
      setStructureBusy(true);
      await saveCurrentChangesIfNeeded();
      const res = await portfolioApi.reorderSections(portfolio._id, nextIds);
      applyPortfolioFromServer(res.data.portfolio, { currentPortfolio: portfolio });
      setActiveIdx(targetIndex);
      toast.success("Section order updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reorder sections");
    } finally {
      setStructureBusy(false);
    }
  };

  const handleDragReorder = async (fromIdx, toIdx) => {
    if (!portfolio?._id || fromIdx === toIdx) return;
    const orderedIds = [...sections].map((section) => section._id).filter(Boolean);
    if (orderedIds.length !== sections.length) {
      toast.error("This portfolio cannot be reordered yet.");
      return;
    }
    const nextIds = [...orderedIds];
    const [moved] = nextIds.splice(fromIdx, 1);
    nextIds.splice(toIdx, 0, moved);

    try {
      setStructureBusy(true);
      await saveCurrentChangesIfNeeded();
      const res = await portfolioApi.reorderSections(portfolio._id, nextIds);
      applyPortfolioFromServer(res.data.portfolio, { currentPortfolio: portfolio });
      setActiveIdx(toIdx);
      toast.success("Section order updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reorder sections");
    } finally {
      setStructureBusy(false);
    }
  };

  const handlePersistFeatureSection = useCallback(
    async (sectionId, puckPayload) => {
      if (!portfolio?._id) return;
      const section = portfolio.sections?.find((s) => s._id === sectionId);
      const merged = {
        ...(section?.data || {}),
        ...puckPayload,
      };
      handleSectionDataChange(sectionId, merged);
      try {
        const res = await portfolioApi.updateSection(portfolio._id, sectionId, merged);
        applyPortfolioFromServer(res.data.portfolio, { currentPortfolio: portfolio });
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to save component");
      }
    },
    [applyPortfolioFromServer, handleSectionDataChange, portfolio]
  );

  const handleAddSection = async () => {
    if (!portfolio?._id || !addingSectionType) return;
    if (navigatorEnabled && sections.length >= MAX_PORTFOLIO_SECTIONS) {
      toast.error(`You can add at most ${MAX_PORTFOLIO_SECTIONS} sections.`);
      return;
    }

    try {
      setAddingSection(true);
      await saveCurrentChangesIfNeeded();
      const res = await portfolioApi.addSection(
        portfolio._id,
        addingSectionType,
        getDefaultBlockData(addingSectionType, portfolio.template),
        sections.length
      );
      const nextPortfolio = res.data.portfolio;
      const nextSections = [...(nextPortfolio.sections || [])].sort(
        (a, b) => a.order - b.order
      );
      applyPortfolioFromServer(nextPortfolio, { currentPortfolio: portfolio });
      setActiveIdx(Math.max(0, nextSections.length - 1));
      toast.success(`${BLOCK_LABELS[addingSectionType] || addingSectionType} added`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add section");
    } finally {
      setAddingSection(false);
    }
  };

  const handlePublish = async () => {
    if (!portfolio?._id || !draftsEnabled) return;
    if (!window.confirm("Publish your draft to the live site? Visitors will see these changes.")) {
      return;
    }
    setPublishing(true);
    try {
      await saveCurrentChangesIfNeeded();
      const res = await portfolioApi.publish(portfolio._id);
      const published = res.data?.portfolio;
      if (published) {
        applyPortfolioFromServer(published);
        const nextPublished = clonePortfolio(published);
        setPublishedBaseline(nextPublished);
        const meta = draftMetaFromDetail({
          published: nextPublished,
          draft: { ...nextPublished, approvalState: "approved", source: "owner" },
          hasDraft: true,
        });
        setHasUnpublishedDraft(meta.hasUnpublishedDraft);
        setDraftApprovalState("approved");
        setDraftSource("owner");
      }
      const versionNumber = res.data?.versionNumber;
      toast.success(
        versionNumber ? `Published live as version ${versionNumber}` : "Published live"
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = () => {
    if (!originalPortfolio || !isDirty) return;
    if (!window.confirm("Discard your unsaved changes and restore the last saved version?")) {
      return;
    }
    setPortfolio(clonePortfolio(originalPortfolio));
    setAiProposal(null);
    setAiProposalBaseSnapshot("");
    toast.info("Unsaved changes were discarded");
  };

  const handleRemix = async () => {
    if (!portfolio) return;

    setRemixing(true);
    try {
      const source = await saveCurrentChangesIfNeeded();
      const current = source || portfolio;
      const baseTitle = (current.title || "Portfolio").trim();
      const response = await portfolioApi.create(current.template, {
        title: `${baseTitle} Remix`,
        visibility: "private",
        socialLinks: current.socialLinks || {},
        sections: toCreateSections(current.sections),
        themeId: current.themeId,
        themeTokens: current.themeTokens || {},
        layoutMode: current.layoutMode,
        pageBannerDefaults: current.pageBannerDefaults || {},
      });

      const created = response.data?.portfolio;
      const createdId = created?._id;
      if (!createdId) {
        throw new Error("No remixed portfolio was returned");
      }

      try {
        await axiosAuth.patch("/api/users/portfolio-id", {
          portfolioId: createdId,
          portfolioType: current.template,
          isPublic: false,
          portfolioName: created.title || `${baseTitle} Remix`,
        });
      } catch (linkErr) {
        logApiError(linkErr, "addPortfolioId");
      }

      await refreshUser?.();
      toast.success("Remix created");
      navigate(`/portfolios/view/${createdId}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to remix portfolio");
    } finally {
      setRemixing(false);
    }
  };

  const setThemeToken = (key, value) => {
    setPortfolio((prev) => ({
      ...prev,
      themeTokens: {
        ...(prev.themeTokens || {}),
        [key]: value,
      },
    }));
  };

  const clearThemeOverrides = () => {
    setPortfolio((prev) => {
      const nextTokens = { ...(prev.themeTokens || {}) };
      delete nextTokens.page;
      delete nextTokens.text;
      delete nextTokens.accent;
      delete nextTokens.accentStrong;
      delete nextTokens.panel;
      delete nextTokens.panelAlt;
      return {
        ...prev,
        themeTokens: nextTokens,
      };
    });
  };

  const handleGenerateAiProposal = async (nextInstruction = aiInstruction) => {
    const instruction = String(nextInstruction || "").trim();
    if (!instruction || !portfolio?._id) {
      toast.error("Enter an AI edit request first");
      return;
    }

    setAiLoading(true);
    try {
      const currentSnapshot = JSON.stringify(toComparablePortfolio(portfolio));
      const res = await portfolioApi.proposeAgentEdit(portfolio._id, {
        instruction,
        currentDraft: toComparablePortfolio(portfolio),
      });
      setAiInstruction(instruction);
      setAiProposal(res.data);
      setAiUsage(res.data?.usage || aiUsage);
      setAiProposalBaseSnapshot(currentSnapshot);
      toast.success("AI edit proposal ready");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "PREMIUM_REQUIRED") {
        setHasAiAccess(false);
      }
      if (err.response?.data?.usage) {
        setAiUsage(err.response.data.usage);
      }
      toast.error(
        err.response?.data?.error || err.response?.data?.message || "Failed to generate AI edit proposal"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiProposal = async () => {
    const proposed = aiProposal?.proposal;
    if (!proposed || !portfolio) return;

    setSaving(true);
    try {
      setAiProposal(null);
      setAiProposalBaseSnapshot("");
      const nextPortfolio = {
        ...portfolio,
        title: proposed.title,
        socialLinks: proposed.socialLinks,
        sections: proposed.sections,
        themeId: proposed.themeId,
        themeTokens: proposed.themeTokens,
        layoutMode: proposed.layoutMode,
        pageBannerDefaults: proposed.pageBannerDefaults ?? portfolio.pageBannerDefaults,
        navBrand: proposed.navBrand ?? portfolio.navBrand,
      };
      await persistPortfolio(nextPortfolio);
      setActiveIdx(0);
      toast.success("AI edits applied");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to apply AI edits");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-950">
        <p className="text-gray-600 dark:text-neutral-400">Portfolio not found</p>
      </div>
    );
  }

  const activeSection = sections[activeIdx];
  const activeSectionHeading = activeSection
    ? navigatorEnabled
      ? getSectionDisplayLabel(activeSection)
      : BLOCK_LABELS[activeSection.type] || activeSection.type
    : "";
  const sl = portfolio.socialLinks || {};
  const nb = mergeNavBrandDefaults(portfolio.navBrand);
  const activeThemePreset =
    AGENT_THEME_PRESETS[portfolio.themeId] || AGENT_THEME_PRESETS.aurora;
  const saveDisabled =
    saving ||
    structureBusy ||
    addingSection ||
    remixing ||
    aiLoading ||
    publishing ||
    featureComponentsLoading;
  const aiProposalDisabled = saveDisabled || (aiUsage?.remaining ?? 1) <= 0;

  const panelVisible = (tabId) => {
    if (tabId === "sections") return isLgUp && inspectorTab === "sections";
    return isLgUp ? inspectorTab === tabId : mobileWorkspace === tabId;
  };
  const showLeftRail =
    (!isLgUp && mobileWorkspace === "sections") || (isLgUp && inspectorTab === "sections");
  const hideMainMobile = !isLgUp && mobileWorkspace !== "edit";
  const hideInspectorMobile =
    !isLgUp && (mobileWorkspace === "edit" || mobileWorkspace === "sections");

  const featureComponentsPanel =
    featureComponentsActive && featureComponentsPayload?.data ? (
      <Suspense
        fallback={
          <div className="text-sm text-gray-500 dark:text-neutral-400 py-12 text-center">
            Loading Puck editor…
          </div>
        }
      >
        <PortfolioFeatureComponentsWorkspace
          portfolioId={portfolio._id}
          template={portfolio.template}
          puckConfig={puckEditorConfig}
          puckData={featureComponentsPayload.data}
          approvalState={featureComponentsPayload.approvalState ?? draftApprovalState}
          source={featureComponentsPayload.source ?? draftSource}
          sections={sections}
          saveBeforeStructureChange={saveCurrentChangesIfNeeded}
          onPortfolioUpdate={(nextPortfolio) => {
            applyPortfolioFromServer(nextPortfolio, { currentPortfolio: portfolio });
          }}
          busy={structureBusy}
          setBusy={setStructureBusy}
        />
      </Suspense>
    ) : (
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        Feature components are not available for this site.
      </p>
    );

  return (
    <PortfolioEditorContext.Provider value={{ portfolioId: portfolio._id }}>
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950">
      <div className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 shadow-sm">
        <PortfolioDraftBanner
          portfolioId={portfolio._id}
          draftsEnabled={draftsEnabled}
          hasUnpublishedDraft={hasUnpublishedDraft || isDirty}
          draftSource={draftSource}
          approvalState={draftApprovalState}
          publishing={publishing}
          onPublish={handlePublish}
        />
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex items-start gap-3 min-w-0 w-full lg:flex-1 lg:min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="shrink-0 mt-1 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>
            <div className="min-w-0 flex-1 space-y-1">
              <input
                className="w-full min-w-0 max-w-full text-base sm:text-lg font-semibold bg-transparent text-gray-900 dark:text-neutral-100 border-b border-transparent hover:border-gray-300 dark:hover:border-neutral-600 focus:border-blue-500 focus:outline-none px-1"
                value={portfolio.title || ""}
                onChange={(e) => setPortfolio((p) => ({ ...p, title: e.target.value }))}
                placeholder="Portfolio title"
              />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-neutral-400">
                <span className="capitalize">{portfolio.template}</span>
                {draftsEnabled && (hasUnpublishedDraft || isDirty) ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                    Draft not live
                  </span>
                ) : null}
                {isDirty && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto lg:flex-nowrap lg:justify-end shrink-0">
            <Link
              to={`/portfolios/view/${portfolio._id}`}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm sm:text-base"
              title="Preview"
              aria-label="Preview portfolio"
            >
              <FaEye className="shrink-0" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
            <button
              type="button"
              onClick={handleRemix}
              disabled={saveDisabled}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-sm sm:text-base"
              title="Remix"
              aria-label={remixing ? "Remixing" : "Remix portfolio"}
            >
              <FaClone className="shrink-0" />
              <span className="hidden sm:inline">{remixing ? "Remixing..." : "Remix"}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saveDisabled}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-sm sm:text-base"
              title="Reset"
              aria-label="Reset unsaved changes"
            >
              <FaUndo className="shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              title="Save"
              aria-label={saving ? "Saving" : "Save portfolio"}
            >
              <FaSave className="shrink-0" />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
        <div className="hidden lg:block border-t border-gray-100 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-2">
            {inspectorTabIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setInspectorTab(id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  inspectorTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}
              >
                {INSPECTOR_TAB_LABELS[id] || id}
              </button>
            ))}
          </div>
        </div>
        <div className="lg:hidden border-t border-gray-100 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
            {mobileWorkspaceTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMobileWorkspace(tab.id);
                  if (
                    ["sections", "components", "site", "banners", "design", "publish", "ai"].includes(
                      tab.id
                    )
                  ) {
                    setInspectorTab(tab.id);
                  }
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                  mobileWorkspace === tab.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <aside
          className={`w-full shrink-0 space-y-4 lg:w-64 ${showLeftRail ? "" : "hidden"}`}
        >
          {navigatorEnabled ? (
            <PortfolioSectionNavigator
              sections={sections}
              activeIdx={activeIdx}
              onActivateSection={(idx) => {
                setActiveIdx(idx);
                if (!isLgUp) setMobileWorkspace("edit");
              }}
              handleMoveSection={handleMoveSection}
              handleDragReorder={handleDragReorder}
              handleSectionVisibilityChange={handleSectionVisibilityChange}
              onRenameSection={handleRenameSection}
              onRemoveSection={handleRemoveSection}
              addableBlocks={addableBlocks}
              addingSectionType={addingSectionType}
              setAddingSectionType={setAddingSectionType}
              handleAddSection={handleAddSection}
              addingSection={addingSection}
              saveDisabled={saveDisabled}
            />
          ) : (
            <SectionsStructurePanel
              sections={sections}
              activeIdx={activeIdx}
              onActivateSection={(idx) => {
                setActiveIdx(idx);
                if (!isLgUp) setMobileWorkspace("edit");
              }}
              handleMoveSection={handleMoveSection}
              handleSectionVisibilityChange={handleSectionVisibilityChange}
              addableBlocks={addableBlocks}
              addingSectionType={addingSectionType}
              setAddingSectionType={setAddingSectionType}
              handleAddSection={handleAddSection}
              addingSection={addingSection}
              saveDisabled={saveDisabled}
            />
          )}
        </aside>

        <main
          className={`flex-1 min-w-0 ${hideMainMobile ? "hidden" : ""} lg:block`}
        >
          {isLgUp ? (
            <>
              {inspectorTab === "sections" &&
                (activeSection ? (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                        {activeSectionHeading}
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(activeSection._id)}
                        disabled={saveDisabled}
                        className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50"
                        title="Remove section"
                        aria-label="Remove section from editor"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <SectionEditor
                      section={activeSection}
                      template={portfolio.template}
                      onDataChange={(newData) => handleSectionDataChange(activeSection._id, newData)}
                      portfolioSections={sections}
                      featureComponentsActive={featureComponentsActive}
                      puckEditorConfig={puckEditorConfig}
                      onPersistFeatureSection={handlePersistFeatureSection}
                      persistFeatureSectionDisabled={saveDisabled}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center text-gray-500 dark:text-neutral-400">
                    No sections yet. Add a section to get started.
                  </div>
                ))}
              {inspectorTab === "components" && featureComponentsActive && (
                <div className="w-full max-w-6xl mx-auto">{featureComponentsPanel}</div>
              )}
              {inspectorTab === "site" && (
                <div className="w-full max-w-4xl mx-auto space-y-4">
                  <PortfolioSiteSettingsPanel
                    portfolio={portfolio}
                    setPortfolio={setPortfolio}
                    nb={nb}
                    sl={sl}
                    setSocialLink={setSocialLink}
                  />
                </div>
              )}
              {inspectorTab === "banners" && (
                <div className="w-full max-w-4xl mx-auto">
                  <PageBannersPanel sections={sections} onPatchPageBanner={patchSectionPageBanner} />
                </div>
              )}
              {isAgentTemplate && inspectorTab === "design" && (
                <div className="w-full max-w-4xl mx-auto">
                  <PortfolioAgentDesignPanel
                    portfolio={portfolio}
                    setPortfolio={setPortfolio}
                    activeThemePreset={activeThemePreset}
                    clearThemeOverrides={clearThemeOverrides}
                    setThemeToken={setThemeToken}
                  />
                </div>
              )}
              {inspectorTab === "publish" && (
                <div className="w-full max-w-4xl mx-auto space-y-4">
                  <PortfolioPublishReadinessPanel readiness={readiness} />
                  <PortfolioVersionHistoryPanel
                    portfolioId={portfolio._id}
                    draftsEnabled={draftsEnabled}
                    onDraftRestored={handleDraftRestored}
                  />
                </div>
              )}
              {inspectorTab === "customers" && supportsSubUsers && (
                <div className="w-full max-w-4xl mx-auto">
                  <OwnerSubUsersPanel portfolioId={portfolio?._id} />
                </div>
              )}
              {isAgentTemplate && inspectorTab === "ai" && (
                <div className="w-full max-w-4xl mx-auto">
                  <PortfolioAgentAiPanel
                    aiAccessLoading={aiAccessLoading}
                    hasAiAccess={hasAiAccess}
                    aiUsage={aiUsage}
                    aiEditShortcuts={AI_EDIT_SHORTCUTS}
                    handleGenerateAiProposal={handleGenerateAiProposal}
                    aiProposalDisabled={aiProposalDisabled}
                    aiInstruction={aiInstruction}
                    setAiInstruction={setAiInstruction}
                    aiLoading={aiLoading}
                    handleApplyAiProposal={handleApplyAiProposal}
                    saveDisabled={saveDisabled}
                    aiProposal={aiProposal}
                    portfolio={portfolio}
                    sections={sections}
                    aiProposalDiff={aiProposalDiff}
                  />
                </div>
              )}
            </>
          ) : activeSection ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {activeSectionHeading}
                </h2>
                <button
                  type="button"
                  onClick={() => handleRemoveSection(activeSection._id)}
                  disabled={saveDisabled}
                  className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50"
                  title="Remove section"
                  aria-label="Remove section from editor"
                >
                  <FaTrash />
                </button>
              </div>
              <SectionEditor
                section={activeSection}
                template={portfolio.template}
                onDataChange={(newData) => handleSectionDataChange(activeSection._id, newData)}
                portfolioSections={sections}
                featureComponentsActive={featureComponentsActive}
                puckEditorConfig={puckEditorConfig}
                onPersistFeatureSection={handlePersistFeatureSection}
                persistFeatureSectionDisabled={saveDisabled}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center text-gray-500 dark:text-neutral-400">
              No sections yet. Add a section to get started.
            </div>
          )}
        </main>

        <aside
          className={`w-full shrink-0 flex flex-col min-h-0 gap-2 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden ${hideInspectorMobile ? "hidden" : ""} lg:hidden`}
        >
          {featureComponentsActive ? (
            <MobileInspectorPanel tabId="components" panelVisible={panelVisible}>
              <div className="w-full">{featureComponentsPanel}</div>
            </MobileInspectorPanel>
          ) : null}

          <MobileInspectorPanel tabId="site" panelVisible={panelVisible}>
            <PortfolioSiteSettingsPanel
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              nb={nb}
              sl={sl}
              setSocialLink={setSocialLink}
            />
          </MobileInspectorPanel>


          <MobileInspectorPanel tabId="banners" panelVisible={panelVisible}>
            <PageBannersPanel sections={sections} onPatchPageBanner={patchSectionPageBanner} />
          </MobileInspectorPanel>

          {isAgentTemplate && (
            <MobileInspectorPanel tabId="design" panelVisible={panelVisible}>
              <PortfolioAgentDesignPanel
                portfolio={portfolio}
                setPortfolio={setPortfolio}
                activeThemePreset={activeThemePreset}
                clearThemeOverrides={clearThemeOverrides}
                setThemeToken={setThemeToken}
              />
            </MobileInspectorPanel>
          )}


          <MobileInspectorPanel tabId="publish" panelVisible={panelVisible}>
            <div className="space-y-4">
              <PortfolioPublishReadinessPanel readiness={readiness} />
              <PortfolioVersionHistoryPanel
                portfolioId={portfolio._id}
                draftsEnabled={draftsEnabled}
                onDraftRestored={handleDraftRestored}
              />
            </div>
          </MobileInspectorPanel>


          {isAgentTemplate && (
            <MobileInspectorPanel tabId="ai" panelVisible={panelVisible}>
              <PortfolioAgentAiPanel
                aiAccessLoading={aiAccessLoading}
                hasAiAccess={hasAiAccess}
                aiUsage={aiUsage}
                aiEditShortcuts={AI_EDIT_SHORTCUTS}
                handleGenerateAiProposal={handleGenerateAiProposal}
                aiProposalDisabled={aiProposalDisabled}
                aiInstruction={aiInstruction}
                setAiInstruction={setAiInstruction}
                aiLoading={aiLoading}
                handleApplyAiProposal={handleApplyAiProposal}
                saveDisabled={saveDisabled}
                aiProposal={aiProposal}
                portfolio={portfolio}
                sections={sections}
                aiProposalDiff={aiProposalDiff}
              />
            </MobileInspectorPanel>
          )}

        </aside>
      </div>
    </div>
    </PortfolioEditorContext.Provider>
  );
}
