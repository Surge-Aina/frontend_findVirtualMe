import { HONEYPOT_FIELD } from "./bookingRequestLimits";

/**
 * Shape for POST /api/booking-requests (public booking form).
 */
export function buildBookingRequestBody({
  portfolioId,
  sectionId,
  name,
  email,
  phone,
  message,
  service,
  requestedStart,
  requestedEnd,
  honeypot = "",
}) {
  return {
    portfolioId,
    sectionId,
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    phone: phone === undefined || phone === null ? "" : String(phone).trim(),
    message: message === undefined || message === null ? "" : String(message).trim(),
    service: service === undefined || service === null ? "" : String(service).trim(),
    requestedStart,
    requestedEnd,
    [HONEYPOT_FIELD]: honeypot,
  };
}