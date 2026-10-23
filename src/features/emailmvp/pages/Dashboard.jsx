import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";   // ⬅️ ADD THIS LINE
import { apiRequest } from "../api";
import EmailAccounts from "./EmailAccounts";


export default function Dashboard({ auth, onLogout }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview"); // "overview" | "email" | "bulk"

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await apiRequest("/auth/me", {
          method: "GET",
          token: auth.token,
        });
        setMe(data.user);
      } catch (err) {
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [auth.token]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>M</div>
          <div>
            <div style={styles.brandTitle}>Email MVP</div>
            <div style={styles.brandSubtitle}>Multi-account email console</div>
          </div>
        </div>

        {me && (
          <div style={styles.userBox}>
            <div style={styles.userName}>{me.name}</div>
            <div style={styles.userEmail}>{me.email}</div>
          </div>
        )}

        <nav style={styles.nav}>
  <button
    style={{
      ...styles.navButton,
      ...(activeSection === "overview" ? styles.navButtonActive : {}),
    }}
    onClick={() => setActiveSection("overview")}
  >
    Overview
  </button>
  <button
    style={{
      ...styles.navButton,
      ...(activeSection === "email" ? styles.navButtonActive : {}),
    }}
    onClick={() => setActiveSection("email")}
  >
    Email setup
  </button>
  <button>
    <Link to="/mvp/inbox" className="..."> Inbox</Link>
  </button>
  <button
    style={{
      ...styles.navButton,
      ...(activeSection === "bulk" ? styles.navButtonActive : {}),
      ...styles.navButtonDisabled,
    }}
    disabled
  >
    Bulk campaigns (coming soon)
  </button>
</nav>


        <button style={styles.logoutBtn} onClick={onLogout}>
          Log out
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {error && <div style={styles.error}>{error}</div>}

        {activeSection === "overview" && (
          <div>
            <h2 style={styles.sectionTitle}>Welcome, {me?.name}</h2>

            <div style={styles.cardsRow}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Account status</h3>
                <p>
                  <strong>Email:</strong> {me?.email}
                </p>
                <p>
                  <strong>Verified in this app:</strong>{" "}
                  {me?.isVerified ? "Yes" : "No"}
                </p>
                <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                  This is your login for the Email MVP. Your real sending
                  accounts (Gmail, Outlook, custom domain, etc.) are managed
                  separately in the <strong>Email setup</strong> section.
                </p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Next steps</h3>
                <ol style={{ paddingLeft: "1.25rem", fontSize: "0.95rem" }}>
                  <li>
                    Go to <strong>Email setup</strong> and connect at least one
                    email account (using an app password if needed).
                  </li>
                  <li>
                    Use <strong>Send test to surgeaina@gmail.com</strong> to
                    verify that everything is wired correctly.
                  </li>
                  <li>
                    Later, you&apos;ll create <strong>bulk templates</strong>,
                    upload Excel lists, and send personalized campaigns with{" "}
                    <strong>AI replies</strong>.
                  </li>
                </ol>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Upcoming features</h3>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.95rem" }}>
                <li>
                  Bulk upload from Excel (email, name, amount, etc.) with
                  automatic variable mapping.
                </li>
                <li>
                  Template builder for dynamic emails like{" "}
                  <code>{"{{name}}"}</code>, <code>{"{{amount}}"}</code>, etc.
                </li>
                <li>
                  AI-generated reply drafts based on incoming emails and your
                  tone preferences.
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === "email" && (
          <div>
            <h2 style={styles.sectionTitle}>Email setup</h2>
            <p style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>
              Add your real email accounts here (Gmail, Outlook, custom
              domain). We&apos;ll detect the SMTP settings automatically. Use
              an <strong>app password</strong> for providers that require it,
              then send a <strong>test email</strong> to verify.
            </p>
            <EmailAccounts auth={auth} />
          </div>
        )}

        {activeSection === "bulk" && (
          <div>
            <h2 style={styles.sectionTitle}>Bulk campaigns (coming soon)</h2>
            <div style={styles.card}>
              <p>
                Here we&apos;ll build:
                <br />
                – Excel upload (email, name, amount, etc.)
                <br />
                – Template creation with variables
                <br />
                – One-click send to many recipients, personalized per row
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f5f7",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  sidebar: {
    width: 260,
    padding: "1.5rem 1.25rem",
    borderRight: "1px solid #ddd",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: "999px",
    background: "#111827",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  brandTitle: {
    fontWeight: 700,
    fontSize: "1rem",
  },
  brandSubtitle: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  userBox: {
    padding: "0.75rem",
    borderRadius: 8,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  userName: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "0.15rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    marginTop: "0.5rem",
    flexGrow: 1,
  },
  navButton: {
    textAlign: "left",
    padding: "0.45rem 0.6rem",
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  navButtonActive: {
    background: "#111827",
    color: "#ffffff",
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "0.4rem 0.6rem",
    borderRadius: 6,
    border: "1px solid #ef4444",
    background: "#3c0b0bff",
    color: "#b91c1c",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  main: {
    flexGrow: 1,
    padding: "1.75rem 2rem",
    overflowY: "auto",
  },
  sectionTitle: {
    marginBottom: "1rem",
  },
  cardsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1rem",
  },
  card: {
    flex: "1 1 260px",
    background: "#ffffff",
    borderRadius: 10,
    padding: "1rem",
    border: "1px solid #e5e7eb",
  },
  cardTitle: {
    marginBottom: "0.5rem",
  },
  error: {
    marginBottom: "1rem",
    padding: "0.75rem",
    borderRadius: 8,
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    whiteSpace: "pre-wrap",
  },
};
