import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5100';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: async () => {
    // Using the new datascience portfolio endpoint
    const response = await api.get('/datascience-portfolio');
    return response.data;
  },
  addPortfolioItem: async (itemData) => {
    // Add individual item to the portfolio
    // Map frontend section names to backend route names
    const sectionMap = {
      'experience': 'experience',
      'education': 'education', 
      'projects': 'projects' // Backend uses 'projects' (plural)
    };
    const backendSection = sectionMap[itemData.section] || itemData.section;
    const response = await api.post(`/datascience-portfolio/${backendSection}`, itemData.content);
    return response.data;
  },
  updatePortfolioItem: async (id, updates) => {
    // Update individual item in the portfolio
    // Map frontend section names to backend route names
    const sectionMap = {
      'experience': 'experience',
      'education': 'education',
      'projects': 'projects' // Backend uses 'projects' (plural)
    };
    const backendSection = sectionMap[updates.section] || updates.section;
    const response = await api.patch(`/datascience-portfolio/${backendSection}/${id}`, updates.content);
    return response.data;
  },
  deletePortfolioItem: async (id, section) => {
    // Delete individual item from the portfolio
    // Map frontend section names to backend route names
    const sectionMap = {
      'experience': 'experience',
      'education': 'education',
      'projects': 'projects' // Backend uses 'projects' (plural)
    };
    const backendSection = sectionMap[section] || section;
    const response = await api.delete(`/datascience-portfolio/${backendSection}/${id}`);
    return response.data;
  },
  updatePortfolio: async (portfolioData) => {
    const response = await api.patch(`/datascience-portfolio/update`, { portfolio: portfolioData });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/portfolio/dashboard');
    return response.data;
  },
  updateDashboardData: async (dashboardData) => {
    const response = await api.patch('/portfolio/dashboard', dashboardData);
    return response.data;
  },
};

// Reviews API
export const testimonialAPI = {
  getTestimonials: async () => {
    const response = await api.get('/testimonials');
    return response.data;
  },
  getTopTestimonials: async () => {
    const response = await api.get('/testimonials/top');
    return response.data;
  },
  submitTestimonial: async (testimonialData) => {
    console.log('API: Submitting testimonial with data:', testimonialData);
    const response = await api.post('/testimonials', testimonialData);
    console.log('API: Response received:', response.data);
    return response.data;
  },
  // Admin functions
  getAllTestimonials: async () => {
    console.log('API: Getting all testimonials...');
    const response = await api.get('/testimonials/admin');
    console.log('API: All testimonials response:', response.data);
    return response.data;
  },
  approveTestimonial: async (id, isApproved) => {
    const response = await api.patch(`/testimonials/admin/${id}`, { isApproved });
    return response.data;
  },
  deleteTestimonial: async (id) => {
    console.log('API: Deleting testimonial with ID:', id);
    const response = await api.delete(`/testimonials/admin/${id}`);
    console.log('API: Delete response:', response.data);
    return response.data;
  },
};

export default api;
