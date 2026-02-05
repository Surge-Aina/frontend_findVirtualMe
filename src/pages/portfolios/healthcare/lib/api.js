// Safe helper for Vite + Jest
function safeImportMetaEnv() {
  try {
    return typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
  } catch {
    return {};
  }
}

export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API || 
  "http://localhost:5000";

export const api = {
  // ==========================================
  // PUBLIC APIs (No Auth Required)
  // ==========================================

  async getPracticeData(id) {
    const res = await fetch(`${API_BASE_URL}/healthcare/practice/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getPracticeBySubdomain(subdomain) {
    const res = await fetch(`${API_BASE_URL}/healthcare/subdomain/${subdomain}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getDemoData() {
    const res = await fetch(`${API_BASE_URL}/healthcare/demo`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getPublicPortfolios() {
    const res = await fetch(`${API_BASE_URL}/healthcare/public/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ==========================================
  // PROTECTED APIs (Auth Required)
  // ==========================================

  async createHealthcarePortfolio() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const res = await fetch(`${API_BASE_URL}/healthcare/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create healthcare portfolio");
    }

    return res.json();
  },

  async getMyPortfolios() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const res = await fetch(`${API_BASE_URL}/healthcare/my-portfolios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ✅ Get admin data by _id (like other portfolios)
  async getAdminData(portfolioId) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    // Use _id-specific endpoint if provided
    const endpoint = portfolioId 
      ? `${API_BASE_URL}/healthcare/admin/data/${portfolioId}`
      : `${API_BASE_URL}/healthcare/admin/data`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `API error: ${res.status}`);
    }

    return res.json();
  },

  // ✅ Save admin data by _id
  async saveAdminData(data, portfolioId = null) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const id = portfolioId || data._id;
    const endpoint = id
      ? `${API_BASE_URL}/healthcare/admin/data/${id}`
      : `${API_BASE_URL}/healthcare/admin/data`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Save failed: ${res.status}`);
    }

    return res.json();
  },

  async updateSubdomain(subdomain, portfolioId = null) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const endpoint = portfolioId
      ? `${API_BASE_URL}/healthcare/admin/subdomain/${portfolioId}`
      : `${API_BASE_URL}/healthcare/admin/subdomain`;

    const res = await fetch(endpoint, {
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

  async togglePublicStatus(isPublic, portfolioId = null) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const endpoint = portfolioId
      ? `${API_BASE_URL}/healthcare/admin/toggle-public/${portfolioId}`
      : `${API_BASE_URL}/healthcare/admin/toggle-public`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isPublic }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update public status");
    }

    return res.json();
  },

  async deletePortfolio(portfolioId = null) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required. Please log in.");

    const endpoint = portfolioId
      ? `${API_BASE_URL}/healthcare/admin/delete/${portfolioId}`
      : `${API_BASE_URL}/healthcare/admin/delete`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete portfolio");
    }

    return res.json();
  },
};