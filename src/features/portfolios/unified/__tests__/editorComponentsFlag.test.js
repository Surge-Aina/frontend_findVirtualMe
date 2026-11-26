import { isEditorComponentsEnabled } from "../editorComponentsFlag";

describe("isEditorComponentsEnabled", () => {
  it("defaults to false when unset", () => {
    expect(isEditorComponentsEnabled({ VITE_EDITOR_COMPONENTS_ENABLED: "" })).toBe(false);
  });

  it("is true only for lowercase true", () => {
    expect(isEditorComponentsEnabled({ VITE_EDITOR_COMPONENTS_ENABLED: "true" })).toBe(true);
    expect(isEditorComponentsEnabled({ VITE_EDITOR_COMPONENTS_ENABLED: "TRUE" })).toBe(true);
    expect(isEditorComponentsEnabled({ VITE_EDITOR_COMPONENTS_ENABLED: "1" })).toBe(false);
  });
});