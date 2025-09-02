// client/src/pages/cleanCharges.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Charges = () => {
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quote form (customer)
  const [selectedServices, setSelectedServices] = useState([]);
  const [details, setDetails] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });

  // Estimate banner (from Services page)
  const [quoteEstimate, setQuoteEstimate] = useState(null);
  const [quoteBreakdown, setQuoteBreakdown] = useState([]);

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const token = localStorage.getItem('token');
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const load = async () => {
      try {
        const svc = await axios.get('http://localhost:5000/services');
        setServices(svc.data);

        if (isAdmin) {
          const q = await axios.get('http://localhost:5000/quotes', authHeaders);
          setQuotes(q.data);
        }
      } catch (err) {
        toast.error('Failed to load data');
      }
    };

    // Load estimate draft from localStorage (saved by Services page)
    try {
      const raw = localStorage.getItem('quoteDraft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && typeof draft.total === 'number') {
          setQuoteEstimate(draft.total);
          setQuoteBreakdown(Array.isArray(draft.breakdown) ? draft.breakdown : []);
        }
      }
    } catch {
      // ignore JSON errors
    }

    load();
  }, [isAdmin]);

  // ===== Admin: update price =====
  const savePrice = async (id, newPrice) => {
    try {
      await axios.put(`http://localhost:5000/services/${id}`, { price: newPrice }, authHeaders);
      toast.success('Price updated');
      const svc = await axios.get('http://localhost:5000/services');
      setServices(svc.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update price');
    }
  };

  // ===== Admin: update quote status =====
  const updateStatus = async (quoteId, status) => {
    try {
      await axios.patch(`http://localhost:5000/quotes/${quoteId}/status`, { status }, authHeaders);
      toast.success('Status updated');
      const q = await axios.get('http://localhost:5000/quotes', authHeaders);
      setQuotes(q.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  // ===== Customer: submit quote =====
  const toggleServiceSelection = (title) => {
    setSelectedServices((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    if (!selectedServices.length) return toast.error('Select at least one service');
    if (!contact.name || !contact.email || !contact.phone || !dueDate)
      return toast.error('Please fill all required fields');

    try {
      setLoading(true);

      // If we have an estimate, prepend it to details so the admin sees it
      const detailsWithEstimate = quoteEstimate
        ? `Estimated Price: $${quoteEstimate}. ${details || ''}`.trim()
        : details;

      await axios.post('http://localhost:5000/quotes', {
        services: selectedServices,
        details: detailsWithEstimate,
        dueDate,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });

      toast.success('Quote request submitted!');

      // Reset form + clear client-side draft
      setSelectedServices([]);
      setDetails('');
      setDueDate('');
      setContact({ name: '', email: '', phone: '' });
      setQuoteEstimate(null);
      setQuoteBreakdown([]);
      localStorage.removeItem('quoteDraft');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit quote');
    } finally {
      setLoading(false);
    }
  };

  const clearEstimate = () => {
    setQuoteEstimate(null);
    setQuoteBreakdown([]);
    localStorage.removeItem('quoteDraft');
  };

  return (
    <div className="charges-container">
      {/* LEFT COLUMN: services/prices */}
      <section className="charges-left card">
        <div className="header-row">
          <h2>Service Charges</h2>
          {isAdmin && <span className="admin-chip">👑 Admin Mode</span>}
        </div>

        <ul className="charges-list">
          {services.map((s) => (
            <li key={s._id} className="charge-item">
              <div className="charge-title">{s.title}</div>
              {!isAdmin ? (
                <div className="charge-price">
                  {s.price ? `$${s.price}` : <em>Contact for quote</em>}
                </div>
              ) : (
                <PriceEditor initial={s.price || ''} onSave={(p) => savePrice(s._id, p)} />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* RIGHT COLUMN: admin requests OR customer form */}
      <section className="charges-right card">
        {!isAdmin ? (
          <>
            <div className="header-row">
              <h3>Request a Quote</h3>
              <span className="helper-text">Tell us what you need and we’ll get back to you.</span>
            </div>

            {/* Rough estimate banner (from Services page) */}
            {quoteEstimate !== null && (
              <div className="quote-banner">
                <div className="quote-banner-main">
                  <strong>Rough estimate:</strong> ${quoteEstimate}
                </div>
                {quoteBreakdown.length > 0 && (
                  <ul className="quote-breakdown">
                    {quoteBreakdown.map((b, i) => (
                      <li key={i}>
                        {b.type} × {b.count} @ ${b.unitPrice} = ${b.subtotal}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="btn sm" onClick={clearEstimate}>Clear</button>
              </div>
            )}

            <form className="quote-form cardlike" onSubmit={submitQuote}>
              {/* Choose Services */}
              <div className="form-group">
                <label className="form-label">Choose Services</label>
                <div className="services-checkboxes">
                  {services.map((s) => (
                    <label key={s._id} className="chip-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.title)}
                        onChange={() => toggleServiceSelection(s.title)}
                      />
                      <span>{s.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name / Due Date */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    className="form-input"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email / Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Extra Details */}
              <div className="form-group">
                <label className="form-label">Extra Details</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us anything useful about the job..."
                />
              </div>

              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h3>Quote Requests</h3>
            {quotes.length === 0 ? (
              <p>No requests yet.</p>
            ) : (
              <ul className="quotes-list">
                {quotes.map((q) => (
                  <li key={q._id} className="quote-item">
                    <div className="quote-row">
                      <div className="quote-services">
                        <strong>Services:</strong> {q.services.join(', ')}
                      </div>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="quote-meta">
                      <span><strong>Due:</strong> {new Date(q.dueDate).toLocaleDateString()}</span>
                      <span><strong>Name:</strong> {q.name}</span>
                      <span><strong>Email:</strong> {q.email}</span>
                      <span><strong>Phone:</strong> {q.phone}</span>
                    </div>
                    {q.details && <p className="quote-notes">{q.details}</p>}

                    <div className="quote-actions">
                      <button className="btn" onClick={() => updateStatus(q._id, 'in_progress')}>In Progress</button>
                      <button className="btn success" onClick={() => updateStatus(q._id, 'completed')}>Complete</button>
                      <button className="btn danger" onClick={() => updateStatus(q._id, 'rejected')}>Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
};

// ===== Subcomponents =====
const PriceEditor = ({ initial, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initial);

  return (
    <div className="price-editor">
      {!editing ? (
        <>
          <span className="charge-price">
            {val ? `$${val}` : <em>Not Set</em>}
          </span>
          <button className="btn sm" onClick={() => setEditing(true)}>Edit</button>
        </>
      ) : (
        <div className="price-edit-form">
          <input
            className="form-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="e.g. 45"
          />
          <div className="price-edit-buttons">
            <button
              className="btn sm primary"
              onClick={() => {
                onSave(val);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button className="btn sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    new: { text: 'New', cls: 'badge' },
    in_progress: { text: 'In Progress', cls: 'badge warn' },
    completed: { text: 'Completed', cls: 'badge ok' },
    rejected: { text: 'Rejected', cls: 'badge danger' },
  };
  const s = map[status] || map.new;
  return <span className={s.cls}>{s.text}</span>;
};

export default Charges;
