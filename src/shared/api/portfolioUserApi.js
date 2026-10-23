import axios from "axios";

const BASE_API = import.meta.env.VITE_BACKEND_API || "";

/**
 * API client for portfolio sub-user (a.k.a. guestUser) flows.
 *
 * Each portfolio gets its own JWT keyed in localStorage as
 * `portfolioUserToken:<portfolioId>`. Pass the per-portfolio token explicitly
 * to authenticated calls so we never accidentally cross sessions between
 * portfolios when the same browser holds tokens for multiple of them.
 */

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const portfolioUserApi = {
  signup: (payload) =>
    axios.post(`${BASE_API}/api/portfolio-users/signup`, payload),
  login: (payload) =>
    axios.post(`${BASE_API}/api/portfolio-users/login`, payload),
  updateProfile: (token, updates) =>
    axios.patch(`${BASE_API}/api/portfolio-users/profile`, updates, {
      headers: authHeaders(token),
    }),
  deleteProfile: (token) =>
    axios.delete(`${BASE_API}/api/portfolio-users/profile`, {
      headers: authHeaders(token),
    }),

  listMyActivities: (token, params = {}) =>
    axios.get(`${BASE_API}/api/portfolio-activities/mine`, {
      params,
      headers: authHeaders(token),
    }),
  createMyActivity: (token, payload) =>
    axios.post(`${BASE_API}/api/portfolio-activities`, payload, {
      headers: authHeaders(token),
    }),
  cancelMyActivity: (token, id) =>
    axios.patch(
      `${BASE_API}/api/portfolio-activities/${id}/cancel`,
      {},
      { headers: authHeaders(token) }
    ),
};

export const portfolioOwnerActivityApi = {
  list: (params = {}) =>
    axios.get(`${BASE_API}/api/portfolio-activities`, {
      params,
      headers: authHeaders(localStorage.getItem("token")),
    }),
  create: (payload) =>
    axios.post(`${BASE_API}/api/portfolio-activities/admin`, payload, {
      headers: authHeaders(localStorage.getItem("token")),
    }),
  update: (id, updates) =>
    axios.patch(`${BASE_API}/api/portfolio-activities/${id}`, updates, {
      headers: authHeaders(localStorage.getItem("token")),
    }),
  listSubUsers: (portfolioId) =>
    axios.get(`${BASE_API}/api/auth/guest-admin/users`, {
      params: { portfolioId },
      headers: authHeaders(localStorage.getItem("token")),
    }),
  createSubUser: (payload) =>
    axios.post(`${BASE_API}/api/auth/guest-admin/users`, payload, {
      headers: authHeaders(localStorage.getItem("token")),
    }),
};
