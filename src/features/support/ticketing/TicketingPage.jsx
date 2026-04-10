import Card from "./components/Card";
import RoadmapColumn from "./components/RoadmapColumn";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5001";

export default function TicketingPage() {
  const [tickets, setTickets] = useState([]);
  const [splitByStatus, setSplitByStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(`${API_BASE}/support-form`, {
          headers: { "Content-Type": "application/json" },
        });
        setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("GET /support-form failed:", e);
        setErr(e?.response?.data?.error || "Failed to fetch tickets");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [API_BASE]);

  // New -> In Progress -> Completed -> In Progress（Reopen）
  const getNextStatus = (s) => {
    if (s === "New") return "In Progress";
    if (s === "In Progress") return "Completed";
    if (s === "Completed") return "In Progress";
    return "In Progress";
  };

  const updateStatus = async (ticketID, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);

    const prev = tickets;
    const optimistic = prev.map((t) =>
      t.ticketID === ticketID
        ? {
            ...t,
            status: nextStatus,
            // from Completed to In Progress，first clear completionTime
            ...(currentStatus === "Completed" && nextStatus === "In Progress"
              ? { completionTime: null }
              : {}),
          }
        : t
    );
    setTickets(optimistic);

    try {
      const { data } = await axios.put(
        `${API_BASE}/support-form/${ticketID}`,
        { status: nextStatus },
        { headers: { "Content-Type": "application/json" } }
      );

      setTickets((curr) =>
        curr.map((t) =>
          t.ticketID === ticketID
            ? {
                ...t,
                status: data?.status ?? nextStatus,
                completionTime:
                  data?.completionTime !== undefined
                    ? data.completionTime
                    : t.completionTime,
              }
            : t
        )
      );
    } catch (e) {
      console.error("PUT /support-form/:ticketID failed:", {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
      });
      
      setTickets(prev);
      alert(e?.response?.data?.error || "Failed to update status");
    }
  };

  
  const deleteTicket = async (ticketID) => {
    const ok = confirm(`Delete ticket ${ticketID}? This cannot be undone.`);
    if (!ok) return;

    const prev = tickets;
    const optimistic = prev.filter((t) => t.ticketID !== ticketID);
    setTickets(optimistic);

    try {
      await axios.delete(`${API_BASE}/support-form/${ticketID}`, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("DELETE /support-form/:ticketID failed:", {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
      });
      setTickets(prev);
      alert(e?.response?.data?.error || "Failed to delete ticket");
    }
  };

  const addReply = async (ticketID, message) => {
    const msg = (message || "").trim();
    if (!msg) return;

    const prev = tickets;
    const optimistic = prev.map((t) =>
      t.ticketID === ticketID
        ? { ...t, replies: [...(t.replies || []), msg] }
        : t
    );
    setTickets(optimistic);

    try {
      const { data } = await axios.post(
        `${API_BASE}/support-form/${ticketID}/replies`,
        { message: msg },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data?.ok) {
        setTickets((curr) =>
          curr.map((t) =>
            t.ticketID === ticketID ? { ...t, replies: data.replies } : t
          )
        );
      }
    } catch (e) {
      console.error("POST /support-form/:ticketID/replies failed:", {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
      });
      setTickets(prev);
      alert(e?.response?.data?.error || "Failed to add reply");
    }
  };

  const columns = useMemo(() => {
    if (!splitByStatus) return [{ title: `All (${tickets.length})`, items: tickets }];

    const groups = {
      New: tickets.filter((t) => t.status === "New"),
      "In Progress": tickets.filter((t) => t.status === "In Progress"),
      Completed: tickets.filter((t) => t.status === "Completed"),
    };
    return ["New", "In Progress", "Completed"].map((k) => ({
      title: `${k} (${groups[k].length})`,
      items: groups[k],
    }));
  }, [splitByStatus, tickets]);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Ticket Board</h1>
        <button
          onClick={() => setSplitByStatus((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          aria-pressed={splitByStatus}
          title={splitByStatus ? "Show All in one column" : "Split into three status columns"}
        >
          {splitByStatus ? "Filter: Off (Show All)" : "Filter: On (Split by Status)"}
        </button>
      </div>

      {loading && <p className="text-slate-600">Loading…</p>}
      {err && <p className="text-rose-600">Error: {err}</p>}

      {!loading && !err && (
        <div
          className={
            splitByStatus
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "grid grid-cols-1 gap-6"
          }
        >
          {columns.map(({ title, items }) => (
            <RoadmapColumn
              key={title}
              title={title}
              items={items}
              renderItem={(ticket) => (
                <Card
                  key={ticket.ticketID}
                  ticket={ticket}
                  onEditStatus={() => updateStatus(ticket.ticketID, ticket.status)}
                  onDelete={() => deleteTicket(ticket.ticketID)}
                  onAddReply={(msg) => addReply(ticket.ticketID, msg)} 
                />
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

