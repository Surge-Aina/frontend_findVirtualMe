import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioSectionNavigator } from "../PortfolioSectionNavigator";
import { MAX_PORTFOLIO_SECTIONS, SECTION_DISPLAY_LABEL_KEY } from "../portfolioEditorSections";

const sections = [
  { _id: "sec1", type: "hero", order: 0, visible: true, data: {} },
  { _id: "sec2", type: "contact", order: 1, visible: true, data: { [SECTION_DISPLAY_LABEL_KEY]: "Reach us" } },
];

function renderNavigator(overrides = {}) {
  const props = {
    sections,
    activeIdx: 0,
    onActivateSection: jest.fn(),
    handleMoveSection: jest.fn(),
    handleDragReorder: jest.fn(),
    handleSectionVisibilityChange: jest.fn(),
    onRenameSection: jest.fn(),
    onRemoveSection: jest.fn(),
    addableBlocks: [{ type: "services", label: "Services" }],
    addingSectionType: "services",
    setAddingSectionType: jest.fn(),
    handleAddSection: jest.fn(),
    addingSection: false,
    saveDisabled: false,
    ...overrides,
  };
  render(<PortfolioSectionNavigator {...props} />);
  return props;
}

describe("PortfolioSectionNavigator", () => {
  beforeEach(() => {
    window.confirm = jest.fn(() => true);
  });

  it("shows custom display labels and block type hint", () => {
    renderNavigator();
    expect(screen.getByText("Reach us")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText(`2/${MAX_PORTFOLIO_SECTIONS}`)).toBeInTheDocument();
  });

  it("renames a section display label", async () => {
    const user = userEvent.setup();
    const props = renderNavigator();
    await user.click(screen.getByRole("button", { name: /rename hero/i }));
    const input = screen.getByLabelText(/section display label/i);
    await user.clear(input);
    await user.type(input, "Welcome");
    await user.click(screen.getByRole("button", { name: /^ok$/i }));
    expect(props.onRenameSection).toHaveBeenCalledWith("sec1", "Welcome");
  });

  it("disables add section at the cap", () => {
    const capped = Array.from({ length: MAX_PORTFOLIO_SECTIONS }, (_, i) => ({
      _id: `s${i}`,
      type: "hero",
      order: i,
      visible: true,
      data: {},
    }));
    renderNavigator({ sections: capped, addableBlocks: [{ type: "contact", label: "Contact" }] });
    expect(screen.getByRole("button", { name: /add section/i })).toBeDisabled();
    expect(screen.getByText(new RegExp(`maximum of ${MAX_PORTFOLIO_SECTIONS}`))).toBeInTheDocument();
  });

  it("calls remove handler from the navigator", async () => {
    const user = userEvent.setup();
    const props = renderNavigator();
    await user.click(screen.getByRole("button", { name: /remove reach us/i }));
    expect(props.onRemoveSection).toHaveBeenCalledWith("sec2");
  });
});