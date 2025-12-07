// Safe helper for Vite + Jest
function safeImportMetaEnv() {
  try {
    // Only works in Vite
    return typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  } catch {
    return {};
  }
}

const env = safeImportMetaEnv();

export const API_BASE_URL = env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const api = {
  async getPracticeData(practiceId) {
    const res = await fetch(`${API_BASE_URL}/healthcare/practice/${practiceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getPracticeBySubdomain(subdomain) {
    const res = await fetch(`${API_BASE_URL}/healthcare/subdomain/${subdomain}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  async register(data) {
    const res = await fetch(`${API_BASE_URL}/healthcare/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/healthcare/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }
    return res.json();
  },

  async getCurrentUser() {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE_URL}/healthcare/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ==========================================
  // ADMIN APIs (Require Auth)
  // ==========================================

  async getAdminData() {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/healthcare/admin/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async saveAdminData(data) {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE_URL}/healthcare/admin/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return res.json();
  },

  async updateSubdomain(subdomain) {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE_URL}/healthcare/admin/subdomain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subdomain }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update subdomain");
    }
    return res.json();
  },
};
