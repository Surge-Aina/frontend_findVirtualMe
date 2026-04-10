import { AGENT_THEME_PRESETS } from "./portfolio-themes/agentThemeResolver";

export const BLOCK_LABELS = {
  hero: "Hero",
  stats: "Statistics",
  services: "Services",
  gallery: "Gallery",
  blog: "Blog",
  contact: "Contact",
  hours: "Business Hours",
  seo: "SEO",
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  testimonials: "Testimonials",
  process: "Process Steps",
  dashboardChart: "Data Visualization",
  dashboardTable: "Data Table",
  faq: "FAQ",
  clientLogos: "Client Logos",
  certifications: "Certifications",
  languages: "Languages",
  team: "Team",
  videoEmbed: "Video Embed",
  caseStudy: "Case Study",
};

export const LAYOUT_MODE_OPTIONS = [
  {
    value: "stacked",
    label: "Stacked",
    description: "Show all visible sections on one scrolling page.",
  },
  {
    value: "singleSection",
    label: "Single section",
    description: "Show one section at a time with hash navigation.",
  },
];

export const AGENT_THEME_OPTIONS = Object.entries(AGENT_THEME_PRESETS).map(([value]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function deepClone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function getDefaultBlockDataInner(type, template = "agent") {
  switch (type) {
    case "hero":
      return template === "agent"
        ? {
            name: "Your Name",
            title: "Your role or specialty",
            bio: "Introduce the work this portfolio represents.",
            primaryButtonText: "Get in touch",
            primaryButtonUrl: "#contact",
            secondaryButtonText: "Explore work",
            secondaryButtonUrl: "#projects",
          }
        : {};
    case "summary":
      return {
        name: "Your Name",
        title: "Your professional title",
        bio: "Add a short background that helps visitors understand who you are.",
        summary: "Summarize your strengths, focus, or the kind of work you do.",
        email: "",
        phone: "",
        location: "",
      };
    case "contact":
      return {
        email: "",
        phone: "",
        location: "",
      };
    case "skills":
      return {
        items: ["Core skill", "Another skill"],
      };
    case "experience":
      return {
        items: [
          {
            title: "Role title",
            company: "Company",
            description: "Describe the work, ownership, and results.",
          },
        ],
      };
    case "education":
      return {
        items: [
          {
            school: "School or program",
            fieldOfStudy: "Field of study",
            description: "Relevant coursework, honors, or outcomes.",
          },
        ],
      };
    case "projects":
      return {
        items: [
          {
            name: "Project name",
            description: "What it is, what you did, and why it matters.",
            link: "",
          },
        ],
      };
    case "services":
      return {
        sectionTitle: "Services",
        sectionIntro: "Explain the types of work or outcomes you offer.",
        items: [{ title: "Service", description: "Describe this offer." }],
      };
    case "gallery":
      return template === "handyman"
        ? {
            sectionTitle: "Selected work",
            sectionSubtitle: "Show before and after transformations.",
            items: [{ title: "Project", category: "Category", subtitle: "", beforeImageUrl: "", afterImageUrl: "" }],
          }
        : {
            facilityImages: [{ url: "", caption: "Add a caption" }],
            beforeAfterCases: [],
          };
    case "blog":
      return {
        readMoreText: "Read more",
        viewAllText: "View all",
        posts: [
          {
            title: "Post title",
            excerpt: "Add a short teaser for this article.",
            category: "",
            content: "",
            image: "",
          },
        ],
      };
    case "process":
      return {
        sectionTitle: "How I work",
        steps: [{ number: 1, title: "Step title", description: "Explain this step." }],
      };
    case "testimonials":
      return {
        sectionTitle: "Testimonials",
        items: [{ name: "Client name", quote: "Add a short testimonial.", location: "", service: "" }],
      };
    case "stats":
      return {
        showStatsSection: true,
        yearsExperience: "5+",
        patientsServed: "",
        successRate: "",
        doctorsCount: "",
      };
    case "hours":
      return {
        weekdays: "9:00 AM - 5:00 PM",
        saturday: "",
        sunday: "",
      };
    case "seo":
      return {
        siteTitle: "",
        metaDescription: "",
        keywords: "",
      };
    case "dashboardChart":
      return {
        sectionTitle: "Performance Overview",
        chartTitle: "Performance Overview",
        sectionIntro: "Compare multiple metrics side by side and highlight a supporting breakdown.",
        xAxisLabel: "Quarter",
        yAxisLabel: "Value",
        summaryTitle: "Workflow split",
        data: {
          xLabels: ["Q1", "Q2", "Q3"],
          hiddenPoints: [],
          series: [
            { name: "Leads", color: "#10b981", values: [12, 18, 24] },
            { name: "Revenue", color: "#06b6d4", values: [1200, 1600, 2200] },
          ],
          sales: [12, 18, 24],
          revenue: [1200, 1600, 2200],
        },
        categories: ["Build", "Analyze", "Report"],
        categoryData: [40, 35, 25],
        summaryItems: [
          { label: "Build", value: 40, color: "#10b981" },
          { label: "Analyze", value: 35, color: "#8b5cf6" },
          { label: "Report", value: 25, color: "#f59e0b" },
        ],
        isActive: true,
      };
    case "dashboardTable":
      return {
        sectionTitle: "Data Table",
        tableTitle: "Data Table",
        sectionIntro: "Display structured information in either a table or card layout.",
        displayMode: "table",
        columnOrder: ["service", "status", "owner", "website", "completion"],
        tableData: [
          { service: "Analytics Dashboard", status: "Active", owner: "Casey", website: "https://example.com", completion: 92 },
        ],
        emptyStateText: "Add rows to display your data.",
      };
    case "faq":
      return {
        sectionTitle: "Frequently asked questions",
        sectionIntro: "Answer the questions people usually ask before they reach out.",
        items: [{ question: "What kind of work do you take on?", answer: "Add a concise answer." }],
      };
    case "clientLogos":
      return {
        sectionTitle: "Trusted by",
        sectionIntro: "Show the brands, partners, or clients that add credibility.",
        items: [{ name: "Client name", logoUrl: "", url: "" }],
      };
    case "certifications":
      return {
        sectionTitle: "Certifications",
        items: [
          {
            name: "Certification name",
            issuer: "Issuing organization",
            credentialId: "",
            earnedDate: "",
            expiresDate: "",
            url: "",
          },
        ],
      };
    case "languages":
      return {
        sectionTitle: "Languages",
        items: [{ name: "English", proficiency: "Native" }],
      };
    case "team":
      return {
        sectionTitle: "Team",
        sectionIntro: "Introduce the people behind the work.",
        items: [{ name: "Team member", role: "Role", bio: "Add a short bio.", imageUrl: "", profileUrl: "" }],
      };
    case "videoEmbed":
      return {
        sectionTitle: "Featured video",
        title: "Project reel or introduction",
        description: "Add a video that helps visitors understand your work quickly.",
        provider: "",
        embedUrl: "",
        videoUrl: "",
        posterImageUrl: "",
      };
    case "caseStudy":
      return {
        title: "Case study title",
        client: "",
        industry: "",
        challenge: "Describe the starting problem.",
        solution: "Explain what you changed or built.",
        outcome: "Summarize the result.",
        metrics: [],
        tools: [],
        link: "",
      };
    default:
      return {};
  }
}

export function getDefaultBlockData(type, template = "agent") {
  const data = getDefaultBlockDataInner(type, template);
  return { ...data, pageBanner: { enabled: false, bannerBackground: "gradient" } };
}

export function toCreateSections(sections = []) {
  return sections.map((section, index) => ({
    type: section.type,
    order: index,
    visible: section.visible !== false,
    data: deepClone(section.data) || {},
  }));
}

function hasText(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function summarizePrimitive(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function summarizeDataValue(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "";
    if (typeof value[0] === "string") {
      return value
        .filter((item) => typeof item === "string" && item.trim())
        .slice(0, 3)
        .join(", ");
    }
    if (typeof value[0] === "object" && value[0] !== null) {
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    }
  }
  if (value && typeof value === "object") {
    const firstText = Object.values(value)
      .map(summarizePrimitive)
      .find(Boolean);
    if (firstText) return firstText;
  }
  return "";
}

function getSectionByType(portfolio, type) {
  return (portfolio?.sections || []).find((section) => section.type === type && section.visible !== false);
}

function looksLikeUrl(value) {
  if (!hasText(value)) return false;
  const text = String(value).trim();
  return /^https?:\/\//i.test(text) || /^[\w.-]+\.[a-z]{2,}/i.test(text);
}

export function getReadinessReport(portfolio) {
  const issues = [];
  const positives = [];
  const sections = portfolio?.sections || [];
  const visibleSections = sections.filter((section) => section.visible !== false);
  const hiddenCount = sections.length - visibleSections.length;
  const hero = getSectionByType(portfolio, "hero");
  const summary = getSectionByType(portfolio, "summary");
  const contact = getSectionByType(portfolio, "contact");

  if (!hasText(portfolio?.title)) {
    issues.push("Add a portfolio title so the page feels intentional when shared.");
  } else {
    positives.push("Portfolio title is set.");
  }

  if (visibleSections.length === 0) {
    issues.push("No sections are currently visible.");
  } else {
    positives.push(`${visibleSections.length} section${visibleSections.length === 1 ? "" : "s"} will be visible.`);
  }

  if (!hero && !summary) {
    issues.push("Consider keeping a visible hero or summary section so visitors see an immediate introduction.");
  } else {
    positives.push("Visitors will land on an introductory section.");
  }

  const summaryData = summary?.data || {};
  if (summary && !hasText(summaryData.name) && !hasText(summaryData.title)) {
    issues.push("The summary section is visible but still missing a name or professional title.");
  }

  const contactData = contact?.data || {};
  if (contact) {
    if (!hasText(contactData.email) && !hasText(contactData.phone)) {
      issues.push("The contact section is visible but missing both email and phone.");
    } else {
      positives.push("Contact details are available in the contact section.");
    }
  } else {
    issues.push("Add a contact section or another clear call to action so visitors know how to reach you.");
  }

  if (hiddenCount > 0 && hiddenCount >= Math.ceil(sections.length / 2)) {
    issues.push("More than half of the sections are hidden. Double-check that the portfolio still tells a complete story.");
  }

  const socialLinks = portfolio?.socialLinks || {};
  const socialValues = Object.values(socialLinks).filter(hasText);
  if (socialValues.length > 0) {
    positives.push("At least one social or website link is configured.");
  }

  const brokenSocialLink = Object.entries(socialLinks).find(([, value]) => hasText(value) && !looksLikeUrl(value));
  if (brokenSocialLink) {
    issues.push(`The ${brokenSocialLink[0]} link may be incomplete. Use a full URL or a recognizable domain.`);
  }

  return {
    score: Math.max(0, 100 - issues.length * 15),
    issues,
    positives,
  };
}

export function getSectionPreview(section) {
  if (!section) return "Not present";
  const data = section.data || {};
  const orderedValues = Object.values(data)
    .map(summarizeDataValue)
    .filter(Boolean)
    .slice(0, 2);

  if (!orderedValues.length) {
    return section.visible === false ? "Hidden section" : "No content yet";
  }

  return orderedValues.join(" | ");
}

export function getAiProposalDiff(currentPortfolio, proposedPortfolio) {
  const currentSections = currentPortfolio?.sections || [];
  const nextSections = proposedPortfolio?.sections || [];
  const currentMap = new Map(currentSections.map((section) => [section.type, section]));
  const nextMap = new Map(nextSections.map((section) => [section.type, section]));
  const orderedTypes = Array.from(
    new Set([
      ...currentSections.map((section) => section.type),
      ...nextSections.map((section) => section.type),
    ])
  );

  return orderedTypes
    .map((type) => {
      const before = currentMap.get(type) || null;
      const after = nextMap.get(type) || null;
      if (!before && !after) return null;

      let status = "unchanged";
      if (!before && after) status = "added";
      else if (before && !after) status = "removed";
      else if (JSON.stringify(before) !== JSON.stringify(after)) status = "updated";

      return {
        type,
        label: BLOCK_LABELS[type] || type,
        status,
        beforePreview: getSectionPreview(before),
        afterPreview: getSectionPreview(after),
      };
    })
    .filter((item) => item && item.status !== "unchanged");
}
