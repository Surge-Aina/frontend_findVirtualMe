export const FEATURE_SECTION_BLOCK_TYPES = Object.freeze([
  "contact",
  "gallery",
  "services",
  "testimonials",
  "hours",
]);

export const BLOCK_TYPE_TO_PUCK_TYPE = Object.freeze({
  contact: "ContactLeadForm",
  gallery: "Gallery",
  services: "Services",
  testimonials: "Testimonials",
  hours: "BusinessHours",
});

export const UNIFIED_SITE_TEMPLATES = Object.freeze([
  "healthcare",
  "handyman",
  "projectManager",
  "dataScientist",
  "agent",
]);

export function isUnifiedSiteTemplate(template) {
  return UNIFIED_SITE_TEMPLATES.includes(template);
}

export function isFeatureSectionBlockType(blockType) {
  return FEATURE_SECTION_BLOCK_TYPES.includes(blockType);
}

export function puckTypeForBlockType(blockType) {
  return BLOCK_TYPE_TO_PUCK_TYPE[blockType] || null;
}

export function blockTypeForPuckType(puckType, config) {
  const entry = config?.components?.[puckType];
  return entry?.metadata?.blockType || null;
}

export function puckPropsToSectionData(props) {
  if (!props || typeof props !== "object" || Array.isArray(props)) return {};
  const out = { ...props };
  delete out.id;
  return out;
}

export function sectionToPuckComponentData(section) {
  const puckType = puckTypeForBlockType(section.type);
  if (!puckType || !section?._id) return null;
  const data = section.data && typeof section.data === "object" ? section.data : {};
  return {
    type: puckType,
    props: {
      id: section._id,
      ...JSON.parse(JSON.stringify(data)),
    },
  };
}