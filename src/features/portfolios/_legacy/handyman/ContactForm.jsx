import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ContactForm.css";
import handymanAPI from "./api";

// Lightweight inline MultiSelect (checkbox dropdown)
function ServicesMultiSelect({ options = [], value = [], onChange, label = "Service(s)" }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = () => setOpen((s) => !s);

  const handleCheck = (title, checked) => {
    if (checked) onChange([...(value || []), title]);
    else onChange((value || []).filter((t) => t !== title));
  };

  const summary = (() => {
    if (!value || value.length === 0) return "Select services";
    if (value.length <= 2) return value.join(", ");
    return `${value.slice(0, 2).join(", ")} +${value.length - 2} more`;
  })();

  return (
    <div className="field field-span-2" ref={boxRef}>
      <label className="block-label">{label}</label>

      <button
        type="button"
        className={`ms-trigger ${open ? "open" : ""}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`ms-placeholder ${value?.length ? "has-value" : ""}`}>{summary}</span>
        <span className="ms-caret">▾</span>
      </button>

      {open && (
        <div className="ms-menu" role="listbox" aria-multiselectable="true">
          <div className="ms-search-wrap">
            <div className="ms-hint">Pick one or more</div>
          </div>
          <ul className="ms-list">
            {options.map((opt, i) => {
              const title = opt.title || opt.name || `Service ${i + 1}`;
              const id = `ms-${i}-${title.replace(/\s+/g, "-").toLowerCase()}`;
              const checked = (value || []).includes(title);
              return (
                <li key={id} className="ms-item">
                  <label htmlFor={id} className="ms-row">
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleCheck(title, e.target.checked)}
                    />
                    <span className="ms-text">{title}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// Reads from a single `contact` prop; also accepts `services` list
const ContactForm = ({ contact = {}, templateId, services = [] }) => {
  const {
    title = "Get Your Free Estimate",
    subtitle = "Ready to get started? Contact us today for a free, no-obligation estimate. We respond to all inquiries within 24 hours.",
    formTitle = "Ready to get started? Send us a message!",
    phone = "(112) 233-4455",
    email = "contact@prohandy.com",
    hours = "Mon–Fri: 7AM–7PM",
    note = "Weekend & emergency calls available",
  } = contact;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    selectedServiceTitles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Treat missing templateId (on Showcase) as demo mode
  const isDemo = !templateId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicesChange = (titlesArray) => {
    setFormData((prev) => ({ ...prev, selectedServiceTitles: titlesArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemo) return; // ✅ block submit on Showcase
    setIsSubmitting(true);

    try {
      await handymanAPI.post("/api/handyman/inquiries", {
        ...formData, // includes selectedServiceTitles: [...]
        templateId,
      });
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
        selectedServiceTitles: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* <ToastContainer position="bottom-center" /> */}
      <section id="contact" className="contact-section">
        <h2>{title}</h2>
        <p className="contact-subtitle">{subtitle}</p>

        <div className="contact-wrap">
          <div className="contact-card">
            <h3 className="card-title">{formTitle}</h3>

            <form onSubmit={handleSubmit} className="contact-form-grid">
              <div className="field">
                <label htmlFor="name">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isDemo}
                />
              </div>

              <div className="field">
                <label htmlFor="phone">
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isDemo}
                />
              </div>

              <div className="field field-span-2">
                <label htmlFor="email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isDemo}
                />
              </div>

              <ServicesMultiSelect
                options={services}
                value={formData.selectedServiceTitles}
                onChange={handleServicesChange}
                label="Service(s)"
              />

              <div className="field field-span-2">
                <label htmlFor="message">
                  Message <span className="req">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Please describe your project or repair needs..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isDemo}
                />
              </div>

              <div className="field field-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isDemo}
                  className="contact-submit"
                  title={isDemo ? "Demo preview only on Showcase page" : undefined}
                >
                  {isDemo ? "Request Free Estimate" : isSubmitting ? "Sending…" : "Request Free Estimate"}
                </button>
              </div>
            </form>
          </div>

          {/* Right info card */}
          <aside className="info-card">
            <h3 className="info-title">Contact Information</h3>

            <div className="info-row">
              <div className="info-icn">📞</div>
              <div>
                <div className="info-label">Phone</div>
                <div className="info-main">{phone}</div>
                <div className="info-sub">24/7 Emergency Service</div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icn">✉️</div>
              <div>
                <div className="info-label">Email</div>
                <div className="info-main">{email}</div>
                <div className="info-sub">We respond within 2 hours</div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icn">⏰</div>
              <div>
                <div className="info-label">Hours</div>
                <div className="info-main">{hours}</div>
                <div className="info-sub">{note}</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default ContactForm;
