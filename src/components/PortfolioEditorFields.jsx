import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { ImageFieldEditor } from "./ImageFieldEditor";
import { BLOCK_LABELS } from "./portfolioEditorConfig";
import { useTheme } from "../context/ThemeContext";
import {
  editorLabelClass,
  editorInputClass,
  editorSelectClass,
} from "./portfolioEditorFieldClasses";

export * from "./portfolioEditorFieldClasses";

/** Preferred order for “scroll to section” link presets (hero buttons, CTAs). */
const SECTION_LINK_PRESET_ORDER = [
  "contact",
  "projects",
  "summary",
  "services",
  "skills",
  "experience",
  "education",
  "gallery",
  "testimonials",
  "process",
  "faq",
  "blog",
  "hours",
  "stats",
  "hero",
  "clientLogos",
  "certifications",
  "languages",
  "team",
  "videoEmbed",
  "caseStudy",
  "dashboardChart",
  "dashboardTable",
  "seo",
];

function buildSectionPresetOptions() {
  const ordered = SECTION_LINK_PRESET_ORDER.filter((id) => BLOCK_LABELS[id]);
  const rest = Object.keys(BLOCK_LABELS)
    .filter((id) => !ordered.includes(id))
    .sort((a, b) => (BLOCK_LABELS[a] || a).localeCompare(BLOCK_LABELS[b] || b));
  return [...ordered, ...rest].map((id) => ({
    id,
    hash: `#${id}`,
    label: BLOCK_LABELS[id] || id,
  }));
}

const SECTION_PRESET_OPTIONS = buildSectionPresetOptions();

function isPresetSectionHash(value) {
  const t = (value && String(value).trim()) || "";
  if (!/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(t)) return false;
  const id = t.slice(1);
  return Object.prototype.hasOwnProperty.call(BLOCK_LABELS, id);
}

/**
 * Dropdown for in-page section links, with optional custom URL / mailto / tel.
 * When `value` is empty, the effective target is `defaultAnchor` (for display).
 */
export function HeroDestinationSelect({
  label,
  value,
  onChange,
  defaultAnchor = "#contact",
  portfolioSectionTypes = null,
  helpText,
}) {
  const raw = (value && String(value).trim()) || "";
  const effectivePreset = raw || defaultAnchor;
  const isCustom = raw.length > 0 && !isPresetSectionHash(raw);
  const selectValue = isCustom ? "__custom__" : effectivePreset;

  const onSectionTypeSet = useMemo(() => {
    if (!portfolioSectionTypes?.length) return null;
    return new Set(portfolioSectionTypes);
  }, [portfolioSectionTypes]);

  const orderedPresetOptions = useMemo(() => {
    if (!onSectionTypeSet?.size) return SECTION_PRESET_OPTIONS;
    const onPage = SECTION_PRESET_OPTIONS.filter((p) => onSectionTypeSet.has(p.id));
    const offPage = SECTION_PRESET_OPTIONS.filter((p) => !onSectionTypeSet.has(p.id));
    return [...onPage, ...offPage];
  }, [onSectionTypeSet]);

  return (
    <div>
      <label className={editorLabelClass}>{label}</label>
      <select
        className={editorSelectClass}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            onChange("https://");
            return;
          }
          onChange(v);
        }}
      >
        {orderedPresetOptions.map(({ id, hash, label: optLabel }) => {
          const onPage = onSectionTypeSet?.has(id);
          return (
            <option key={hash} value={hash}>
              {optLabel} ({hash}){onPage ? " — on your page" : ""}
            </option>
          );
        })}
        <option value="__custom__">Custom (website, email, phone, or other link)…</option>
      </select>
      {isCustom && (
        <input
          type="text"
          className={`w-full mt-2 ${editorInputClass}`}
          placeholder="https://…  ·  mailto:…  ·  tel:…  ·  #section-id"
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} (custom)`}
        />
      )}
      {helpText ? <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{helpText}</p> : null}
    </div>
  );
}

function configureJsonTheme(monaco) {
  monaco.editor.defineTheme("fvm-json-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "1d4ed8" },
      { token: "string.value.json", foreground: "047857" },
      { token: "number.json", foreground: "b45309" },
      { token: "keyword.json", foreground: "7c3aed", fontStyle: "bold" },
      { token: "delimiter.bracket.json", foreground: "374151" },
      { token: "delimiter.array.json", foreground: "374151" },
    ],
    colors: {
      "editor.background": "#f8fafc",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#475569",
      "editorIndentGuide.background1": "#e2e8f0",
      "editor.selectionBackground": "#dbeafe",
      "editor.inactiveSelectionBackground": "#e5e7eb",
    },
  });
}

export function JsonCodeSurface({ value, onChange, onBlur, readOnly = false, height = 320 }) {
  const { theme } = useTheme();
  const monacoTheme = theme === "dark" ? "vs-dark" : "fvm-json-light";
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-600">
      <Editor
        height={height}
        defaultLanguage="json"
        language="json"
        theme={monacoTheme}
        value={value}
        beforeMount={monacoTheme === "fvm-json-light" ? configureJsonTheme : undefined}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        onMount={(editor) => {
          if (onBlur) {
            editor.onDidBlurEditorText(() => onBlur());
          }
        }}
        options={{
          readOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingIndent: "indent",
          lineNumbers: "on",
          glyphMargin: false,
          folding: false,
          tabSize: 2,
          detectIndentation: false,
          formatOnPaste: !readOnly,
          formatOnType: !readOnly,
          renderValidationDecorations: readOnly ? "off" : "on",
          quickSuggestions: !readOnly,
          suggestOnTriggerCharacters: !readOnly,
          lineDecorationsWidth: 8,
          fontSize: 13,
          fontFamily: "Consolas, 'Courier New', monospace",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

export function JsonPreview({ value, height = 280 }) {
  return <JsonCodeSurface value={value} readOnly height={height} />;
}

export function JsonEditor({ data, onChange }) {
  const [text, setText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState(null);
  const textRef = useRef(text);

  useEffect(() => {
    const nextText = JSON.stringify(data, null, 2);
    setText(nextText);
    textRef.current = nextText;
  }, [data]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(textRef.current);
      setError(null);
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <JsonCodeSurface
        value={text}
        height={320}
        onChange={(nextValue) => {
          textRef.current = nextValue;
          setText(nextValue);
        }}
        onBlur={handleBlur}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FieldEditor({ label, value, onChange, type = "text", rows, placeholder, onFocus, onBlur }) {
  if (type === "textarea") {
    return (
      <div>
        <label className={editorLabelClass}>{label}</label>
        <textarea
          rows={rows || 3}
          placeholder={placeholder}
          className={`${editorInputClass} resize-y`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    );
  }
  return (
    <div>
      <label className={editorLabelClass}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={editorInputClass}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function HeroEditor({ data, onChange, template, portfolioSections }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  const sectionTypesOnPage = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const s of portfolioSections || []) {
      if (s.visible === false) continue;
      if (!s.type || seen.has(s.type)) continue;
      seen.add(s.type);
      out.push(s.type);
    }
    return out;
  }, [portfolioSections]);

  if (template === "healthcare") {
    return (
      <div className="space-y-4">
        <FieldEditor label="Practice Name" value={data.practiceName} onChange={(v) => set("practiceName", v)} />
        <FieldEditor label="Tagline" value={data.tagline} onChange={(v) => set("tagline", v)} />
        <FieldEditor label="Description" value={data.description} onChange={(v) => set("description", v)} type="textarea" />
        <ImageFieldEditor label="Logo Image URL" value={data.logoImage} onChange={(v) => set("logoImage", v)} />
        <FieldEditor label="Icon (emoji or key)" value={data.icon} onChange={(v) => set("icon", v)} />
        <ImageFieldEditor label="Background Image URL" value={data.backgroundImage} onChange={(v) => set("backgroundImage", v)} />
        <FieldEditor label="Primary Button Text" value={data.primaryButtonText} onChange={(v) => set("primaryButtonText", v)} />
        <HeroDestinationSelect
          label="Where the primary button goes"
          value={data.primaryButtonUrl}
          onChange={(v) => set("primaryButtonUrl", v)}
          defaultAnchor="#contact"
          portfolioSectionTypes={sectionTypesOnPage}
          helpText="Pick a section to scroll to, or choose Custom for an external site, email, or phone link."
        />
        <FieldEditor label="Secondary Button Text" value={data.secondaryButtonText} onChange={(v) => set("secondaryButtonText", v)} />
        <HeroDestinationSelect
          label="Where the secondary button goes"
          value={data.secondaryButtonUrl}
          onChange={(v) => set("secondaryButtonUrl", v)}
          defaultAnchor="#services"
          portfolioSectionTypes={sectionTypesOnPage}
          helpText="Usually Services or another section. Use Custom for any other link."
        />
      </div>
    );
  }

  if (template === "handyman") {
    return (
      <div className="space-y-4">
        <FieldEditor label="Title" value={data.title} onChange={(v) => set("title", v)} />
        <FieldEditor label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} type="textarea" />
        <FieldEditor label="Phone Number" value={data.phoneNumber} onChange={(v) => set("phoneNumber", v)} />
        <ImageFieldEditor label="Hero Image URL" value={data.imageUrl} onChange={(v) => set("imageUrl", v)} />
        <FieldEditor label="CTA Text" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
        <HeroDestinationSelect
          label="Where the main button goes"
          value={data.ctaUrl}
          onChange={(v) => set("ctaUrl", v)}
          defaultAnchor="#contact"
          portfolioSectionTypes={sectionTypesOnPage}
          helpText="Typically Contact. External links open in a new tab when they start with http."
        />
        <FieldEditor label="Badge 1" value={data.badge1Text} onChange={(v) => set("badge1Text", v)} />
        <FieldEditor label="Badge 2" value={data.badge2Text} onChange={(v) => set("badge2Text", v)} />
        <FieldEditor label="Badge 3" value={data.badge3Text} onChange={(v) => set("badge3Text", v)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FieldEditor label="Name" value={data.name} onChange={(v) => set("name", v)} />
      <FieldEditor label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <FieldEditor label="Bio" value={data.bio} onChange={(v) => set("bio", v)} type="textarea" />
      <ImageFieldEditor label="Profile Image URL" value={data.profileImage} onChange={(v) => set("profileImage", v)} />
      {template === "agent" && (
        <>
          <p className="text-sm font-medium text-gray-800 dark:text-neutral-200 pt-2 border-t border-gray-200 dark:border-neutral-600">
            Hero buttons
          </p>
          <FieldEditor
            label="Primary button text"
            value={data.primaryButtonText}
            onChange={(v) => set("primaryButtonText", v)}
            placeholder="Clear to hide, or leave default"
          />
          <HeroDestinationSelect
            label="Where the primary button goes"
            value={data.primaryButtonUrl}
            onChange={(v) => set("primaryButtonUrl", v)}
            defaultAnchor="#contact"
            portfolioSectionTypes={sectionTypesOnPage}
            helpText="Defaults to Contact if you pick the matching option. Use Custom for external links."
          />
          <FieldEditor
            label="Secondary button text"
            value={data.secondaryButtonText}
            onChange={(v) => set("secondaryButtonText", v)}
            placeholder="Clear to hide, or leave default"
          />
          <HeroDestinationSelect
            label="Where the secondary button goes"
            value={data.secondaryButtonUrl}
            onChange={(v) => set("secondaryButtonUrl", v)}
            defaultAnchor="#projects"
            portfolioSectionTypes={sectionTypesOnPage}
            helpText="Defaults to Projects. Sections marked “on your page” are in this portfolio."
          />
        </>
      )}
    </div>
  );
}

export function ContactEditor({ data, onChange, template }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-4">
      <FieldEditor label="Email" value={data.email} onChange={(v) => set("email", v)} />
      <FieldEditor label="Phone" value={data.phone} onChange={(v) => set("phone", v)} />
      {template === "healthcare" && (
        <>
          <FieldEditor label="WhatsApp" value={data.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <FieldEditor label="Button text (CTA)" value={data.buttonText} onChange={(v) => set("buttonText", v)} />
          <FieldEditor label="Submit Button Text" value={data.submitText} onChange={(v) => set("submitText", v)} />
          <p className="text-sm font-medium text-gray-800 dark:text-neutral-200 mt-2">Address</p>
          <FieldEditor
            label="Street"
            value={data.address?.street}
            onChange={(v) => set("address", { ...(data.address || {}), street: v })}
          />
          <FieldEditor
            label="City"
            value={data.address?.city}
            onChange={(v) => set("address", { ...(data.address || {}), city: v })}
          />
          <FieldEditor
            label="State"
            value={data.address?.state}
            onChange={(v) => set("address", { ...(data.address || {}), state: v })}
          />
          <FieldEditor
            label="ZIP"
            value={data.address?.zip}
            onChange={(v) => set("address", { ...(data.address || {}), zip: v })}
          />
        </>
      )}
      {template === "handyman" && (
        <>
          <FieldEditor label="Section Title" value={data.title} onChange={(v) => set("title", v)} />
          <FieldEditor label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} type="textarea" />
          <FieldEditor label="Form title" value={data.formTitle} onChange={(v) => set("formTitle", v)} />
          <FieldEditor label="Hours" value={data.hours} onChange={(v) => set("hours", v)} />
          <FieldEditor label="Note" value={data.note} onChange={(v) => set("note", v)} />
        </>
      )}
      {(template === "projectManager" || template === "dataScientist") && (
        <FieldEditor label="Location" value={data.location} onChange={(v) => set("location", v)} />
      )}
    </div>
  );
}
