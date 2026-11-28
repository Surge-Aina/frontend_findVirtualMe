import axios from "axios";
import axiosAuth from "./axiosAuth";

const BASE = "/api/accounts";

export const accountsApi = {
  listMine: () => axiosAuth.get(BASE),
  create: (data) => axiosAuth.post(BASE, data),
  listMembers: (accountId) => axiosAuth.get(`${BASE}/${accountId}/members`),
  addMember: (accountId, body) => axiosAuth.post(`${BASE}/${accountId}/members`, body),
  updateMember: (accountId, membershipId, body) =>
    axiosAuth.patch(`${BASE}/${accountId}/members/${membershipId}`, body),
  removeMember: (accountId, membershipId) =>
    axiosAuth.delete(`${BASE}/${accountId}/members/${membershipId}`),
  listSuperAdminAccounts: () => axiosAuth.get(`${BASE}/super-admin/all`),
};

export const superAdminApi = {
  login: (email, password) =>
    axios.post(`${import.meta.env.VITE_BACKEND_API}/api/auth/super-admin/login`, {
      email,
      password,
    }),
};