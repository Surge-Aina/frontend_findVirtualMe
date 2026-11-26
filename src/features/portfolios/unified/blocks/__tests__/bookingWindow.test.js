import { DateTime } from "luxon";
import {
  bookingDateBounds,
  clampDaysAheadMax,
  clampMinNoticeHours,
  combineLocalDateTimes,
  validateBookingWindow,
} from "../booking/bookingWindow";

describe("bookingWindow", () => {
  const fixedNow = DateTime.fromISO("2026-06-01T12:00:00.000Z");

  it("clamps notice and horizon like the backend", () => {
    expect(clampMinNoticeHours(999)).toBe(168);
    expect(clampMinNoticeHours(-1)).toBe(0);
    expect(clampDaysAheadMax(0)).toBe(1);
    expect(clampDaysAheadMax(400)).toBe(365);
  });

  it("computes date bounds in the site timezone", () => {
    const { minDate, maxDate, tz } = bookingDateBounds({
      minNoticeHours: 24,
      daysAheadMax: 7,
      timezone: "America/New_York",
      now: fixedNow,
    });
    expect(tz).toBe("America/New_York");
    expect(minDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(maxDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(maxDate >= minDate).toBe(true);
  });

  it("builds ISO payloads with an explicit offset", () => {
    const combined = combineLocalDateTimes({
      date: "2026-06-10",
      startTime: "09:00",
      endTime: "10:30",
      timezone: "America/New_York",
    });
    expect(combined.ok).toBe(true);
    expect(combined.requestedStart).toMatch(/[+-]\d{2}:\d{2}$/);
    expect(combined.requestedEnd).toMatch(/[+-]\d{2}:\d{2}$/);
  });

  it("rejects windows that violate min notice", () => {
    const combined = combineLocalDateTimes({
      date: fixedNow.plus({ hours: 30 }).setZone("UTC").toISODate(),
      startTime: "10:00",
      endTime: "11:00",
      timezone: "UTC",
    });
    const result = validateBookingWindow({
      requestedStart: combined.requestedStart,
      requestedEnd: combined.requestedEnd,
      minNoticeHours: 48,
      daysAheadMax: 30,
      timezone: "UTC",
      now: fixedNow,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe("booking_window_too_soon");
  });
});