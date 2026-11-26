import { isEditorNavigatorEnabled } from "../editorNavigatorFlag";

describe("isEditorNavigatorEnabled", () => {
  it("is off when unset", () => {
    expect(isEditorNavigatorEnabled({})).toBe(false);
    expect(isEditorNavigatorEnabled({ VITE_EDITOR_NAVIGATOR_ENABLED: "" })).toBe(false);
  });

  it("is on only when env is true", () => {
    expect(isEditorNavigatorEnabled({ VITE_EDITOR_NAVIGATOR_ENABLED: "true" })).toBe(true);
    expect(isEditorNavigatorEnabled({ VITE_EDITOR_NAVIGATOR_ENABLED: "TRUE" })).toBe(true);
    expect(isEditorNavigatorEnabled({ VITE_EDITOR_NAVIGATOR_ENABLED: "1" })).toBe(false);
  });
});