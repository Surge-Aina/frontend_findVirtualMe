import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { logApiError } from "@/shared/api/safeLog";
import { resolveBackendApi } from "@/config/backendApi";
import { SUPPORT_EMAIL } from "@/config/siteContact";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await axios.post(`${resolveBackendApi()}/api/contact`, {
        ...form,
        subject: "FindVirtual.me contact form",
      });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      logApiError(err, "Platform contact form");
      const offline =
        !err?.response ||
        err?.code === "ERR_NETWORK" ||
        (err?.response?.status >= 500);
      if (offline) {
        setError("offline");
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "We could not send your message. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoHref = `mailto:${encodeURIComponent(SUPPORT_EMAIL)}?subject=${encodeURIComponent(
    "FindVirtual.me inquiry"
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 px-4 pb-16">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Contact us</h1>
        <p className="text-slate-600 text-sm mb-6">
          Questions about FindVirtual.me? Send a message and we will get back to you.
        </p>

        {sent && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Thanks — your message was sent.
          </p>
        )}

        {error === "offline" && (
          <div
            role="alert"
            className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-2"
          >
            <p>
              Our message service is temporarily unavailable. You can reach us by email instead.
            </p>
            <a className="text-blue-700 font-medium underline" href={mailtoHref}>
              Email {SUPPORT_EMAIL}
            </a>
          </div>
        )}

        {error && error !== "offline" && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send message"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Prefer email?{" "}
          <a className="text-blue-700 underline" href={mailtoHref}>
            {SUPPORT_EMAIL}
          </a>
          {" · "}
          <Link to="/support" className="text-blue-700 underline">
            Support requests
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
    </div>
  );
}