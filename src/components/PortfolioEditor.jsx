import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { portfolioApi } from "../api/portfolioApi";
import { FaSave, FaEye, FaArrowLeft, FaTrash, FaGripVertical } from "react-icons/fa";
import { toast } from "react-toastify";
import { HeroEditor, ContactEditor, FieldEditor, JsonEditor } from "./PortfolioEditorFields";
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
} from "./portfolioSectionEditors";
import { DashboardChartEditor, DashboardTableEditor } from "./DashboardBlockEditors";

const BLOCK_LABELS = {
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
  dashboardChart: "Dashboard Chart",
  dashboardTable: "Dashboard Table",
  caseStudy: "Case Study",
};

function SectionEditor({ section, template, onDataChange }) {
  const { type, data } = section;

  switch (type) {
    case "hero":
      return <HeroEditor data={data} onChange={onDataChange} template={template} />;
    case "contact":
      return <ContactEditor data={data} onChange={onDataChange} template={template} />;
    case "stats":
      return <StatsEditor data={data} onChange={onDataChange} />;
    case "hours":
      return <HoursEditor data={data} onChange={onDataChange} />;
    case "seo":
      return <SeoEditor data={data} onChange={onDataChange} />;
    case "summary":
      return template === "projectManager" || template === "dataScientist" ? (
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
    case "caseStudy":
      return <CaseStudyEditor data={data} onChange={onDataChange} />;
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
}

export default function PortfolioEditor({ portfolioData: prefetched }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(prefetched || null);
  const [loading, setLoading] = useState(!prefetched);
  const [saving, setSaving] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (prefetched) {
      setPortfolio(prefetched);
      return;
    }
    if (!id) return;

    portfolioApi
      .getById(id)
      .then((res) => setPortfolio(res.data))
      .catch(() => toast.error("Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [id, prefetched]);

  const sections = portfolio?.sections
    ? [...portfolio.sections].sort((a, b) => a.order - b.order)
    : [];

  const handleSectionDataChange = useCallback((sectionId, newData) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s._id === sectionId ? { ...s, data: newData } : s)),
    }));
  }, []);

  const handleSectionVisibilityChange = useCallback((sectionId, visible) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s._id === sectionId ? { ...s, visible } : s)),
    }));
  }, []);

  const setSocialLink = (key, val) => {
    setPortfolio((p) => ({
      ...p,
      socialLinks: { ...(p.socialLinks || {}), [key]: val },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await portfolioApi.update(portfolio._id, {
        title: portfolio.title,
        slug: portfolio.slug,
        socialLinks: portfolio.socialLinks,
        sections: portfolio.sections,
      });
      toast.success("Portfolio saved");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSection = async (sectionId) => {
    if (!confirm("Remove this section?")) return;
    try {
      const res = await portfolioApi.removeSection(portfolio._id, sectionId);
      setPortfolio(res.data.portfolio);
      if (activeIdx >= sections.length - 1) setActiveIdx(Math.max(0, activeIdx - 1));
      toast.success("Section removed");
    } catch {
      toast.error("Failed to remove section");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Portfolio not found</p>
      </div>
    );
  }

  const activeSection = sections[activeIdx];
  const sl = portfolio.socialLinks || {};

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
              <FaArrowLeft />
            </button>
            <div>
              <input
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                value={portfolio.title || ""}
                onChange={(e) => setPortfolio((p) => ({ ...p, title: e.target.value }))}
                placeholder="Portfolio title"
              />
              <span className="text-sm text-gray-500 ml-2 capitalize">{portfolio.template}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/portfolios/view/${portfolio._id}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FaEye /> Preview
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Sections</h3>
            </div>
            <nav className="p-2 space-y-1">
              {sections.map((section, idx) => (
                <div
                  key={section._id || idx}
                  className={`flex items-stretch rounded-lg border border-transparent ${
                    activeIdx === idx ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors rounded-lg ${
                      activeIdx === idx ? "text-blue-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    <FaGripVertical className="text-gray-400 text-xs shrink-0" />
                    <span className="truncate">{BLOCK_LABELS[section.type] || section.type}</span>
                  </button>
                  <label
                    className="flex items-center px-2 shrink-0 cursor-pointer"
                    title="Show on portfolio when saved"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={section.visible !== false}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (section._id) handleSectionVisibilityChange(section._id, e.target.checked);
                      }}
                    />
                  </label>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Settings</h3>
            <FieldEditor
              label="Slug (optional)"
              value={portfolio.slug || ""}
              onChange={(v) => setPortfolio((p) => ({ ...p, slug: v }))}
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              If set, unique across portfolios. Used by the API at{" "}
              <code className="text-[11px] bg-gray-100 px-1 rounded">/api/portfolios/slug/your-slug</code>. The in-app
              preview link uses your portfolio ID, not the slug.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              <span className="font-medium text-gray-700">Public / private:</span> use the visibility toggle on the
              Dashboard for this portfolio. It is not changed from this screen.
            </p>
            <p className="text-xs font-semibold text-gray-700 pt-2 border-t">Social links</p>
            <FieldEditor label="GitHub" value={sl.github} onChange={(v) => setSocialLink("github", v)} />
            <FieldEditor label="LinkedIn" value={sl.linkedin} onChange={(v) => setSocialLink("linkedin", v)} />
            <FieldEditor label="Twitter" value={sl.twitter} onChange={(v) => setSocialLink("twitter", v)} />
            <FieldEditor label="Instagram" value={sl.instagram} onChange={(v) => setSocialLink("instagram", v)} />
            <FieldEditor label="Website" value={sl.website} onChange={(v) => setSocialLink("website", v)} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeSection ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {BLOCK_LABELS[activeSection.type] || activeSection.type}
                </h2>
                <button
                  type="button"
                  onClick={() => handleRemoveSection(activeSection._id)}
                  className="text-red-400 hover:text-red-600 p-2"
                  title="Remove section"
                >
                  <FaTrash />
                </button>
              </div>
              <SectionEditor
                section={activeSection}
                template={portfolio.template}
                onDataChange={(newData) => handleSectionDataChange(activeSection._id, newData)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              No sections yet. Add a section to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
