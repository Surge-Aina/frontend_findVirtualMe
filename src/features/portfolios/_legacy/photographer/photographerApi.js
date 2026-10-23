import { useContext } from "react";
import axiosAuth from "@/shared/api/axiosAuth";
import { AuthContext } from "@/shared/context/AuthContext";
import { usePortfolio } from "./components/PortfolioContext";

export function isPlatformAdmin(user) {
  if (!user) return false;
  if (user.role === "admin" || user.isAdmin === true) return true;
  return Array.isArray(user.roles) && user.roles.includes("admin");
}

/** Prefer a real owned portfolio id. "default" is only valid for the sole photographer owner. */
export function resolvePhotographerPortfolioId(contextId, user) {
  const stored = typeof contextId === "string" ? contextId.trim() : "";
  if (stored && stored !== "default") return stored;

  const list = Array.isArray(user?.portfolios) ? user.portfolios : [];
  const match = list.find((entry) => {
    const type = String(entry?.portfolioType || entry?.template || "").toLowerCase();
    return type === "photographer" || type === "photography";
  });
  const owned = match?.portfolioId || match?._id || match?.id;
  if (owned) return String(owned);
  return stored || "default";
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
