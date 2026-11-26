import { sectionDataToPuckProps, puckPropsToSectionData } from "./featureComponentAdapters";
import { isComponentBookingEnabled } from "../componentBookingFlag";

export { puckPropsToSectionData };

const FEATURE_SECTION_BLOCK_TYPES_CORE = Object.freeze([
  "contact",
  "gallery",
  "services",
  "testimonials",
  "hours",
  "socialLinks",
  "qrCode",
  "voucherOffer",
]);

/** @deprecated Prefer isFeatureSectionBlockType(); bookingRequest is included only when VITE_COMPONENT_BOOKING_ENABLED is on. */
export function getFeatureSectionBlockTypes() {
  const types = [...FEATURE_SECTION_BLOCK_TYPES_CORE];
  if (isComponentBookingEnabled()) {
    types.push("bookingRequest");
  }
  return Object.freeze(types);
}

export const FEATURE_SECTION_BLOCK_TYPES = FEATURE_SECTION_BLOCK_TYPES_CORE;

export const BLOCK_TYPE_TO_PUCK_TYPE = Object.freeze({
  contact: "ContactLeadForm",
  gallery: "Gallery",
  services: "Services",
  testimonials: "Testimonials",
  hours: "BusinessHours",
  socialLinks: "SocialLinks",
  qrCode: "QrCode",
  voucherOffer: "VoucherOffer",
  bookingRequest: "BookingRequest",
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
  if (blockType === "bookingRequest") {
    return isComponentBookingEnabled();
  }
  return FEATURE_SECTION_BLOCK_TYPES_CORE.includes(blockType);
}

export function puckTypeForBlockType(blockType) {
  return BLOCK_TYPE_TO_PUCK_TYPE[blockType] || null;
}

export function blockTypeForPuckType(puckType, config) {
  const entry = config?.components?.[puckType];
  return entry?.metadata?.blockType || null;
}

export function sectionToPuckComponentData(section, template = "agent") {
  const puckType = puckTypeForBlockType(section.type);
  if (!puckType || !section?._id) return null;
  const data = section.data && typeof section.data === "object" ? section.data : {};
  return {
    type: puckType,
    props: {
      id: section._id,
      ...sectionDataToPuckProps(puckType, data, template),
    },
  };
}