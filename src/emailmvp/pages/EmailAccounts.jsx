// src/pages/EmailAccounts.jsx
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function EmailAccounts({ auth }) {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState("");
    const [oauthLoading, setOauthLoading] = useState(false);
const [oauthError, setOauthError] = useState("");

  const [form, setForm] = useState({
    name: "",
    fromName: "",
    email: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [sendForm, setSendForm] = useState({
    accountId: "",
    to: "",
    subject: "",
    content: "",
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const handleGoogleConnect = async () => {
  setOauthError("");
  try {
    setOauthLoading(true);
    const data = await apiRequest("/oauth/google/start", {
      method: "GET",
      token: auth.token,
    });
    if (data.url) {
      // This sends the user to Google, which then sends them to Okta, etc.
      window.location.href = data.url;
    } else {
      setOauthError("Backend did not return a Google login URL.");
    }
  } catch (err) {
    console.error("Google connect error:", err);
    setOauthError(err.message || "Failed to start Google Sign-In.");
  } finally {
    setOauthLoading(false);
  }
};

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError("");
    try {
      const data = await apiRequest("/email/email-accounts", {
        token: auth.token,
      });
      setAccounts(data.accounts || []);
    } catch (err) {
      setAccountsError(err.message || "Failed to load email accounts.");
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadAccounts();
  }, [auth.token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreating(true);

    try {
      await apiRequest("/email/email-accounts", {
        method: "POST",
        token: auth.token,
        body: {
          email: form.email,
          password: form.password,
          name: form.name,
          fromName: form.fromName,
        },
      });

      setCreateSuccess("Email account saved.");
      setForm({
        name: "",
        fromName: "",
        email: "",
        password: "",
      });

      await loadAccounts();
    } catch (err) {
      setCreateError(err.message || "Failed to save email account.");
    } finally {
      setCreating(false);
    }
  };

  const handleSendFormChange = (e) => {
    const { name, value } = e.target;
    setSendForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");
    setSending(true);

    try {
      await apiRequest("/email/send", {
        method: "POST",
        token: auth.token,
        body: {
          accountId: sendForm.accountId,
          to: sendForm.to,
          subject: sendForm.subject,
          body: sendForm.content,
        },
      });

      setSendSuccess("Email sent successfully.");
      setSendForm((prev) => ({
        ...prev,
        to: "",
        subject: "",
        content: "",
      }));
    } catch (err) {
      setSendError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>SMTP Email Accounts</h2>
        <div style={{ marginBottom: "1rem" }}>
  <button
    onClick={handleGoogleConnect}
    disabled={oauthLoading}
    style={{
      padding: "0.45rem 0.9rem",
      borderRadius: 6,
      border: "none",
      backgroundColor: "#2563eb",
      color: "#f9fafb",
      fontSize: "0.85rem",
      fontWeight: 500,
      cursor: oauthLoading ? "default" : "pointer",
      opacity: oauthLoading ? 0.7 : 1,
    }}
  >
    {oauthLoading ? "Opening Google…" : "Connect Gmail via Google Sign-In (SSO)"}
  </button>
  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
    Works with Okta, Duo, Google Authenticator, etc. We never see your password;
    Google/Okta handle the login.
  </p>
  {oauthError && (
    <p style={{ fontSize: "0.75rem", color: "#fecaca", marginTop: "0.25rem" }}>
      {oauthError}
    </p>
  )}
</div>

      {/* Existing Accounts */}
      <section style={styles.section}>
        <h3>Saved Accounts</h3>
        {loadingAccounts ? (
          <p>Loading accounts...</p>
        ) : accountsError ? (
          <p style={styles.error}>{accountsError}</p>
        ) : accounts.length === 0 ? (
          <p>No email accounts yet. Add one below.</p>
        ) : (
          <ul style={styles.list}>
            {accounts.map((acc) => (
              <li key={acc.id} style={styles.listItem}>
                <strong>{acc.name}</strong> – {acc.fromEmail} (
                {acc.provider}, {acc.host}:{acc.port})
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create Account Form */}
      <section style={styles.section}>
        <h3>Add New Email Account</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            name="name"
            placeholder="Account label (optional, e.g. Surge Aina)"
            value={form.name}
            onChange={handleFormChange}
            style={styles.input}
          />
          <input
            name="fromName"
            placeholder="From name (optional, e.g. Om)"
            value={form.fromName}
            onChange={handleFormChange}
            style={styles.input}
          />
          <input
            name="email"
            placeholder="Email address (e.g. om@surgeaina.com)"
            value={form.email}
            onChange={handleFormChange}
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Email password / app password"
            value={form.password}
            onChange={handleFormChange}
            style={styles.input}
          />

          {createError && <div style={styles.error}>{createError}</div>}
          {createSuccess && <div style={styles.success}>{createSuccess}</div>}

          <button type="submit" style={styles.button} disabled={creating}>
            {creating ? "Saving..." : "Save Account"}
          </button>
        </form>
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
          ⚠️ Use an <strong>app password</strong> for Gmail/Outlook if required.
          This is for local MVP testing only.
        </p>
      </section>

      {/* Send Email */}
      <section style={styles.section}>
        <h3>Send Email</h3>
        {accounts.length === 0 ? (
          <p>You need at least one saved account to send emails.</p>
        ) : (
          <form onSubmit={handleSendEmail} style={styles.form}>
            <select
              name="accountId"
              value={sendForm.accountId}
              onChange={handleSendFormChange}
              style={styles.input}
            >
              <option value="">Select email account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.fromEmail})
                </option>
              ))}
            </select>
            <input
              name="to"
              placeholder="To email"
              value={sendForm.to}
              onChange={handleSendFormChange}
              style={styles.input}
            />
            <input
              name="subject"
              placeholder="Subject"
              value={sendForm.subject}
              onChange={handleSendFormChange}
              style={styles.input}
            />
            <textarea
              name="content"
              placeholder="Email content"
              value={sendForm.content}
              onChange={handleSendFormChange}
              rows={5}
              style={styles.textarea}
            />

            {sendError && <div style={styles.error}>{sendError}</div>}
            {sendSuccess && <div style={styles.success}>{sendSuccess}</div>}

            <button type="submit" style={styles.button} disabled={sending}>
              {sending ? "Sending..." : "Send Email"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: "2rem auto",
    padding: "2rem",
  },
  section: {
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
  },
  textarea: {
    padding: "0.5rem",
    fontSize: "1rem",
  },
  button: {
    padding: "0.6rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
  },
  listItem: {
    marginBottom: "0.5rem",
  },
  error: {
    color: "red",
    fontSize: "0.9rem",
  },
  success: {
    color: "green",
    fontSize: "0.9rem",
  },
};
