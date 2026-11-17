import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { checkBackendHealthOnce } from "./backendHealthCheck";

const MaintenanceContext = createContext({ active: false, reason: "none" });

function envMaintenanceOn() {
  return String(import.meta.env.VITE_MAINTENANCE_MODE || "").toLowerCase() === "true";
}

export function MaintenanceProvider({ children }) {
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  useEffect(() => {
    if (envMaintenanceOn()) return undefined;
    let cancelled = false;
    checkBackendHealthOnce().then((ok) => {
      if (!cancelled && !ok) setBackendUnavailable(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    if (envMaintenanceOn()) {
      return { active: true, reason: "env" };
    }
    if (backendUnavailable) {
      return { active: true, reason: "health" };
    }
    return { active: false, reason: "none" };
  }, [backendUnavailable]);

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenance() {
  return useContext(MaintenanceContext);
}

export const MAINTENANCE_USER_MESSAGE =
  "Sign-ups and logins are temporarily unavailable while we move servers. Please check back soon.";