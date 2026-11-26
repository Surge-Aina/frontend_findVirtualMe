import { DateTime } from "luxon";

export function clampMinNoticeHours(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 24;
  return Math.min(168, Math.max(0, Math.round(num)));
}

export function clampDaysAheadMax(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 30;
  return Math.min(365, Math.max(1, Math.round(num)));
}

function resolveZone(timezone) {
  const tz = String(timezone || "America/New_York").trim() || "America/New_York";
  const probe = DateTime.now().setZone(tz);
  return probe.isValid ? tz : "America/New_York";
}

/** Calendar bounds for the date input (site timezone). */
export function bookingDateBounds({ minNoticeHours, daysAheadMax, timezone, now = DateTime.now() }) {
  const tz = resolveZone(timezone);
  const noticeHours = clampMinNoticeHours(minNoticeHours);
  const horizonDays = clampDaysAheadMax(daysAheadMax);
  const earliestInstant = now.plus({ hours: noticeHours });
  const localNow = now.setZone(tz);
  const lastCalendarDay = localNow.startOf("day").plus({ days: horizonDays });
  const minDate = earliestInstant.setZone(tz).toISODate();
  const maxDate = lastCalendarDay.toISODate();
  return { tz, minDate, maxDate, noticeHours, horizonDays, earliestInstant, lastCalendarDay };
}

export function combineLocalDateTimes({ date, startTime, endTime, timezone }) {
  const tz = resolveZone(timezone);
  if (!date || !startTime || !endTime) return { ok: false, reason: "missing" };
  const start = DateTime.fromISO(`${date}T${startTime}`, { zone: tz });
  const end = DateTime.fromISO(`${date}T${endTime}`, { zone: tz });
  if (!start.isValid || !end.isValid) return { ok: false, reason: "invalid" };
  if (end.toMillis() < start.toMillis()) {
    return { ok: false, reason: "end_before_start" };
  }
  return {
    ok: true,
    requestedStart: start.toISO({ suppressMilliseconds: true }),
    requestedEnd: end.toISO({ suppressMilliseconds: true }),
    start,
    end,
    tz,
  };
}

export function validateBookingWindow({
  requestedStart,
  requestedEnd,
  minNoticeHours,
  daysAheadMax,
  timezone,
  now = DateTime.now(),
}) {
  const tz = resolveZone(timezone);
  const noticeHours = clampMinNoticeHours(minNoticeHours);
  const horizonDays = clampDaysAheadMax(daysAheadMax);
  const start = DateTime.fromISO(requestedStart, { setZone: true });
  const end = DateTime.fromISO(requestedEnd, { setZone: true });
  if (!start.isValid || !end.isValid) return { ok: false, code: "validation_error" };
  if (end.toMillis() < start.toMillis()) {
    return { ok: false, code: "validation_error", message: "End time must be on or after start time." };
  }
  const earliest = now.plus({ hours: noticeHours });
  if (start.toMillis() < earliest.toMillis()) {
    return { ok: false, code: "booking_window_too_soon", message: "Requested time is too soon." };
  }
  const localNow = now.setZone(tz);
  const lastCalendarDay = localNow.startOf("day").plus({ days: horizonDays });
  const startLocalDay = start.setZone(tz).startOf("day");
  if (startLocalDay.toMillis() > lastCalendarDay.toMillis()) {
    return { ok: false, code: "booking_window_too_far", message: "Requested time is too far in the future." };
  }
  return { ok: true };
}