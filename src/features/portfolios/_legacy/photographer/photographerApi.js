import { useContext } from "react";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import { usePortfolio } from "./components/PortfolioContext";
import { resolvePhotographerPortfolioId } from "./photographerPortfolioId";

export { resolvePhotographerPortfolioId } from "./photographerPortfolioId";

export function isPlatformAdmin(user) {
  if (!user) return false;
  if (user.role === "admin" || user.isAdmin === true) return true;
  return Array.isArray(user.roles) && user.roles.includes("admin");
}

export function usePhotographerWrite() {
  const portfolio = usePortfolio();
  const { user } = useContext(AuthContext);
  const portfolioId = resolvePhotographerPortfolioId(portfolio?.portfolioId, user);
  return { portfolioId, platformAdmin: isPlatformAdmin(user), user };
}

export function putPhotographerSetting(key, value, portfolioId) {
  return axiosAuth.put(`/settings/${key}`, { value, portfolioId });
}

export function postPhotographerPhoto(endpoint, url, portfolioId) {
  return axiosAuth.post(`/photo/${endpoint}`, { url, portfolioId });
}

export function putPhotographerPhoto(endpoint, id, photo, portfolioId) {
  return axiosAuth.put(`/photo/${endpoint}/${id}`, { ...photo, portfolioId });
}

export function deletePhotographerPhoto(endpoint, id, portfolioId) {
  return axiosAuth.delete(`/photo/${endpoint}/${id}`, { params: { portfolioId } });
}

export function reorderPhotographerPhotos(endpoint, photos, portfolioId) {
  const body = photos.map((photo, index) => ({
    _id: photo._id,
    position: photo.position ?? index,
  }));
  return axiosAuth.put(`/photo/${endpoint}/reorder`, body, {
    params: { portfolioId },
  });
}
