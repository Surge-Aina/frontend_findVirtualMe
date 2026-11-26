import {
  BLOCK_TYPE_TO_PUCK_TYPE,
  puckPropsToSectionData,
  puckTypeForBlockType,
  sectionToPuckComponentData,
} from "../puckBlockTypeMap";

describe("puckBlockTypeMap", () => {
  it("maps feature block types to Puck component types", () => {
    expect(puckTypeForBlockType("contact")).toBe("ContactLeadForm");
    expect(BLOCK_TYPE_TO_PUCK_TYPE.gallery).toBe("Gallery");
  });

  it("strips id from puck props for section persistence", () => {
    expect(puckPropsToSectionData({ id: "abc", headline: "Hi" })).toEqual({ headline: "Hi" });
  });

  it("builds component data from a portfolio section", () => {
    const item = sectionToPuckComponentData({
      _id: "sec1",
      type: "services",
      data: { title: "Offers" },
    });
    expect(item).toEqual({
      type: "Services",
      props: { id: "sec1", title: "Offers" },
    });
  });
});