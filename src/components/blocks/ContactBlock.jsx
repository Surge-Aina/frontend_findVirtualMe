import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from "react-icons/fa";
import { usePortfolioView } from "../../context/PortfolioViewContext";

function HealthcareContact(data) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {data.phone && (
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-4"><FaPhone className="text-blue-600" /></div>
                <div><p className="font-medium text-gray-900">Phone</p><p className="text-gray-600">{data.phone}</p></div>
              </div>
            )}
            {data.whatsapp && (
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-full p-4"><FaWhatsapp className="text-green-600" /></div>
                <div><p className="font-medium text-gray-900">WhatsApp</p><p className="text-gray-600">{data.whatsapp}</p></div>
              </div>
            )}
            {data.email && (
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-4"><FaEnvelope className="text-blue-600" /></div>
                <div><p className="font-medium text-gray-900">Email</p><p className="text-gray-600">{data.email}</p></div>
              </div>
            )}
            {data.address && (data.address.street || data.address.city) && (
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-4"><FaMapMarkerAlt className="text-blue-600" /></div>
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">
                    {[data.address.street, data.address.city, data.address.state, data.address.zip].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">Message sent successfully!</div>
            ) : (
              <>
                <input
                  placeholder="Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  {data.submitText || "Send Message"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function HandymanContact(data) {
  const ctx = usePortfolioView();
  const portfolioId = ctx?.portfolioId;
  const serviceOptions = ctx?.servicesItems || [];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    selectedServiceTitles: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleService = (title) => {
    setForm((prev) => {
      const cur = prev.selectedServiceTitles || [];
      const next = cur.includes(title) ? cur.filter((t) => t !== title) : [...cur, title];
      return { ...prev, selectedServiceTitles: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioId) {
      toast.error("Portfolio not loaded; cannot send inquiry.");
      return;
    }
    if (!form.message?.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/handyman/inquiries`, {
        portfolioId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        selectedServiceTitles: form.selectedServiceTitles || [],
      });
      toast.success("Message sent! We will get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "", selectedServiceTitles: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{data.title || "Contact Us"}</h2>
            {data.subtitle && <p className="text-gray-600">{data.subtitle}</p>}
            {data.phone && (
              <div className="flex items-center gap-3">
                <FaPhone className="text-amber-500" /> <span className="text-gray-700">{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-amber-500" /> <span className="text-gray-700">{data.email}</span>
              </div>
            )}
            {data.hours && (
              <div className="flex items-center gap-3">
                <FaClock className="text-amber-500" /> <span className="text-gray-700">{data.hours}</span>
              </div>
            )}
            {data.note && <p className="text-sm text-gray-500 italic">{data.note}</p>}
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.formTitle || "Send us a message"}</h3>
            <input
                  placeholder="Name *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Email *"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  placeholder="Phone *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {serviceOptions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Services (optional)</p>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((opt, i) => {
                        const title = opt.title || opt.name || `Service ${i + 1}`;
                        const checked = form.selectedServiceTitles.includes(title);
                        return (
                          <label key={title} className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(title)}
                            />
                            {title}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <textarea
                  placeholder="Message *"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ProjectManagerContact({ template = "projectManager", ...data }) {
  const ctx = usePortfolioView();
  const portfolioId = ctx?.portfolioId;
  const hasAny = data.email || data.phone || data.location;
  const isDS = template === "dataScientist";
  const isAgent = template === "agent";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioId) {
      toast.error("Portfolio not loaded.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/portfolio/contact`, {
        name,
        email,
        message,
        portfolioId,
      });
      setFeedback({ type: "ok", text: "Your message has been sent successfully!" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setFeedback({
        type: "err",
        text: err.response?.data?.message || "Failed to send message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`py-12 ${isDS ? "bg-transparent" : isAgent ? "" : ""}`}>
      <div
        className={`max-w-2xl mx-auto px-4 text-center space-y-6 ${isDS ? "ds-contact-shell ds-panel p-6 md:p-8" : isAgent ? "agent-panel rounded-[1.75rem] p-6 md:p-8" : ""}`}
      >
        {isDS ? (
          <h2 className="ds-section-heading font-mono text-left">mail — compose</h2>
        ) : isAgent ? (
          <h2 className="text-2xl md:text-3xl font-bold text-left text-[color:var(--agent-text)]">Let&apos;s connect</h2>
        ) : (
          <h2 className="text-2xl font-bold text-white">Get In Touch</h2>
        )}
        {!hasAny && (
          <p
            className={
              isDS
                ? "text-[var(--ds-dim)] italic text-sm border border-dashed border-[var(--ds-border)] rounded-lg px-3 py-2 text-left font-mono"
                : isAgent
                  ? "text-[color:var(--agent-muted)] italic text-sm border border-dashed border-[color:var(--agent-border)] rounded-xl px-3 py-2 text-left"
                : "text-slate-500 italic text-sm border border-dashed border-white/15 rounded-lg px-3 py-2"
            }
          >
            Add email, phone, or location in the summary or contact section via <strong className={isAgent ? "text-[color:var(--agent-text)]" : "text-slate-300"}>Edit</strong>.
          </p>
        )}
        <div className={`flex flex-wrap gap-6 justify-center ${isDS ? "text-[var(--ds-text-muted)] font-mono text-sm" : isAgent ? "text-[color:var(--agent-text)] text-sm" : "text-slate-300"}`}>
          {(data.email || !hasAny) && (
            <a
              href={data.email ? `mailto:${data.email}` : undefined}
              className={`flex items-center gap-2 transition-colors ${data.email ? (isAgent ? "hover:opacity-80" : "hover:text-blue-400") : isAgent ? "text-[color:var(--agent-muted)] italic pointer-events-none" : "text-slate-500 italic pointer-events-none"}`}
            >
              <FaEnvelope /> {data.email || "you@email.com"}
            </a>
          )}
          {(data.phone || !hasAny) && (
            <a
              href={data.phone ? `tel:${data.phone}` : undefined}
              className={`flex items-center gap-2 transition-colors ${data.phone ? (isAgent ? "hover:opacity-80" : "hover:text-blue-400") : isAgent ? "text-[color:var(--agent-muted)] italic pointer-events-none" : "text-slate-500 italic pointer-events-none"}`}
            >
              <FaPhone /> {data.phone || "+1 (555) 000-0000"}
            </a>
          )}
          {(data.location || !hasAny) && (
            <span className={`flex items-center gap-2 ${data.location ? "" : isAgent ? "text-[color:var(--agent-muted)] italic" : "text-slate-500 italic"}`}>
              <FaMapMarkerAlt /> {data.location || "City, Country"}
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`text-left max-w-lg mx-auto space-y-3 pt-4 ${isAgent ? "border-t border-[color:var(--agent-border)]" : "border-t border-white/10"}`}
        >
          <div>
            <label className={`block text-sm mb-1 ${isDS ? "text-[var(--ds-dim)] font-mono" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>Name</label>
            <input
              required
              className={`w-full px-4 py-2 rounded-lg border placeholder-slate-500 ${
                isDS ? "ds-contact-input bg-black/35 border-[var(--ds-border)] rounded-md font-mono text-sm text-white" : isAgent ? "bg-white/5 border-[color:var(--agent-border)] text-[color:var(--agent-text)]" : "bg-slate-800 border-white/20 rounded-lg text-white"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDS ? "text-[var(--ds-dim)] font-mono" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>Email</label>
            <input
              required
              type="email"
              className={`w-full px-4 py-2 rounded-lg border placeholder-slate-500 ${
                isDS ? "ds-contact-input bg-black/35 border-[var(--ds-border)] rounded-md font-mono text-sm text-white" : isAgent ? "bg-white/5 border-[color:var(--agent-border)] text-[color:var(--agent-text)]" : "bg-slate-800 border-white/20 rounded-lg text-white"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDS ? "text-[var(--ds-dim)] font-mono" : isAgent ? "text-[color:var(--agent-muted)]" : "text-slate-400"}`}>Message</label>
            <textarea
              required
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border placeholder-slate-500 ${
                isDS ? "ds-contact-input bg-black/35 border-[var(--ds-border)] rounded-md font-mono text-sm text-white" : isAgent ? "bg-white/5 border-[color:var(--agent-border)] text-[color:var(--agent-text)]" : "bg-slate-800 border-white/20 rounded-lg text-white"
              }`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
            />
          </div>
          {feedback && (
            <p className={feedback.type === "ok" ? "text-green-400 text-sm font-mono" : "text-red-400 text-sm font-mono"}>
              {feedback.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium disabled:opacity-60 ${
              isDS ? "ds-contact-btn rounded-md font-mono text-sm text-white" : isAgent ? "text-slate-950" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            style={isAgent ? { backgroundColor: "var(--agent-accent)" } : undefined}
          >
            {loading ? "Sending…" : isDS ? "sendmail" : isAgent ? "Send inquiry" : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function ContactBlock({ template, ...data }) {
  switch (template) {
    case "handyman":
      return <HandymanContact {...data} />;
    case "projectManager":
      return <ProjectManagerContact template="projectManager" {...data} />;
    case "dataScientist":
      return <ProjectManagerContact template="dataScientist" {...data} />;
    case "agent":
      return <ProjectManagerContact template="agent" {...data} />;
    case "healthcare":
    default:
      return <HealthcareContact {...data} />;
  }
}
