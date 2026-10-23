import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioEditorContext } from "../context/PortfolioEditorContext";
import {
  FieldEditor,
  HeroDestinationSelect,
  HeroEditor,
  ContactEditor,
  JsonEditor,
} from "../PortfolioEditorFields";

jest.mock("@/shared/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", setTheme: () => {}, toggleTheme: () => {} }),
}));

jest.mock("@monaco-editor/react", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockMonacoEditor({ value, onChange, onMount }) {
      const blurRef = React.useRef(null);
      React.useEffect(() => {
        if (onMount) {
          onMount({
            onDidBlurEditorText: (cb) => {
              blurRef.current = cb;
            },
          });
        }
      }, [onMount]);
      return (
        <textarea
          data-testid="json-monaco"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => blurRef.current?.()}
        />
      );
    },
  };
});

jest.mock("../ImageFieldEditor", () => ({
  ImageFieldEditor: ({ label, value, onChange }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`img-${label}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

describe("FieldEditor", () => {
  it("renders text input and propagates changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <FieldEditor label="Name" value="A" onChange={onChange} />
    );
    const input = screen.getByDisplayValue("A");
    await user.clear(input);
    await user.type(input, "B");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders textarea when type is textarea", () => {
    render(
      <FieldEditor
        label="Bio"
        value="x"
        onChange={jest.fn()}
        type="textarea"
      />
    );
    expect(screen.getByDisplayValue("x")).toBeInTheDocument();
  });
});

describe("JsonEditor", () => {
  it("calls onChange with parsed JSON after blur when valid", () => {
    const onChange = jest.fn();
    render(<JsonEditor data={{ count: 1 }} onChange={onChange} />);
    const ta = screen.getByTestId("json-monaco");
    fireEvent.change(ta, { target: { value: '{"count":2}' } });
    fireEvent.blur(ta);
    expect(onChange).toHaveBeenCalledWith({ count: 2 });
  });

  it("shows invalid JSON message on blur when parse fails", () => {
    render(<JsonEditor data={{ ok: true }} onChange={jest.fn()} />);
    const ta = screen.getByTestId("json-monaco");
    fireEvent.change(ta, { target: { value: "{not-json" } });
    fireEvent.blur(ta);
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
  });
});

describe("HeroDestinationSelect", () => {
  it("applies a section hash when chosen from the preset list", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <HeroDestinationSelect
        label="CTA"
        value="https://example.com"
        onChange={onChange}
        defaultAnchor="#contact"
      />
    );
    await user.selectOptions(screen.getByRole("combobox"), "#services");
    expect(onChange).toHaveBeenCalledWith("#services");
  });

  it("shows custom URL input when value is not a preset hash", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <HeroDestinationSelect
        label="Primary CTA"
        value="https://example.com"
        onChange={onChange}
        defaultAnchor="#contact"
      />
    );
    expect(
      screen.getByLabelText(/primary cta \(custom\)/i)
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/primary cta \(custom\)/i));
    await user.type(
      screen.getByLabelText(/primary cta \(custom\)/i),
      "https://x.com"
    );
    expect(onChange).toHaveBeenCalled();
  });
});

describe("HeroEditor", () => {
  it("renders healthcare practice fields", () => {
    render(
      <PortfolioEditorContext.Provider value={{ portfolioId: "p1" }}>
        <HeroEditor
          template="healthcare"
          data={{ practiceName: "Clinic", tagline: "Care" }}
          onChange={jest.fn()}
          portfolioSections={[]}
        />
      </PortfolioEditorContext.Provider>
    );
    expect(screen.getByDisplayValue("Clinic")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Care")).toBeInTheDocument();
  });

  it("renders handyman-specific fields", () => {
    const onChange = jest.fn();
    render(
      <PortfolioEditorContext.Provider value={{ portfolioId: "p1" }}>
        <HeroEditor
          template="handyman"
          data={{ title: "FixCo" }}
          onChange={onChange}
          portfolioSections={[]}
        />
      </PortfolioEditorContext.Provider>
    );
    expect(screen.getByDisplayValue("FixCo")).toBeInTheDocument();
  });

  it("renders agent hero buttons section", () => {
    const onChange = jest.fn();
    render(
      <PortfolioEditorContext.Provider value={{ portfolioId: "p1" }}>
        <HeroEditor
          template="agent"
          data={{ name: "N", title: "T" }}
          onChange={onChange}
          portfolioSections={[{ type: "contact", visible: true }]}
        />
      </PortfolioEditorContext.Provider>
    );
    expect(screen.getByText(/hero buttons/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("N")).toBeInTheDocument();
  });
});

describe("ContactEditor", () => {
  it("renders location for dataScientist template", () => {
    render(
      <ContactEditor
        template="dataScientist"
        data={{ email: "a@b.com", location: "Remote" }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue("Remote")).toBeInTheDocument();
  });

  it("renders healthcare-only fields for healthcare template", () => {
    const onChange = jest.fn();
    render(
      <ContactEditor
        template="healthcare"
        data={{ email: "a@b.com", address: { street: "1 Main" } }}
        onChange={onChange}
      />
    );
    expect(screen.getByDisplayValue("a@b.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1 Main")).toBeInTheDocument();
  });

  it("renders handyman contact fields", () => {
    render(
      <ContactEditor
        template="handyman"
        data={{ title: "Reach us" }}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByDisplayValue("Reach us")).toBeInTheDocument();
  });
});
