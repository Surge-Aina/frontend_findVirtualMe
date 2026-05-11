import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function formatDateInput(d) {
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(d) {
  const date = new Date(d);
  return date.toLocaleString();
}

export default function Inbox({ auth }) {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [messageError, setMessageError] = useState("");

  // NEW: filters
  const [filterSeen, setFilterSeen] = useState("all"); // "all" | "unread" | "read"
  const [filterSender, setFilterSender] = useState("");

  // NEW: selection
  const [selectedUids, setSelectedUids] = useState([]);

  // Load email accounts from backend (same source as Email setup)
  useEffect(() => {
    if (!auth?.token) return;

    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const data = await apiRequest("/email/email-accounts", {
          method: "GET",
          token: auth.token,
        });

        const list = data.accounts || [];
        setAccounts(list);
        if (list.length > 0) {
          setSelectedAccountId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load email accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [auth?.token]);

  // Set default last 7 days
  useEffect(() => {
    const today = new Date();
    const end = today;
    const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

    setDateTo(formatDateInput(end));
    setDateFrom(formatDateInput(start));
  }, []);

  // Ensure we never exceed a 7-day window
  const clampTo7Days = (fromStr, toStr) => {
    if (!fromStr || !toStr) return { from: fromStr, to: toStr };
    const from = new Date(fromStr);
    const to = new Date(toStr);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return { from: fromStr, to: toStr };
    }
    const diffMs = to.getTime() - from.getTime();
    const maxWindowMs = 7 * 24 * 60 * 60 * 1000;

    if (diffMs > maxWindowMs) {
      const newFrom = new Date(to.getTime() - maxWindowMs);
      return { from: formatDateInput(newFrom), to: toStr };
    }
    return { from: fromStr, to: toStr };
  };

  const loadInbox = async () => {
    if (!selectedAccountId || !dateFrom || !dateTo || !auth?.token) return;

    setMessagesError("");
    setMessages([]);
    setSelectedMessage(null);
    setMessageError("");
    setSelectedUids([]);

    const { from, to } = clampTo7Days(dateFrom, dateTo);
    setDateFrom(from);
    setDateTo(to);

    try {
      setLoadingMessages(true);

      const query = `/email/inbox?accountId=${encodeURIComponent(
        selectedAccountId
      )}&start=${from}&end=${to}`;

      const data = await apiRequest(query, {
        method: "GET",
        token: auth.token,
      });

      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setMessagesError(err.message || "Failed to load inbox");
    } finally {
      setLoadingMessages(false);
    }
  };

  const openMessage = async (msg) => {
    if (!auth?.token) return;

    setSelectedMessage(null);
    setMessageError("");

    try {
      setLoadingMessage(true);

      const path = `/email/message/${encodeURIComponent(
        selectedAccountId
      )}/${msg.uid}`;

      const data = await apiRequest(path, {
        method: "GET",
        token: auth.token,
      });

      setSelectedMessage(data);
    } catch (err) {
      console.error(err);
      setMessageError(err.message || "Failed to load email");
    } finally {
      setLoadingMessage(false);
    }
  };

  // NEW: derived filtered messages (seen + sender fuzzy)
  const filteredMessages = useMemo(() => {
    let list = messages;

    if (filterSeen === "unread") {
      list = list.filter((m) => !m.seen);
    } else if (filterSeen === "read") {
      list = list.filter((m) => m.seen);
    }

    if (filterSender.trim() !== "") {
      const term = filterSender.toLowerCase();
      list = list.filter((m) => {
        const fromText = (m.from || []).join(", ").toLowerCase();
        return fromText.includes(term);
      });
    }

    return list;
  }, [messages, filterSeen, filterSender]);

  // NEW: selection helpers
  const toggleMessageSelection = (uid) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const isAllFilteredSelected =
    filteredMessages.length > 0 &&
    filteredMessages.every((m) => selectedUids.includes(m.uid));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedUids((prev) =>
        prev.filter((uid) => !filteredMessages.some((m) => m.uid === uid))
      );
    } else {
      const filteredUids = filteredMessages.map((m) => m.uid);
      setSelectedUids((prev) => Array.from(new Set([...prev, ...filteredUids])));
    }
  };

  const handleReplyWithTemplate = () => {
    const selectedMessagesData = filteredMessages.filter((m) =>
      selectedUids.includes(m.uid)
    );

    if (selectedMessagesData.length === 0) return;

    navigate("/mvp/bulk-reply", {
      state: {
        accountId: selectedAccountId,
        messages: selectedMessagesData,
      },
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Inbox</h1>
          <p style={styles.subtitle}>
            Default shows last 7 days. You can move the window back in time,
            but each query stays within 7 days.
          </p>
        </div>

        <nav style={styles.headerNav}>
          <Link to="/mvp" style={styles.headerNavLink}>
            Dashboard
          </Link>
          <span style={styles.headerNavSeparator}>/</span>
          <span
            style={{
              ...styles.headerNavLink,
              color: "#e5e7eb",
              cursor: "default",
              fontWeight: 600,
            }}
          >
            Inbox
          </span>
        </nav>
      </header>

      <div style={styles.content}>
        {/* Left column: filters + list */}
        <div style={styles.leftPane}>
          <div style={styles.filterBar}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email account</label>
              {loadingAccounts ? (
                <div style={styles.mutedText}>Loading accounts…</div>
              ) : accounts.length === 0 ? (
                <div style={styles.warningText}>
                  No email accounts yet. Add one in &quot;Email setup&quot;
                  first.
                </div>
              ) : (
                <select
                  style={styles.select}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.fromEmail}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={styles.datesRow}>
              <div style={styles.dateField}>
                <label style={styles.label}>From</label>
                <input
                  type="date"
                  style={styles.input}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div style={styles.dateField}>
                <label style={styles.label}>To</label>
                <input
                  type="date"
                  style={styles.input}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* NEW: seen filter + sender search */}
            <div style={styles.filtersRow}>
              <div style={styles.filterChipGroup}>
                <span style={styles.label}>Status:</span>
                <button
                  style={{
                    ...styles.filterChip,
                    ...(filterSeen === "all" ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setFilterSeen("all")}
                >
                  All
                </button>
                <button
                  style={{
                    ...styles.filterChip,
                    ...(filterSeen === "unread" ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setFilterSeen("unread")}
                >
                  Unread
                </button>
                <button
                  style={{
                    ...styles.filterChip,
                    ...(filterSeen === "read" ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setFilterSeen("read")}
                >
                  Read
                </button>
              </div>

              <div style={styles.senderSearchWrapper}>
                <input
                  type="text"
                  placeholder="Filter by sender (e.g. ramesh, SBI)…"
                  style={styles.input}
                  value={filterSender}
                  onChange={(e) => setFilterSender(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.actionsRow}>
              <button
                onClick={loadInbox}
                style={styles.button}
                disabled={!selectedAccountId || loadingMessages}
              >
                {loadingMessages ? "Loading…" : "Load inbox"}
              </button>

              <button
                onClick={handleReplyWithTemplate}
                style={{
                  ...styles.buttonSecondary,
                  opacity: selectedUids.length === 0 ? 0.5 : 1,
                  cursor: selectedUids.length === 0 ? "not-allowed" : "pointer",
                }}
                disabled={selectedUids.length === 0}
              >
                Reply with template ({selectedUids.length})
              </button>
            </div>

            {messagesError && (
              <div style={styles.errorText}>{messagesError}</div>
            )}
          </div>

          <div style={styles.listWrapper}>
            {filteredMessages.length === 0 && !loadingMessages ? (
              <div style={styles.mutedText}>No messages in this window.</div>
            ) : (
              <ul style={styles.messageList}>
                {filteredMessages.length > 0 && (
                  <li style={styles.listHeaderRow}>
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                    />
                    <span style={styles.listHeaderText}>Subject</span>
                    <span style={styles.listHeaderText}>From</span>
                    <span style={styles.listHeaderText}>Opened</span>
                  </li>
                )}
                {filteredMessages.map((msg) => (
                  <li
                    key={msg.uid}
                    style={{
                      ...styles.messageItem,
                      ...(selectedMessage &&
                      selectedMessage.uid === msg.uid
                        ? styles.messageItemActive
                        : {}),
                    }}
                  >
                    <div style={styles.messageRow}>
                      <input
                        type="checkbox"
                        checked={selectedUids.includes(msg.uid)}
                        onChange={() => toggleMessageSelection(msg.uid)}
                        style={{ marginRight: "0.4rem" }}
                      />
                      <div
                        style={styles.messageTextBlock}
                        onClick={() => openMessage(msg)}
                      >
                        <div style={styles.messageHeaderRow}>
                          <span
                            style={{
                              ...styles.messageSubject,
                              color: msg.seen ? "#e5e7eb" : "#6ee7b7",
                            }}
                          >
                            {msg.subject}
                          </span>
                          <span style={styles.messageDate}>
                            {formatDisplayDate(msg.date)}
                          </span>
                        </div>
                        <div style={styles.messageFrom}>
                          {msg.from && msg.from.length > 0
                            ? msg.from.join(", ")
                            : "Unknown sender"}
                        </div>
                      </div>
                      <div style={styles.openBadge}>
                        {msg.seen ? "Opened" : "Unread"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column: message viewer */}
        <div style={styles.rightPane}>
          <div style={styles.messageHeader}>
            <h2 style={styles.messageTitle}>Message</h2>
            <p style={styles.subtitle}>
              Click on a message on the left to view it here.
            </p>
          </div>

          <div style={styles.messageBodyWrapper}>
            {loadingMessage && (
              <div style={styles.mutedText}>Loading message…</div>
            )}

            {messageError && (
              <div style={styles.errorText}>{messageError}</div>
            )}

            {!loadingMessage && !selectedMessage && !messageError && (
              <div style={styles.mutedText}>No message selected.</div>
            )}

            {selectedMessage && !loadingMessage && !messageError && (
              <div style={styles.messageBody}>
                <div style={styles.messageMeta}>
                  <div style={styles.messageMetaSubject}>
                    {selectedMessage.subject || "(no subject)"}
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>From:</span>{" "}
                    {selectedMessage.from?.join(", ") || "Unknown"}
                  </div>
                  {selectedMessage.to && selectedMessage.to.length > 0 && (
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>To:</span>{" "}
                      {selectedMessage.to.join(", ")}
                    </div>
                  )}
                  {selectedMessage.date && (
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Date:</span>{" "}
                      {formatDisplayDate(selectedMessage.date)}
                    </div>
                  )}

                  {selectedMessage.attachments &&
                    selectedMessage.attachments.length > 0 && (
                      <div style={styles.attachmentsRow}>
                        Attachments:{" "}
                        {selectedMessage.attachments
                          .map((a) => a.filename || "(unnamed)")
                          .join(", ")}
                      </div>
                    )}
                </div>

                {/* HTML body */}
                <div
                  // WARNING: for local dev only, in real app sanitize HTML
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedMessage.html ||
                      `<pre>${selectedMessage.text || ""}</pre>`,
                  }}
                  style={styles.htmlBody}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    borderBottom: "1px solid #1f2937",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    marginTop: "0.25rem",
  },
  headerNav: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.8rem",
  },
  headerNavLink: {
    color: "#9ca3af",
    textDecoration: "none",
    cursor: "pointer",
  },
  headerNavSeparator: {
    color: "#4b5563",
  },
  content: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  leftPane: {
    width: "100%",
    maxWidth: 520,
    borderRight: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
  },
  filterBar: {
    padding: "1rem",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  mutedText: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  warningText: {
    fontSize: "0.75rem",
    color: "#fbbf24",
  },
  errorText: {
    fontSize: "0.75rem",
    color: "#f87171",
  },
  select: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.35rem 0.5rem",
    fontSize: "0.85rem",
    color: "#e5e7eb",
  },
  datesRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
    alignItems: "flex-end",
  },
  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  input: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.35rem 0.5rem",
    fontSize: "0.85rem",
    color: "#e5e7eb",
  },
  filtersRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterChipGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  filterChip: {
    fontSize: "0.7rem",
    padding: "0.15rem 0.45rem",
    borderRadius: 999,
    border: "1px solid #374151",
    backgroundColor: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
  },
  filterChipActive: {
    backgroundColor: "#111827",
    color: "#e5e7eb",
    borderColor: "#e5e7eb",
  },
  senderSearchWrapper: {
    flex: 1,
  },
  actionsRow: {
    display: "flex",
    gap: "0.5rem",
  },
  button: {
    padding: "0.4rem 0.8rem",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#22c55e",
    color: "#020617",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "0.4rem 0.8rem",
    borderRadius: 6,
    border: "1px solid #4b5563",
    backgroundColor: "transparent",
    color: "#e5e7eb",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  listWrapper: {
    flex: 1,
    overflowY: "auto",
  },
  messageList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  listHeaderRow: {
    display: "grid",
    gridTemplateColumns: "auto 2fr 2fr auto",
    gap: "0.5rem",
    alignItems: "center",
    padding: "0.4rem 0.75rem",
    fontSize: "0.7rem",
    color: "#9ca3af",
    borderBottom: "1px solid #020617",
  },
  listHeaderText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  messageItem: {
    padding: "0.4rem 0.75rem",
    borderBottom: "1px solid #020617",
  },
  messageItemActive: {
    backgroundColor: "#020617",
  },
  messageRow: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: "0.4rem",
    alignItems: "center",
  },
  messageTextBlock: {
    cursor: "pointer",
  },
  messageHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  messageSubject: {
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  messageDate: {
    fontSize: "0.6rem",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },
  messageFrom: {
    fontSize: "0.7rem",
    color: "#9ca3af",
    marginTop: "0.25rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  openBadge: {
    fontSize: "0.65rem",
    padding: "0.15rem 0.4rem",
    borderRadius: 999,
    border: "1px solid #374151",
    color: "#9ca3af",
  },
  rightPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  messageHeader: {
    padding: "1rem",
    borderBottom: "1px solid #1f2937",
  },
  messageTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  messageBodyWrapper: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#020617",
    padding: "1rem",
  },
  messageBody: {
    maxWidth: 900,
    margin: "0 auto",
  },
  messageMeta: {
    borderBottom: "1px solid #1f2937",
    paddingBottom: "0.75rem",
    marginBottom: "0.75rem",
  },
  messageMetaSubject: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  metaRow: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  metaLabel: {
    fontWeight: 600,
  },
  attachmentsRow: {
    marginTop: "0.4rem",
    fontSize: "0.7rem",
    color: "#9ca3af",
  },
  htmlBody: {
    fontSize: "0.85rem",
  },
};
