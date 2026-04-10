// src/pages/OAuthGoogleDone.jsx
import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthGoogleDone() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const success = params.get("success");
  const email = params.get("email");
  const error = params.get("error");

  useEffect(() => {
    // Auto-redirect to Email Accounts after 3 seconds
    const t = setTimeout(() => {
      navigate("/mvp/email/email-accounts");
    }, 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Google connection
      </h1>

      {error && (
        <>
          <p style={{ color: "#fecaca", marginBottom: "0.5rem" }}>
            ❌ Error: {error}
          </p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Your Google / Okta setup might be blocking this app. Try again or
            talk to your admin.
          </p>
        </>
      )}

      {!error && success === "true" && (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            ✅ Connected to Gmail for <strong>{email}</strong>.
          </p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            We successfully called the Gmail API. You can now use this account
            for inbox + bulk replies in your MVP.
          </p>
        </>
      )}

      {!error && success === "false" && (
        <>
          <p style={{ marginBottom: "0.5rem" }}>
            ⚠️ Connected to Google for <strong>{email}</strong>, but Gmail
            access test failed.
          </p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            That usually means Gmail API scopes are blocked by your admin.
          </p>
        </>
      )}

      <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#9ca3af" }}>
        You&apos;ll be redirected to{" "}
        <Link to="/mvp/email/email-accounts" style={{ color: "#6ee7b7" }}>
          Email setup
        </Link>{" "}
        in a moment…
      </p>
    </div>
  );
}
