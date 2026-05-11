import { useState } from "react";

export default function Card({
  ticket = {
    ticketID: "T00001",
    requestType: "Title",
    name: "john",
    email: "test@testmail.com",
    createdAt: new Date().toISOString(),
    status: "New",
    priority: "Normal",
    message: "Here are the details!",
    completionTime: null,
    replies: [], 
  },
  onEditStatus,
  onDelete,
  onAddReply,
}) {
  const [open, setOpen] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStatusButtonText = (status) => {
    if (status === "New") return "Start Progress";
    if (status === "In Progress") return "Mark as Completed";
    if (status === "Completed") return "Reopen";
    return "Edit Status";
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    const msg = replyMsg.trim();
    if (!msg || !onAddReply) return;
    try {
      setSubmitting(true);
      await onAddReply(msg);
      setReplyMsg("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative max-w-2xl rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow p-5 md:p-6 text-sm"
      role="article"
      aria-label="Ticket card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-1 font-medium text-slate-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
            Ticket ID : {ticket.ticketID}
          </span>
          <span className="text-slate-900 font-semibold tracking-tight md:ml-2">
            {ticket.requestType}
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={`ticket-details-${ticket.ticketID}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
        >
          <span className="font-medium">
            {open ? "Hide Details" : "Description / Details"}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.174l3.71-3.943a.75.75 0 111.08 1.04l-4.24 4.51a.75.75 0 01-1.08 0l-4.24-4.51a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {open && (
        <div
          id={`ticket-details-${ticket.ticketID}`}
          className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-inner"
        >
          <h4 className="font-medium text-slate-900">Description</h4>
          <p className="mt-1 text-sm leading-5 text-slate-700">{ticket.message}</p>

          <div className="mt-3">
            <h5 className="font-medium text-slate-900 text-sm">Replies</h5>
            {ticket.replies?.length > 0 ? (
              <ul className="mt-2 space-y-1 max-h-32 overflow-auto pr-1 text-sm">
                {ticket.replies.map((r, idx) => (
                  <li
                    key={idx}
                    className="rounded border border-slate-200 bg-white px-2 py-1"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-slate-500 text-xs">No replies yet.</p>
            )}
          </div>

          {ticket.status !== "Completed" && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
              <textarea
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                required
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || !replyMsg.trim()}
                  className="rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2 text-slate-700 flex flex-col items-start">
        <p><strong>Name:</strong> {ticket.name}</p>
        <p><strong>Email:</strong> {ticket.email}</p>
        <p><strong>Created At:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}</p>
        <p><strong>Completion Time:</strong> {ticket.completionTime ? new Date(ticket.completionTime).toLocaleString() : "N/A"}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
            Status: {ticket.status}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
            Priority: {ticket.priority}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onEditStatus}
          className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
        >
          {getStatusButtonText(ticket.status)}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        >
          Delete Ticket
        </button>
      </div>
    </div>
  );
}


