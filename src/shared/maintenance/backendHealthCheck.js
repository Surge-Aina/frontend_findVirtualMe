import { resolveBackendApi } from "@/config/backendApi";

const HEALTH_TIMEOUT_MS = 8000;

function isLoopbackBackend(base) {
  try {
    const host = new URL(base).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

let healthCheckPromise = null;

/**
 * One GET per full page load; shared by all consumers. Fails silently (no console noise).
 */
export function checkBackendHealthOnce() {
  if (healthCheckPromise) {
    return healthCheckPromise;
  }

  const base = resolveBackendApi();
  if (!base) {
    healthCheckPromise = Promise.resolve(false);
    return healthCheckPromise;
  }

  if (isLoopbackBackend(base)) {
    healthCheckPromise = Promise.resolve(true);
    return healthCheckPromise;
  }

  const url = `${base.replace(/\/$/, "")}/`;

  healthCheckPromise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok || response.status >= 500) {
        return false;
      }
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  })();

  return healthCheckPromise;
}

/** Test helper */
export function resetBackendHealthCheckForTests() {
  healthCheckPromise = null;
}