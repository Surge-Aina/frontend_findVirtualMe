/** Documented production default when VITE_BACKEND_API is unset (e.g. local docs preview). */
export const DEFAULT_BACKEND_API = "https://backend-findvirtualme.onrender.com";

export function resolveBackendApi(env = import.meta.env) {
  const fromEnv = String(env.VITE_BACKEND_API || "").trim().replace(/\/$/, "");
  return fromEnv || DEFAULT_BACKEND_API;
}

/** Node/build-time resolver (Vite prebuild, tests). */
export function resolveBackendApiFromProcess(env = process.env) {
  const fromEnv = String(env.VITE_BACKEND_API || "").trim().replace(/\/$/, "");
  return fromEnv || DEFAULT_BACKEND_API;
}