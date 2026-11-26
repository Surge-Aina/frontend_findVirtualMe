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
});