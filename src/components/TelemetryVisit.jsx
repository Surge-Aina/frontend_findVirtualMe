import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

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
    console.log("[TelemetryVisit] route ->", pathname, "consent:", consent);

    if (consent !== "accepted") return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const url = `${API_BASE}/api/telemetry/visit`;
    console.log("[TelemetryVisit] POST", url, "page:", pathname);

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
      credentials: "include",
    })
      .then(async (r) => {
        const txt = await r.text();
        console.log("[TelemetryVisit] resp:", r.status, txt);
      })
      .catch((e) => console.warn("[TelemetryVisit] fetch failed:", e));
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      const consent = getConsent();
      console.log("[TelemetryVisit] consent-changed ->", consent);
      if (consent === "accepted") {
        lastSent.current = "";
        const url = `${API_BASE}/api/telemetry/visit`;
        const page = window.location.pathname;
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page }),
          credentials: "include",
        }).catch((e) => console.warn("[TelemetryVisit] change failed:", e));
      }
    };
    window.addEventListener("consent-changed", handler);
    return () => window.removeEventListener("consent-changed", handler);
  }, []);

  return null;
}
