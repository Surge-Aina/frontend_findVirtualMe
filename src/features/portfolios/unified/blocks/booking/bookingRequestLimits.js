/** Mirrors backend bookingRequest.validation LIMITS. */
export const BOOKING_REQUEST_LIMITS = Object.freeze({
  name: 120,
  email: 254,
  phone: 32,
  message: 2000,
  service: 80,
});

export const HONEYPOT_FIELD = "_hp";