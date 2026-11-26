import { isComponentBookingEnabled } from "../componentBookingFlag";

describe("componentBookingFlag", () => {
  it("is off when unset", () => {
    expect(isComponentBookingEnabled({ VITE_COMPONENT_BOOKING_ENABLED: "" })).toBe(false);
  });

  it("is on only for true", () => {
    expect(isComponentBookingEnabled({ VITE_COMPONENT_BOOKING_ENABLED: "true" })).toBe(true);
    expect(isComponentBookingEnabled({ VITE_COMPONENT_BOOKING_ENABLED: "TRUE" })).toBe(true);
    expect(isComponentBookingEnabled({ VITE_COMPONENT_BOOKING_ENABLED: "1" })).toBe(false);
  });
});