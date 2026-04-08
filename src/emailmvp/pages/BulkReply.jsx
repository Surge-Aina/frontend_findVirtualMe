// src/pages/BulkReply.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../api";

function applyTemplate(subjectTemplate, bodyTemplate, vars) {
  const replacer = (text) =>
    text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const value = vars[key];
      return value !== undefined && value !== null ? String(value) : "";
    });

  return {
    subject: replacer(subjectTemplate),
    body: replacer(bodyTemplate),
  };
}


function extractVariablesFromTemplate(subject, body) {
  const text = `${subject || ""}\n${body || ""}`;
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const found = new Set();
  let match;
  while ((match = regex.exec(text))) {
    found.add(match[1]);
  }
  return Array.from(found);
}



export default function BulkReply({ auth }) {
  const location = useLocation();

  const selectedMessages = location.state?.messages || [];
  const initialAccountId = location.state?.accountId || "";

  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // If user refreshes and there's no state, show a hint
  const hasSelection = selectedMessages.length > 0;

  useEffect(() => {
    if (!auth?.token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [accountsData, templatesData] = await Promise.all([
          apiRequest("/email/email-accounts", {
            method: "GET",
            token: auth.token,
          }),
          apiRequest("/email/templates", {
            method: "GET",
            token: auth.token,
          }),
        ]);

        const accountList = accountsData.accounts || [];
        setAccounts(accountList);

        const templateList = templatesData.templates || [];
        setTemplates(templateList);

        if (templateList.length > 0) {
          setSelectedTemplateId(templateList[0].id);
        }

        // Initialize row data from selected messages
        const defaultAccountId =
          initialAccountId || (accountList[0] && accountList[0].id) || "";

        const initialRows = selectedMessages.map((msg) => {
       const fromString = msg.from && msg.from.length > 0 ? msg.from[0] : "unknown@example.com";
          // Extract email from "Name <email@example.com>" format
          const emailMatch = fromString.match(/<([^>]+)>/);
          const receiver = emailMatch ? emailMatch[1] : fromString;
          return {
            uid: msg.uid,
            originalSubject: msg.subject || "",
            opened: msg.seen,
            to: receiver,
            accountId: defaultAccountId,
            continueThread: true,
            variables: {
              name: "",
              amount: "",
              subject: msg.subject || "",
              senderName: "",
              reason: "",
              timeline: "",
              customNote: "",
            },
          };
        });

        setRows(initialRows);
      } catch (err) {
        console.error("BulkReply load error:", err);
        setError(err.message || "Failed to load data for bulk reply.");
      } finally {
        setLoading(false);
      }
    };

    if (hasSelection) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [auth?.token, hasSelection, initialAccountId, selectedMessages]);

  const currentTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );
const activeVariables = useMemo(() => {
  if (!currentTemplate) return [];
  return extractVariablesFromTemplate(
    currentTemplate.subject,
    currentTemplate.body
  ).filter((name) => name !== "subject"); // 👈 don't make a column for subject
}, [currentTemplate]);


  const previewRows = useMemo(() => {
    if (!currentTemplate) return rows;
    return rows.map((row) => {
      const vars = {
        ...row.variables,
        subject: row.variables.subject || row.originalSubject,
      };
      const { subject, body } = applyTemplate(
        currentTemplate.subject,
        currentTemplate.body,
        vars
      );
      return { ...row, previewSubject: subject, previewBody: body };
    });
  }, [rows, currentTemplate]);

  const updateRow = (uid, updater) => {
    setRows((prev) =>
      prev.map((r) => (r.uid === uid ? { ...r, ...updater(r) } : r))
    );
  };

  const handleSend = async () => {
    if (!currentTemplate) return;
    setSending(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        replies: previewRows.map((row) => ({
          accountId: row.accountId,
          to: row.to,
          subject: row.previewSubject || currentTemplate.subject,
          body: row.previewBody || currentTemplate.body,
          continueThread: row.continueThread,
          originalSubject: row.originalSubject,
        })),
      };

      const data = await apiRequest("/email/reply-bulk", {
  method: "POST",
  token: auth.token,
  body: payload,        // <-- no JSON.stringify here
});


      setSuccessMessage(
        `Bulk replies processed. Sent: ${
          (data.results || []).filter((r) => r.status === "sent").length
        }, Errors: ${
          (data.results || []).filter((r) => r.status === "error").length
        }`
      );
    } catch (err) {
      console.error("BulkReply send error:", err);
      setError(err.message || "Failed to send bulk replies.");
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) {
      return;
    }
    const name = window.prompt(
      "New template name:",
      `${currentTemplate.name} copy`
    );
    if (!name) return;

    try {
      const res = await apiRequest("/email/templates", {
  method: "POST",
  token: auth.token,
  body: {
    name,
    subject: currentTemplate.subject,
    body: currentTemplate.body,
    variables: activeVariables,
  },
});


      const newTpl = res.template;
      setTemplates((prev) => [newTpl, ...prev]);
      setSelectedTemplateId(newTpl.id);
    } catch (err) {
      console.error("Save template error:", err);
      setError(err.message || "Failed to save template.");
    }
  };

  if (!hasSelection) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Bulk reply</h1>
            <p style={styles.subtitle}>
              Select messages from Inbox and click &quot;Reply with template&quot;.
            </p>
          </div>
          <nav style={styles.headerNav}>
            <Link to="/mvp" style={styles.headerNavLink}>
              Dashboard
            </Link>
            <span style={styles.headerNavSeparator}>/</span>
            <Link to="/mvp/inbox" style={styles.headerNavLink}>
              Inbox
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
              Bulk reply
            </span>
          </nav>
        </header>

        <main style={styles.main}>
          <div style={styles.card}>
            <p style={styles.mutedText}>
              No selected emails found. Go to{" "}
              <Link to="/mvp/inbox" style={styles.link}>
                Inbox
              </Link>{" "}
              and select some emails first.
            </p>
          </div>
        </main>
      </div>
    );
  }



  const handlePasteIntoVariable = (e, startRowIndex, startVarIndex) => {
  if (!currentTemplate || activeVariables.length === 0) return;

  const text = e.clipboardData.getData("text");
  if (!text) return;

  e.preventDefault();

  const rowsData = text
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter(
      (cells) =>
        cells.length > 1 || (cells.length === 1 && cells[0].trim() !== "")
    );

  if (rowsData.length === 0) return;

  setRows((prev) => {
    const updated = [...prev];

    rowsData.forEach((cells, rOffset) => {
      const rowIndex = startRowIndex + rOffset;
      if (rowIndex >= updated.length) return;

      const row = updated[rowIndex];
      let newVars = { ...row.variables };

      cells.forEach((cell, cOffset) => {
        const varIndex = startVarIndex + cOffset;
        if (varIndex >= activeVariables.length) return;
        const varName = activeVariables[varIndex];
        newVars[varName] = cell;
      });

      updated[rowIndex] = {
        ...row,
        variables: newVars,
      };
    });

    return updated;
  });
};

const handleDownloadTable = () => {
  if (previewRows.length === 0) return;

  const headers = [
    "to",
    "originalSubject",
    "opened",
    "continueThread",
    "accountId",
    ...activeVariables,
  ];

  const lines = [headers.join(",")];

  previewRows.forEach((row) => {
    const baseCells = [
      row.to || "",
      (row.originalSubject || "").replace(/"/g, '""'),
      row.opened ? "Opened" : "Unread",
      row.continueThread ? "yes" : "no",
      row.accountId || "",
    ];

    const varCells = activeVariables.map((v) =>
      (row.variables[v] ?? "").toString().replace(/"/g, '""')
    );

    const cells = [...baseCells, ...varCells];

    const csvLine = cells.map((val) => `"${val}"`).join(",");
    lines.push(csvLine);
  });

  const csv = lines.join("\r\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk-reply-data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Bulk reply</h1>
          <p style={styles.subtitle}>
            Review recipients, choose a template, fill variables, and send replies
            together.
          </p>
        </div>
        <nav style={styles.headerNav}>
          <Link to="/mvp" style={styles.headerNavLink}>
            Dashboard
          </Link>
          <span style={styles.headerNavSeparator}>/</span>
          <Link to="/mvp/inbox" style={styles.headerNavLink}>
            Inbox
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
            Bulk reply
          </span>
        </nav>
      </header>

      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}
        {successMessage && (
          <div style={styles.successBox}>{successMessage}</div>
        )}

        {loading ? (
          <div style={styles.card}>Loading…</div>
        ) : (
          <>
            <div style={styles.card}>
              <div style={styles.templateHeaderRow}>
                <div>
                  <div style={styles.label}>Template</div>
                  <select
                    style={styles.select}
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.isSystem ? `★ ${tpl.name}` : tpl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.templateActions}>
  <button style={styles.buttonGhost} onClick={handleSaveTemplate}>
    Save as new template
  </button>
  <button style={styles.buttonGhost} onClick={handleDownloadTable}>
    Download table (Excel CSV)
  </button>
  <button
    style={{
      ...styles.buttonPrimary,
      opacity: sending ? 0.7 : 1,
    }}
    disabled={sending}
    onClick={handleSend}
  >
    {sending ? "Sending…" : "Send replies"}
  </button>
</div>

                
              </div>

              {currentTemplate && (
                <div style={styles.templatePreview}>
                  <div style={styles.templatePreviewCol}>
                    <div style={styles.label}>Template subject</div>
                    <textarea
                      style={styles.textarea}
                      rows={2}
                      value={currentTemplate.subject}
                      onChange={(e) =>
                        setTemplates((prev) =>
                          prev.map((tpl) =>
                            tpl.id === currentTemplate.id
                              ? { ...tpl, subject: e.target.value }
                              : tpl
                          )
                        )
                      }
                    />
                  </div>
                  <div style={styles.templatePreviewCol}>
                    <div style={styles.label}>Template body</div>
                    <textarea
                      style={styles.textarea}
                      rows={5}
                      value={currentTemplate.body}
                      onChange={(e) =>
                        setTemplates((prev) =>
                          prev.map((tpl) =>
                            tpl.id === currentTemplate.id
                              ? { ...tpl, body: e.target.value }
                              : tpl
                          )
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.label}>
                Replies ({previewRows.length}) – per row choose sender, thread
                behavior, and variable values.
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Receiver</th>
                      <th style={styles.th}>Opened</th>
                      <th style={styles.th}>Sender account</th>
                      <th style={styles.th}>Continue thread</th>
                      {activeVariables.map((v) => (
  <th style={styles.th} key={v}>
    {v}
  </th>
))}

                    </tr>
                  </thead>
                  <tbody>
  {previewRows.map((row, rowIndex) => (
    <tr key={row.uid}>
      {/* existing columns: subject, receiver, opened, sender account, continue thread */}
      <td style={styles.td}>
        <input
          type="text"
          style={styles.input}
          value={row.previewSubject || row.originalSubject}
          onChange={(e) =>
  updateRow(row.uid, (existing) => ({
    variables: {
      ...existing.variables,
      subject: e.target.value,
    },
  }))
}

        />
      </td>
      <td style={styles.td}>{row.to}</td>
      <td style={styles.td}>{row.opened ? "Opened" : "Unread"}</td>
      <td style={styles.td}>
        <select
          style={styles.select}
          value={row.accountId}
          onChange={(e) =>
            updateRow(row.uid, () => ({
                accountId: e.target.value,
                }))
            }
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.fromEmail}
            </option>
          ))}
        </select>
      </td>
      <td style={styles.tdCenter}>
        <input
          type="checkbox"
          checked={row.continueThread}
          onChange={(e) =>
            updateRow(row.uid, () => ({
              continueThread: e.target.checked,
            }))
          }
        />
      </td>

      {activeVariables.map((v, varIndex) => (
  <td style={styles.td} key={v}>
    <input
      type="text"
      style={styles.input}
      value={row.variables[v] ?? ""}
      onChange={(e) =>
        updateRow(row.uid, (existing) => ({
          variables: {
            ...existing.variables,
            [v]: e.target.value,
          },
        }))
      }
      onPaste={(e) =>
        handlePasteIntoVariable(e, rowIndex, varIndex)
      }
    />
  </td>
))}

    </tr>
  ))}
</tbody>

                </table>
              </div>
            </div>
          </>
        )}
      </main>
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
  main: {
    flex: 1,
    padding: "1.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    backgroundColor: "#020617",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "1rem",
  },
  label: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    marginBottom: "0.25rem",
  },
  mutedText: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  errorBox: {
    backgroundColor: "#7f1d1d",
    border: "1px solid #fecaca",
    color: "#fee2e2",
    borderRadius: 8,
    padding: "0.75rem",
    fontSize: "0.8rem",
  },
  successBox: {
    backgroundColor: "#064e3b",
    border: "1px solid #6ee7b7",
    color: "#d1fae5",
    borderRadius: 8,
    padding: "0.75rem",
    fontSize: "0.8rem",
  },
  templateHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "flex-end",
    marginBottom: "0.75rem",
  },
  templateActions: {
    display: "flex",
    gap: "0.5rem",
  },
  select: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.35rem 0.5rem",
    fontSize: "0.85rem",
    color: "#e5e7eb",
  },
  buttonPrimary: {
    padding: "0.4rem 0.8rem",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#22c55e",
    color: "#020617",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "0.35rem 0.7rem",
    borderRadius: 6,
    border: "1px solid #4b5563",
    backgroundColor: "transparent",
    color: "#e5e7eb",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  templatePreview: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  templatePreviewCol: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  textarea: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.4rem 0.5rem",
    fontSize: "0.8rem",
    color: "#e5e7eb",
    resize: "vertical",
  },
  tableWrapper: {
    marginTop: "0.75rem",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.8rem",
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #1f2937",
    padding: "0.4rem 0.5rem",
    color: "#9ca3af",
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid #020617",
    padding: "0.35rem 0.5rem",
    verticalAlign: "top",
  },
  tdCenter: {
    borderBottom: "1px solid #020617",
    padding: "0.35rem 0.5rem",
    textAlign: "center",
    verticalAlign: "middle",
  },
  input: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.3rem 0.4rem",
    fontSize: "0.8rem",
    color: "#e5e7eb",
    width: "100%",
  },
  link: {
    color: "#6ee7b7",
    textDecoration: "underline",
  },
};
