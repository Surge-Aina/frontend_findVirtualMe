import {
  BLOCK_TYPE_TO_PUCK_TYPE,
  isFeatureSectionBlockType,
  puckTypeForBlockType,
  sectionToPuckComponentData,
} from "../puckBlockTypeMap";

describe("puckBlockTypeMap", () => {
  it("maps feature block types to Puck component types", () => {
    expect(puckTypeForBlockType("contact")).toBe("ContactLeadForm");
    expect(BLOCK_TYPE_TO_PUCK_TYPE.gallery).toBe("Gallery");
    expect(puckTypeForBlockType("socialLinks")).toBe("SocialLinks");
    expect(puckTypeForBlockType("qrCode")).toBe("QrCode");
    expect(puckTypeForBlockType("voucherOffer")).toBe("VoucherOffer");
    expect(puckTypeForBlockType("bookingRequest")).toBe("BookingRequest");
  });

  it("treats bookingRequest as a feature section only when booking flag is on", () => {
    const prev = import.meta.env.VITE_COMPONENT_BOOKING_ENABLED;
    import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = "";
    expect(isFeatureSectionBlockType("bookingRequest")).toBe(false);
    import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = "true";
    expect(isFeatureSectionBlockType("bookingRequest")).toBe(true);
    import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = prev;
  });

  it("builds puck component data via adapters", () => {
    const item = sectionToPuckComponentData(
      {
        _id: "sec1",
        type: "testimonials",
        data: { sectionTitle: "Raves", items: [{ name: "A", quote: "Q" }] },
      },
      "agent"
    );
    expect(item).toEqual({
      type: "Testimonials",
      props: {
        id: "sec1",
        title: "Raves",
        items: [{ author: "A", quote: "Q", rating: 5 }],
      },
    });
  });
});