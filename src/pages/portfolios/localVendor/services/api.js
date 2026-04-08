import axios from "axios";
import { useVendor } from "../../../../context/VendorContext";

// Base axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API || "http://localhost:5000",
});

// Hook that wraps vendor-specific endpoints
export function useVendorApi() {
  const { vendorId } = useVendor();
  if (!vendorId) {
    return {
      fetchFullPortfolio: async () => ({}),
      updateAbout: async () => ({}),
      uploadAboutImages: async () => ({}),
      createBanner: async () => ({}),
      updateBanner: async () => ({}),
      deleteBanner: async () => ({}),
      getMenu: async () => [],
      createMenuItem: async () => ({}),
      getGallery: async () => [],
      getReviews: async () => [],
      createReview: async () => ({}),
      getTaggedImages: async () => [],
    };
  }

  return {
    // ✅ Fetch entire portfolio
    fetchFullPortfolio: async () => {
      const { data } = await API.get(`/vendor/${vendorId}/full`);
      return data;
    },

    // ✅ Banner
    getBanner: async () => {
      const res = await API.get(`/banner/${vendorId}`);
      return res.data;
    },
    createBanner: async (formData) => {
      const { data } = await API.post(`/banner/${vendorId}`, formData);
      return data;
    },
    updateBanner: async (id, formData) => {
      const { data } = await API.put(`/banner/${vendorId}/${id}`, formData);
      return data;
    },
    deleteBanner: async (id) => {
      const { data } = await API.delete(`/banner/${vendorId}/${id}`);
      return data;
    },

    // ✅ About
    getAbout: async () => {
      const res = await API.get(`/about/${vendorId}`);
      return res.data;
    },
    updateAbout: async (formData) => {
      const { data } = await API.put(`/about/${vendorId}`, formData);
      return data;
    },

    // 🔹 New helper → upload grid images for About
    uploadAboutImages: async (formData) => {
      const { data } = await API.post(
        `/about/${vendorId}/upload-grid-images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },

    // ✅ Menu
    getMenu: async () => {
      const { data } = await API.get(`/menu/${vendorId}`);
      return data;
    },
    getMenuByCategory: async (category) => {
      const { data } = await API.get(
        `/menu/${vendorId}?category=${encodeURIComponent(category)}`
      );
      return data;
    },

    createMenuItem: async (formData) => {
      const { data } = await API.post(`/menu/${vendorId}`, formData);
      return data;
    },
    updateMenuItem: async (id, formData) => {
      const { data } = await API.put(`/menu/${vendorId}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    deleteMenuItem: async (id) => {
      const { data } = await API.delete(`/menu/${vendorId}/${id}`);
      return data;
    },

    // ✅ Gallery
    getGallery: async () => {
      const { data } = await API.get(`/gallery/${vendorId}`);
      return data;
    },
    createGalleryImage: async (formData) => {
      const { data } = await API.post(`/gallery/${vendorId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    updateGalleryImage: async (id, formData) => {
      const { data } = await API.put(`/gallery/${vendorId}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    deleteGalleryImage: async (id) => {
      const { data } = await API.delete(`/gallery/${vendorId}/${id}`);
      return data;
    },

    // ✅ Reviews
    getReviews: async () => {
      const { data } = await API.get(`/reviews/${vendorId}`);
      return data;
    },
    createReview: async (payload) => {
      const { data } = await API.post(`/reviews/${vendorId}`, payload);
      return data;
    },
    updateReview: async (id, payload) => {
      const { data } = await API.put(`/reviews/${vendorId}/${id}`, payload);
      return data;
    },
    deleteReview: async (id) => {
      const { data } = await API.delete(`/reviews/${vendorId}/${id}`);
      return data;
    },

    // ✅ Tagged Images
    getTaggedImages: async () => {
      const { data } = await API.get(`/tagged/${vendorId}`);
      return data;
    },
    uploadTaggedImage: async (formData) => {
      const { data } = await API.post(`/tagged/${vendorId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    createTag: async (taggedImageId, payload) => {
      const { data } = await API.post(
        `/tagged/${vendorId}/${taggedImageId}/tags`,
        payload
      );
      return data;
    },
    deleteTag: async (taggedImageId, tagIndex) => {
      const { data } = await API.delete(
        `/tagged/${vendorId}/${taggedImageId}/tags/${tagIndex}`
      );
      return data;
    },
  };
}

export default API;
