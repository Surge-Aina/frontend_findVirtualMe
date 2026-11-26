import axios from "axios";
import axiosAuth from "./axiosAuth";

const BASE = "/api/portfolios";

let siteDraftsKnownDisabled = false;
let featureComponentsKnownDisabled = false;

/** @internal Tests only */
export function resetSiteDraftsProbeCache() {
  siteDraftsKnownDisabled = false;
}

/** @internal Tests only */
export function resetFeatureComponentsProbeCache() {
  featureComponentsKnownDisabled = false;
}

export function isFeatureComponentsProbeSkipped() {
  return featureComponentsKnownDisabled;
}

export function isSiteDraftsProbeSkipped() {
  return siteDraftsKnownDisabled;
}

const DRAFTS_DISABLED_REJECTION = Object.freeze({
  response: { status: 404, data: { code: "DRAFTS_DISABLED", error: "Site drafts are not enabled" } },
});

const FEATURE_COMPONENTS_DISABLED_REJECTION = Object.freeze({
  response: {
    status: 404,
    data: { code: "FEATURE_COMPONENTS_DISABLED", error: "Feature components are not enabled" },
  },
});

export const portfolioApi = {
  // Public
  getById: (id, config) => axiosAuth.get(`${BASE}/${id}`, config),
  getBySlug: (slug, config) => axiosAuth.get(`${BASE}/slug/${slug}`, config),
  listPublic: (template) => {
    const params = template ? `?template=${template}` : "";
    return axios.get(`${import.meta.env.VITE_BACKEND_API}${BASE}/public/list${params}`);
  },
  getComponents: (siteId) => {
    if (featureComponentsKnownDisabled) {
      return Promise.reject(FEATURE_COMPONENTS_DISABLED_REJECTION);
    }
    return axiosAuth
      .get(`${BASE}/components`, { params: { siteId } })
      .catch((err) => {
        if (isFeatureComponentsDisabledError(err)) {
          featureComponentsKnownDisabled = true;
        }
        throw err;
      });
  },

  getBlockTypes: (template, options = {}) => {
    const query = new URLSearchParams();
    if (template) query.set("template", template);
    if (options.mode) query.set("mode", options.mode);
    const params = query.toString() ? `?${query.toString()}` : "";
    return axios.get(`${import.meta.env.VITE_BACKEND_API}${BASE}/block-types${params}`);
  },

  // Authenticated
  getMine: () => axiosAuth.get(`${BASE}/mine`),
  create: (template, data = {}) => axiosAuth.post(BASE, { template, ...data }),
  createAgent: (data = {}) => axiosAuth.post(`${BASE}/agent`, data),
  generateAgent: (data = {}) => axiosAuth.post(`${BASE}/agent/generate`, data),
  proposeAgentEdit: (id, data = {}) => axiosAuth.post(`${BASE}/${id}/agent-edit`, data),
  update: (id, data) => axiosAuth.patch(`${BASE}/${id}`, data),
  updateSection: (id, sectionId, data) =>
    axiosAuth.patch(`${BASE}/${id}/sections/${sectionId}`, { data }),
  addSection: (id, type, data, order) =>
    axiosAuth.post(`${BASE}/${id}/sections`, { type, data, order }),
  removeSection: (id, sectionId) =>
    axiosAuth.delete(`${BASE}/${id}/sections/${sectionId}`),
  reorderSections: (id, orderedIds) =>
    axiosAuth.patch(`${BASE}/${id}/reorder`, { orderedIds }),
  toggleVisibility: (id) => axiosAuth.patch(`${BASE}/${id}/visibility`),
  toggleBranding: (id) => axiosAuth.patch(`${BASE}/${id}/branding`),
  delete: (id) => axiosAuth.delete(`${BASE}/${id}`),

  getDraft: (id) => {
    if (siteDraftsKnownDisabled) {
      return Promise.reject(DRAFTS_DISABLED_REJECTION);
    }
    return axiosAuth.get(`${BASE}/${id}/draft`).catch((err) => {
      if (isPortfolioDraftsDisabledError(err)) {
        siteDraftsKnownDisabled = true;
      }
      throw err;
    });
  },
  publish: (id) => axiosAuth.post(`${BASE}/${id}/publish`),
  listVersions: (id) => axiosAuth.get(`${BASE}/${id}/versions`),
  getVersion: (id, versionNumber) => axiosAuth.get(`${BASE}/${id}/versions/${versionNumber}`),
  revertVersion: (id, versionNumber) =>
    axiosAuth.post(`${BASE}/${id}/versions/${versionNumber}/revert`),
};

export function isPortfolioDraftsDisabledError(err) {
  return err?.response?.status === 404 && err?.response?.data?.code === "DRAFTS_DISABLED";
}

export function isFeatureComponentsDisabledError(err) {
  return err?.response?.status === 404 && err?.response?.data?.code === "FEATURE_COMPONENTS_DISABLED";
}
