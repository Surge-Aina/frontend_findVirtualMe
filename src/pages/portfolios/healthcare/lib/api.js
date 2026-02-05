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

export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API || 
  "http://localhost:5000";

export const api = {
  // ==========================================
  // PUBLIC PRACTICE DATA APIs (No Auth Required)
  // ==========================================

  /**
   * Get practice data by practiceId (supports both _id and legacy practiceId)
   * @param {string} practiceId - Practice ID or MongoDB _id
   * @returns {Promise<Object>} Practice data
   */
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

  /**
   * Get practice data by subdomain
   * @param {string} subdomain - Unique subdomain identifier
   * @returns {Promise<Object>} Practice data
   */
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

  /**
   * Get demo practice data (no auth required)
   * @returns {Promise<Object>} Demo practice data
   */
  async getDemoData() {
    const res = await fetch(`${API_BASE_URL}/healthcare/demo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  /**
   * Get all public healthcare portfolios
   * @returns {Promise<Object>} List of public portfolios
   */
  async getPublicPortfolios() {
    const res = await fetch(`${API_BASE_URL}/healthcare/public/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ==========================================
  // HEALTHCARE PORTFOLIO MANAGEMENT (Main Platform Auth Required)
  // ==========================================

  /**
   * Create new healthcare portfolio for authenticated user
   * Uses main platform JWT token from localStorage
   * @returns {Promise<Object>} Created portfolio data with practiceId
   */
  async createHealthcarePortfolio() {
    const token = localStorage.getItem("token"); // Main platform token
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

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

  /**
   * Get all healthcare portfolios owned by authenticated user
   * @returns {Promise<Object>} User's portfolios
   */
  async getMyPortfolios() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const res = await fetch(`${API_BASE_URL}/healthcare/my-portfolios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  },

  // ==========================================
  // ADMIN APIs (Main Platform Auth Required)
  // ==========================================

  /**
   * Get admin data for authenticated user's healthcare portfolio
   * Uses main platform JWT token
   * @returns {Promise<Object>} Admin data including practiceId
   */
  async getAdminData() {
    const token = localStorage.getItem("token"); // Main platform token (NOT adminToken)
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/healthcare/admin/data`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Save/update healthcare portfolio data
   * @param {Object} data - Portfolio data to save
   * @returns {Promise<Object>} Save result
   */
  async saveAdminData(data) {
    const token = localStorage.getItem("token"); // Main platform token
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const res = await fetch(`${API_BASE_URL}/healthcare/admin/data`, {
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

  /**
   * Update practice subdomain
   * @param {string} subdomain - New subdomain (lowercase, alphanumeric + hyphens)
   * @returns {Promise<Object>} Update result
   */
  async updateSubdomain(subdomain) {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

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

  /**
   * Toggle portfolio public/private status
   * @param {boolean} isPublic - Whether portfolio should be public
   * @returns {Promise<Object>} Update result
   */
  async togglePublicStatus(isPublic) {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const res = await fetch(`${API_BASE_URL}/healthcare/admin/toggle-public`, {
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

  /**
   * Delete healthcare portfolio
   * @returns {Promise<Object>} Delete result
   */
  async deletePortfolio() {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const res = await fetch(`${API_BASE_URL}/healthcare/admin/delete`, {
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

  // form data requires: name, email, message, portfolioId, ownerEmail, ownerName
  async contactMe(formData){
    const res = await fetch(`${API_BASE_URL}/contactMe/contactMeForm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Failed to contact me: ${res.status}`);
    }

    return res.json();
  }
};