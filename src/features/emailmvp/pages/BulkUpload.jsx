import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

// Reuse same helpers as BulkReply

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

function makeRowId() {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(16)
    .slice(2, 8)}`;
}

export default function BulkUpload({ auth }) {
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!auth?.token) return;

    const load = async () => {
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
        const templateList = templatesData.templates || [];

        setAccounts(accountList);
        setTemplates(templateList);

        if (templateList.length > 0) {
          setSelectedTemplateId(templateList[0].id);
        }

        setRows([]); // start empty
      } catch (err) {
        console.error("BulkUpload load error:", err);
        setError(err.message || "Failed to load bulk upload data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth?.token]);

  const currentTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const activeVariables = useMemo(() => {
    if (!currentTemplate) return [];
    return extractVariablesFromTemplate(
      currentTemplate.subject,
      currentTemplate.body
    );
  }, [currentTemplate]);

  const defaultAccountId =
    (accounts[0] && (accounts[0].id || accounts[0]._id)) || "";

  const updateRow = (id, updater) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updater(r) } : r))
    );
  };

  const handleAddRows = () => {
    const answer = window.prompt(
      "How many rows do you want to add?",
      "10"
    );
    const count = parseInt(answer, 10);
    if (!count || count <= 0) return;

    const newRows = [];
    for (let i = 0; i < count; i += 1) {
      newRows.push({
        id: makeRowId(),
        to: "",
        subjectOverride: "",
        accountId: defaultAccountId,
        variables: {},
      });
    }
    setRows((prev) => [...prev, ...newRows]);
  };

  // Paste a single Excel column into the "To" emails column
  const handlePasteEmails = (e, startRowIndex) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;

    e.preventDefault();

    const rowsData = text
      .split(/\r?\n/)
      .map((line) => line.split("\t")[0])
      .filter((val) => val && val.trim() !== "");

    if (rowsData.length === 0) return;

    setRows((prev) => {
      const updated = [...prev];
      rowsData.forEach((email, offset) => {
        const rowIndex = startRowIndex + offset;
        if (rowIndex >= updated.length) return;

        const row = updated[rowIndex];
        updated[rowIndex] = { ...row, to: email.trim() };
      });
      return updated;
    });
  };

  // Paste a block from Excel into variables grid (like BulkReply)
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

        updated[rowIndex] = { ...row, variables: newVars };
      });

      return updated;
    });
  };

  // Download current table as CSV (Excel-friendly)
  const handleDownloadTemplate = () => {
    const headers = ["to", "subjectOverride", "accountId", ...activeVariables];
    const lines = [headers.join(",")];

    if (rows.length === 0) {
      // Just header row – useful for blank template
    } else {
      rows.forEach((row) => {
        const baseCells = [
          (row.to || "").replace(/"/g, '""'),
          (row.subjectOverride || "").replace(/"/g, '""'),
          (row.accountId || "").replace(/"/g, '""'),
        ];

        const varCells = activeVariables.map((v) =>
          (row.variables[v] ?? "").toString().replace(/"/g, '""')
        );

        const cells = [...baseCells, ...varCells];
        const csvLine = cells.map((val) => `"${val}"`).join(",");
        lines.push(csvLine);
      });
    }

    const csv = lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-upload-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!currentTemplate) {
      setError("Select a template first.");
      return;
    }

    const nonEmptyRows = rows.filter((r) => r.to && r.to.trim() !== "");
    if (nonEmptyRows.length === 0) {
      setError("Add at least one row with a receiver email.");
      return;
    }

    setSending(true);
    setError("");
    setSuccessMessage("");

    try {
      const replies = nonEmptyRows.map((row) => {
        const vars = {
          ...row.variables,
          subject: row.subjectOverride || currentTemplate.subject,
        };

        const { subject, body } = applyTemplate(
          currentTemplate.subject,
          currentTemplate.body,
          vars
        );

        const finalSubject = subject || row.subjectOverride || currentTemplate.subject;

        return {
          accountId: row.accountId || defaultAccountId,
          to: row.to.trim(),
          subject: finalSubject,
          body,
          continueThread: false, // always new threads for bulk upload
          originalSubject: finalSubject,
        };
      });

      const data = await apiRequest("/email/reply-bulk", {
        method: "POST",
        token: auth.token,
        body: { replies },
      });

      setSuccessMessage(
        `Bulk upload send complete. Sent: ${
          (data.results || []).filter((r) => r.status === "sent").length
        }, Errors: ${
          (data.results || []).filter((r) => r.status === "error").length
        }`
      );
    } catch (err) {
      console.error("BulkUpload send error:", err);
      setError(err.message || "Failed to send bulk emails.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Bulk upload send</h1>
          <p style={styles.subtitle}>
            Like QuickBooks “Import from Excel”: choose a template, download CSV,
            fill it in Excel, then paste values into this table and send.
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
            Bulk upload
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
                  <p style={styles.helperText}>
                    Columns are driven by variables in the template (like{" "}
                    <code>{"{{name}}"}</code>, <code>{"{{amount}}"}</code>).
                    Add or remove variables in the subject/body and columns here
                    will update automatically.
                  </p>
                </div>
                <div style={styles.templateActions}>
                  <button
                    style={styles.buttonGhost}
                    onClick={handleDownloadTemplate}
                  >
                    Download CSV template
                  </button>
                  <button
                    style={styles.buttonGhost}
                    onClick={handleAddRows}
                  >
                    Add rows
                  </button>
                  <button
                    style={{
                      ...styles.buttonPrimary,
                      opacity: sending ? 0.7 : 1,
                    }}
                    disabled={sending}
                    onClick={handleSend}
                  >
                    {sending ? "Sending…" : "Send emails"}
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
                Rows ({rows.length}) – paste from Excel into emails and variable
                cells, like QuickBooks.
              </div>
              <p style={styles.helperText}>
                1) Download CSV template. 2) Open in Excel/Sheets & fill data.
                3) Add enough rows here. 4) Copy cells (e.g. 10×3 block) and
                paste into the first variable cell. 5) Copy email column and
                paste into the first email cell.
              </p>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Receiver email</th>
                      <th style={styles.th}>Subject override (optional)</th>
                      <th style={styles.th}>Sender account</th>
                      {activeVariables.map((v) => (
                        <th style={styles.th} key={v}>
                          {v}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          style={styles.td}
                          colSpan={3 + activeVariables.length}
                        >
                          <span style={styles.mutedText}>
                            No rows yet. Click <strong>Add rows</strong> to
                            create rows, then paste from Excel.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, rowIndex) => (
                        <tr key={row.id}>
                          <td style={styles.td}>
                            <input
                              type="text"
                              style={styles.input}
                              value={row.to}
                              onChange={(e) =>
                                updateRow(row.id, () => ({
                                  to: e.target.value,
                                }))
                              }
                              onPaste={(e) =>
                                handlePasteEmails(e, rowIndex)
                              }
                            />
                          </td>
                          <td style={styles.td}>
                            <input
                              type="text"
                              style={styles.input}
                              value={row.subjectOverride}
                              onChange={(e) =>
                                updateRow(row.id, () => ({
                                  subjectOverride: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td style={styles.td}>
                            <select
                              style={styles.select}
                              value={row.accountId || defaultAccountId}
                              onChange={(e) =>
                                updateRow(row.id, () => ({
                                  accountId: e.target.value,
                                }))
                              }
                            >
                              {accounts.map((acc) => (
                                <option
                                  key={acc.id || acc._id}
                                  value={acc.id || acc._id}
                                >
                                  {acc.fromEmail}
                                </option>
                              ))}
                            </select>
                          </td>

                          {activeVariables.map((v, varIndex) => (
                            <td style={styles.td} key={v}>
                              <input
                                type="text"
                                style={styles.input}
                                value={row.variables[v] ?? ""}
                                onChange={(e) =>
                                  updateRow(row.id, (existing) => ({
                                    variables: {
                                      ...existing.variables,
                                      [v]: e.target.value,
                                    },
                                  }))
                                }
                                onPaste={(e) =>
                                  handlePasteIntoVariable(
                                    e,
                                    rowIndex,
                                    varIndex
                                  )
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
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
  helperText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
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
  input: {
    backgroundColor: "#020617",
    border: "1px solid #374151",
    borderRadius: 6,
    padding: "0.3rem 0.4rem",
    fontSize: "0.8rem",
    color: "#e5e7eb",
    width: "100%",
  },
};
