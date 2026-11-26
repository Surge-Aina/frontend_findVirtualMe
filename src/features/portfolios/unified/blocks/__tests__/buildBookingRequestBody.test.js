import { buildBookingRequestBody } from "../booking/buildBookingRequestBody";
import { HONEYPOT_FIELD } from "../booking/bookingRequestLimits";

describe("buildBookingRequestBody", () => {
  it("matches the public booking POST shape", () => {
    const body = buildBookingRequestBody({
      portfolioId: "507f1f77bcf86cd799439011",
      sectionId: "507f1f77bcf86cd799439012",
      name: "Alex Example",
      email: "alex@example.test",
      phone: "555-0100",
      message: "Morning preferred.",
      service: "Consultation",
      requestedStart: "2026-06-10T09:00:00-04:00",
      requestedEnd: "2026-06-10T10:00:00-04:00",
    });

    expect(body).toEqual({
      portfolioId: "507f1f77bcf86cd799439011",
      sectionId: "507f1f77bcf86cd799439012",
      name: "Alex Example",
      email: "alex@example.test",
      phone: "555-0100",
      message: "Morning preferred.",
      service: "Consultation",
      requestedStart: "2026-06-10T09:00:00-04:00",
      requestedEnd: "2026-06-10T10:00:00-04:00",
      [HONEYPOT_FIELD]: "",
    });
  });
});