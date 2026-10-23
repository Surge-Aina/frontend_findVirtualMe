import axios from "axios";
import { toast } from "react-toastify";

export const SIGN_IN_MESSAGE = "Please sign in to continue.";
export const PERMISSION_MESSAGE = "You do not have permission to do that.";

/** Message to show for an auth failure, or null when the error is something else. */
export function authFailureMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return SIGN_IN_MESSAGE;
  if (status === 403) return PERMISSION_MESSAGE;
  return null;
}

const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
});

axiosAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = authFailureMessage(error);
    if (message && !error?.config?.skipAuthToast) {
      toast.error(message, { toastId: message });
    }
    return Promise.reject(error);
  }
);

/**
 * GET that returns response data, or null when the resource is missing or errors.
 * 401/403 still toast through the shared client unless skipAuthToast is set.
 */
export async function getOptional(url, config) {
  try {
    const response = await axiosAuth.get(url, config);
    return response.data ?? null;
  } catch (error) {
    if (!authFailureMessage(error)) {
      console.error(`Request failed for ${url}`, error);
    }
    return null;
  }
}

export default axiosAuth;
