import { buildPuckEditorConfig } from "../buildPuckEditorConfig";

const serializable = {
  root: { fields: { title: { type: "text" } }, defaultProps: { title: "" } },
  components: {
    ContactLeadForm: {
      label: "Contact",
      fields: {},
      defaultProps: { headline: "Hi" },
      metadata: { blockType: "contact" },
    },
  },
};

describe("buildPuckEditorConfig", () => {
  it("attaches render functions to backend config", () => {
    const config = buildPuckEditorConfig(serializable, "agent");
    expect(typeof config.components.ContactLeadForm.render).toBe("function");
    expect(config.components.ContactLeadForm.label).toBe("Contact");
  });

  it("replaces VoucherOffer voucherId with owner voucher picker", () => {
    const withVoucher = {
      ...serializable,
      components: {
        ...serializable.components,
        VoucherOffer: {
          label: "Voucher",
          fields: { voucherId: { type: "text", label: "Voucher" } },
          defaultProps: { voucherId: "" },
          metadata: { blockType: "voucherOffer" },
        },
      },
    };
    const config = buildPuckEditorConfig(withVoucher, "agent");
    expect(config.components.VoucherOffer.fields.voucherId.type).toBe("custom");
    expect(typeof config.components.VoucherOffer.fields.voucherId.render).toBe("function");
  });
});