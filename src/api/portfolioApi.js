import axios from "axios";
import axiosAuth from "../utils/axiosAuth";

const BASE = "/api/portfolios";

export const portfolioApi = {
  // Public
  getById: (id) => axios.get(`${import.meta.env.VITE_BACKEND_API}${BASE}/${id}`),
  getBySlug: (slug) => axios.get(`${import.meta.env.VITE_BACKEND_API}${BASE}/slug/${slug}`),
  listPublic: (template) => {
    const params = template ? `?template=${template}` : "";
    return axios.get(`${import.meta.env.VITE_BACKEND_API}${BASE}/public${params}`);
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
};
