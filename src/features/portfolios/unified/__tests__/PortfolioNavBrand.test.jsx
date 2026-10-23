import React from "react";
import { render, screen } from "@testing-library/react";
import {
  DEFAULT_NAV_BRAND_ICON_KEY,
  mergeNavBrandDefaults,
  NavBrandIconPreview,
  PortfolioNavBrandMark,
} from "../PortfolioNavBrand";

describe("mergeNavBrandDefaults", () => {
  it("returns base defaults when navBrand missing", () => {
    const m = mergeNavBrandDefaults(null);
    expect(m.mode).toBe("none");
    expect(m.iconKey).toBe(DEFAULT_NAV_BRAND_ICON_KEY);
  });

  it("normalizes icon mode and trims iconKey", () => {
    const m = mergeNavBrandDefaults({ mode: "icon", iconKey: "  FaRocket  " });
    expect(m.mode).toBe("icon");
    expect(m.iconKey).toBe("FaRocket");
  });

  it("clamps initials and supports initials mode", () => {
    const m = mergeNavBrandDefaults({
      mode: "initials",
      initialsText: "ABCD",
      initialsFill: "color",
      initialsBgColor: "#ff0000",
    });
    expect(m.initialsText).toBe("AB");
    expect(m.initialsFill).toBe("color");
  });
});

describe("NavBrandIconPreview", () => {
  it("renders svg for known icon key", () => {
    const { container } = render(<NavBrandIconPreview iconKey="FaRocket" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("falls back to default icon for unknown key", () => {
    const { container } = render(<NavBrandIconPreview iconKey="UnknownIcon" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("PortfolioNavBrandMark", () => {
  it("returns null when mode is none", () => {
    const { container } = render(
      <PortfolioNavBrandMark navBrand={{ mode: "none" }} template="agent" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders icon in icon mode", () => {
    const { container } = render(
      <PortfolioNavBrandMark
        navBrand={{ mode: "icon", iconKey: "FaRocket" }}
        template="agent"
      />
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders initials with aria-label in initials mode", () => {
    render(
      <PortfolioNavBrandMark
        navBrand={{ mode: "initials", initialsText: "JD", initialsFill: "color" }}
        template="healthcare"
      />
    );
    expect(screen.getByLabelText(/logo jd/i)).toBeInTheDocument();
  });
});
