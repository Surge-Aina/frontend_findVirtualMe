import {
  BLOCK_TYPE_TO_PUCK_TYPE,
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