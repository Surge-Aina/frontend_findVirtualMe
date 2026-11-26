import { useMemo, useState } from "react";
import axios from "axios";
import { usePortfolioView } from "../../context/PortfolioViewContext";
import { BOOKING_REQUEST_LIMITS, HONEYPOT_FIELD } from "./bookingRequestLimits";
import {
  bookingDateBounds,
  combineLocalDateTimes,
  validateBookingWindow,
} from "./bookingWindow";
import { buildBookingRequestBody } from "./buildBookingRequestBody";

function friendlyError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (status === 429) {
    return { hidden: false, message: "Too many requests. Please try again in a little while." };
  }
  if (status === 404 && data?.code === "FEATURE_COMPONENT_BOOKING_DISABLED") {
    return { hidden: true, message: "" };
  }
  if (status === 400 && data?.message) {
    return { hidden: false, message: data.message };
  }
  return { hidden: false, message: "Something went wrong. Please try again." };
}

export default function BookingRequestForm({
  services = [],
  minNoticeHours,
  daysAheadMax,
  timezone,
  confirmationText,
  sectionId: sectionIdProp,
  editorPreview = false,
}) {
  const ctx = usePortfolioView();
  const portfolioId = ctx?.portfolioId;
  const sectionId = sectionIdProp;

  const serviceOptions = useMemo(
    () =>
      (services || [])
        .map((entry) => (typeof entry === "string" ? entry : entry?.name || ""))
        .map((s) => String(s).trim())
        .filter(Boolean),
    [services]
  );

  const bounds = useMemo(
    () =>
      bookingDateBounds({
        minNoticeHours,
        daysAheadMax,
        timezone,
      }),
    [minNoticeHours, daysAheadMax, timezone]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    service: serviceOptions[0] || "",
    date: bounds.minDate || "",
    startTime: "09:00",
    endTime: "10:00",
    [HONEYPOT_FIELD]: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const zoneLabel = bounds.tz;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (editorPreview) {
      setErrorMessage("Booking requests are disabled in editor preview.");
      return;
    }
    if (!portfolioId || !sectionId) {
      setErrorMessage("This form is not available right now.");
      return;
    }

    const combined = combineLocalDateTimes({
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      timezone: bounds.tz,
    });
    if (!combined.ok) {
      setErrorMessage("Please choose a valid date and time window.");
      return;
    }

    const windowCheck = validateBookingWindow({
      requestedStart: combined.requestedStart,
      requestedEnd: combined.requestedEnd,
      minNoticeHours,
      daysAheadMax,
      timezone: bounds.tz,
    });
    if (!windowCheck.ok) {
      setErrorMessage(windowCheck.message || "Please adjust your requested time.");
      return;
    }

    const body = buildBookingRequestBody({
      portfolioId,
      sectionId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      service: serviceOptions.length ? form.service : "",
      requestedStart: combined.requestedStart,
      requestedEnd: combined.requestedEnd,
      honeypot: form[HONEYPOT_FIELD],
    });

    setSubmitting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_API}/api/booking-requests`, body);
      setSuccessMessage(res.data?.message || confirmationText || "Thanks — your request was sent.");
      setForm((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        message: "",
        service: serviceOptions[0] || "",
        [HONEYPOT_FIELD]: "",
      }));
    } catch (err) {
      const parsed = friendlyError(err);
      if (parsed.hidden) {
        setHidden(true);
        return;
      }
      setErrorMessage(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="booking-request-form" noValidate>
      {successMessage ? (
        <p className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg" role="status">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!successMessage ? (
        <>
          <input
            type="text"
            name={HONEYPOT_FIELD}
            value={form[HONEYPOT_FIELD]}
            onChange={(ev) => setForm({ ...form, [HONEYPOT_FIELD]: ev.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
              <input
                required
                type="text"
                maxLength={BOOKING_REQUEST_LIMITS.name}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(ev) => setForm({ ...form, name: ev.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                required
                type="email"
                maxLength={BOOKING_REQUEST_LIMITS.email}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(ev) => setForm({ ...form, email: ev.target.value })}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Phone (optional)
            <input
              type="tel"
              maxLength={BOOKING_REQUEST_LIMITS.phone}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(ev) => setForm({ ...form, phone: ev.target.value })}
            />
          </label>

          {serviceOptions.length > 0 ? (
            <label className="block text-sm font-medium text-gray-700">
              Service
              <select
                required
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.service}
                onChange={(ev) => setForm({ ...form, service: ev.target.value })}
              >
                {serviceOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
            <legend className="text-sm font-medium text-gray-800 px-1">
              Preferred window <span className="text-gray-500 font-normal">({zoneLabel})</span>
            </legend>
            <p className="text-xs text-gray-500">Times are shown in {zoneLabel}.</p>
            <label className="block text-sm text-gray-700">
              Date
              <input
                required
                type="date"
                min={bounds.minDate || undefined}
                max={bounds.maxDate || undefined}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.date}
                onChange={(ev) => setForm({ ...form, date: ev.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-gray-700">
                Start
                <input
                  required
                  type="time"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={form.startTime}
                  onChange={(ev) => setForm({ ...form, startTime: ev.target.value })}
                />
              </label>
              <label className="block text-sm text-gray-700">
                End
                <input
                  required
                  type="time"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={form.endTime}
                  onChange={(ev) => setForm({ ...form, endTime: ev.target.value })}
                />
              </label>
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-gray-700">
            Message (optional)
            <textarea
              rows={4}
              maxLength={BOOKING_REQUEST_LIMITS.message}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.message}
              onChange={(ev) => setForm({ ...form, message: ev.target.value })}
            />
          </label>

          <button
            type="submit"
            disabled={submitting || editorPreview}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {submitting ? "Sending…" : "Request time"}
          </button>
        </>
      ) : null}
    </form>
  );
}