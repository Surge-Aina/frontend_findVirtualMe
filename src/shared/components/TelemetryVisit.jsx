import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logApiError } from "@/shared/api/safeLog";

function getConsent() {
  const local = localStorage.getItem("cookieConsent");
  const cookie = document.cookie.split("; ").find(r => r.startsWith("cookie_consent="))?.split("=")[1];
  return local || cookie || "";
}

const API_BASE = import.meta.env.VITE_BACKEND_API;

export default function TelemetryVisit() {
  const { pathname } = useLocation();
  const lastSent = useRef("");

  useEffect(() => {
    const consent = getConsent();

    if (consent !== "accepted") return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const url = `${API_BASE}/api/telemetry/visit`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
      credentials: "include",
    })
      .then(async (r) => {
        void (await r.text());
      })
      .catch((e) => logApiError(e, "[TelemetryVisit] fetch failed"));
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      const consent = getConsent();
      if (consent === "accepted") {
        lastSent.current = "";
        const url = `${API_BASE}/api/telemetry/visit`;
        const page = window.location.pathname;
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page }),
          credentials: "include",
        }).catch((e) => logApiError(e, "[TelemetryVisit] change failed"));
      }
    };
    window.addEventListener("consent-changed", handler);
    return () => window.removeEventListener("consent-changed", handler);
  }, []);

  return null;
}
