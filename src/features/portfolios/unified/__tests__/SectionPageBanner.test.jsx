import React from "react";
import { render, screen } from "@testing-library/react";
import SectionPageBanner from "../SectionPageBanner";

describe("SectionPageBanner", () => {
  it("uses section nav label as title when pageBanner title empty", () => {
    render(
      <SectionPageBanner
        template="healthcare"
        sectionType="hero"
        pageBanner={{ enabled: true, bannerBackground: "gradient" }}
      />
    );
    expect(screen.getByRole("heading", { level: 1, name: /^home$/i })).toBeInTheDocument();
  });

  it("uses custom title and subtitle when provided", () => {
    render(
      <SectionPageBanner
        template="agent"
        sectionType="contact"
        pageBanner={{
          enabled: true,
          title: " Get in touch ",
          subtitle: " We reply fast ",
        }}
      />
    );
    expect(screen.getByRole("heading", { name: /^get in touch$/i })).toBeInTheDocument();
    expect(screen.getByText(/we reply fast/i)).toBeInTheDocument();
  });

  it("uses pageBannerDefaults gradient colors for handyman template", () => {
    render(
      <SectionPageBanner
        template="handyman"
        sectionType="services"
        pageBanner={{ enabled: true, bannerBackground: "gradient" }}
        pageBannerDefaults={{ gradientFrom: "#111111", gradientTo: "#222222" }}
      />
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /services/i })
    ).toBeInTheDocument();
  });
});
