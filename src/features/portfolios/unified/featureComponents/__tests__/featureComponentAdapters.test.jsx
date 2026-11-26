import { render, screen } from "@testing-library/react";
import GalleryBlock from "../../blocks/GalleryBlock";
import TestimonialsBlock from "../../blocks/TestimonialsBlock";
import HoursBlock from "../../blocks/HoursBlock";
import ServicesBlock from "../../blocks/ServicesBlock";
import ContactBlock from "../../blocks/ContactBlock";
import { buildPuckEditorConfig } from "../buildPuckEditorConfig";
import {
  blockDataFromPuckRenderProps,
  galleryPuckToSection,
  gallerySectionToPuck,
  hoursPuckToSection,
  hoursSectionToPuck,
  servicesPuckToSection,
  servicesSectionToPuck,
  testimonialsPuckToSection,
  testimonialsSectionToPuck,
  contactPuckToSection,
  contactSectionToPuck,
  puckPropsToSectionData,
  sectionDataToPuckProps,
  socialLinksSectionToPuck,
  socialLinksPuckToSection,
  qrCodeSectionToPuck,
  qrCodePuckToSection,
  voucherOfferSectionToPuck,
  voucherOfferPuckToSection,
  bookingRequestSectionToPuck,
  bookingRequestPuckToSection,
} from "../featureComponentAdapters";
import BookingRequestBlock from "../../blocks/BookingRequestBlock";
import { stripPuckRenderProps } from "../puckRenderUtils";

const backendGalleryConfig = {
  root: { fields: {}, defaultProps: {} },
  components: {
    Gallery: {
      label: "Gallery",
      fields: {},
      defaultProps: { title: "Gallery", images: [] },
      metadata: { blockType: "gallery" },
    },
    ContactLeadForm: {
      label: "Contact",
      fields: {},
      defaultProps: {
        headline: "Get in touch",
        enableForm: true,
        submitLabel: "Send message",
        formFields: { showName: true, showEmail: true, showMessage: true },
      },
      metadata: { blockType: "contact" },
    },
  },
};

describe("featureComponentAdapters", () => {
  it("gallery round-trips healthcare facilityImages and renders captions", () => {
    const legacy = {
      facilityImages: [{ url: "https://example.com/a.jpg", caption: "Lab view" }],
    };
    const puck = gallerySectionToPuck(legacy, "healthcare");
    expect(puck.images[0].caption).toBe("Lab view");
    const section = galleryPuckToSection(puck, legacy, "healthcare");
    expect(section.facilityImages[0].url).toBe("https://example.com/a.jpg");

    render(<GalleryBlock template="healthcare" {...section} />);
    expect(screen.getByText("Lab view")).toBeInTheDocument();
  });

  it("gallery round-trips handyman items to imageUrl", () => {
    const legacy = {
      sectionTitle: "Work",
      items: [{ title: "Kitchen", imageUrl: "https://example.com/k.jpg" }],
    };
    const puck = gallerySectionToPuck(legacy, "handyman");
    const section = galleryPuckToSection(puck, legacy, "handyman");
    expect(section.sectionTitle).toBe("Work");
    expect(section.items[0].imageUrl).toBe("https://example.com/k.jpg");

    render(<GalleryBlock template="handyman" {...section} />);
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
  });

  it("testimonials maps name ↔ author and renders quote", () => {
    const legacy = {
      sectionTitle: "Reviews",
      items: [{ name: "Sam", quote: "Great work", location: "Austin" }],
    };
    const puck = testimonialsSectionToPuck(legacy);
    expect(puck.items[0].author).toBe("Sam");
    const section = testimonialsPuckToSection(puck, legacy);
    expect(section.items[0].name).toBe("Sam");

    render(<TestimonialsBlock template="agent" {...section} />);
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText(/Great work/)).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("services maps sectionTitle ↔ title", () => {
    const legacy = {
      sectionTitle: "What we offer",
      items: [{ title: "Design", description: "UI work" }],
    };
    const puck = servicesSectionToPuck(legacy);
    const section = servicesPuckToSection(puck, legacy);

    render(<ServicesBlock template="handyman" {...section} />);
    expect(screen.getByText("What we offer")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("hours maps schedule to weekdays strings", () => {
    const puck = {
      title: "Hours",
      timezone: "America/New_York",
      schedule: [{ day: "Weekdays", open: "9-5", close: "", closed: false }],
    };
    const section = hoursPuckToSection(puck, {});
    expect(section.weekdays).toBe("9-5");

    render(<HoursBlock template="agent" {...section} />);
    expect(screen.getByText("9-5")).toBeInTheDocument();
  });

  it("hours reads legacy weekdays into puck schedule", () => {
    const legacy = { weekdays: "Mon-Fri 9-5", saturday: "10-2" };
    const puck = hoursSectionToPuck(legacy);
    expect(puck.schedule).toHaveLength(2);
    const roundTrip = hoursPuckToSection(puck, legacy);
    expect(roundTrip.weekdays).toBe("Mon-Fri 9-5");
    expect(roundTrip.saturday).toBe("10-2");
  });

  it("contact maps headline to title and preserves email", () => {
    const legacy = { email: "team@example.com", submitText: "Go" };
    const puck = contactSectionToPuck(legacy);
    expect(puck.headline).toBe("Get in touch");
    const section = contactPuckToSection(
      { ...puck, headline: "Contact our team", submitLabel: "Submit" },
      legacy
    );
    expect(section.email).toBe("team@example.com");
    expect(section.submitText).toBe("Submit");

    render(<ContactBlock template="projectManager" {...section} />);
    expect(screen.getByText("team@example.com")).toBeInTheDocument();
  });

  it("puckPropsToSectionData honors puck type id", () => {
    const data = puckPropsToSectionData(
      "Testimonials",
      { title: "T", items: [{ author: "Pat", quote: "Nice" }] },
      "agent",
      {}
    );
    expect(data.sectionTitle).toBe("T");
    expect(data.items[0].name).toBe("Pat");
  });

  it("stripPuckRenderProps removes puck internals before block render", () => {
    const blockData = blockDataFromPuckRenderProps(
      "Gallery",
      {
        id: "x",
        puck: { isEditing: true },
        title: "Photos",
        images: [{ url: "https://example.com/p.jpg", caption: "One" }],
      },
      "healthcare"
    );
    expect(blockData.puck).toBeUndefined();
    expect(blockData.facilityImages[0].url).toBe("https://example.com/p.jpg");

    const config = buildPuckEditorConfig(backendGalleryConfig, "healthcare");
    const rendered = config.components.Gallery.render({
      id: "1",
      puck: {},
      title: "Photos",
      images: [{ url: "https://example.com/p.jpg", caption: "Shown" }],
    });
    render(rendered);
    expect(screen.getByText("Shown")).toBeInTheDocument();
  });

  it("social links round-trip stores visibility only", () => {
    const legacy = {
      sectionTitle: "Find us",
      platforms: { github: true, twitter: false, website: true },
      github: "https://should-strip.test",
    };
    const puck = socialLinksSectionToPuck(legacy);
    expect(puck.platforms.github).toBe(true);
    const section = socialLinksPuckToSection(puck, legacy);
    expect(section.linkSource).toBe("socialLinksModule");
    expect(section.github).toBeUndefined();
    expect(section.platforms.twitter).toBe(false);
  });

  it("qr code round-trip preserves section fields", () => {
    const legacy = { sectionTitle: "Scan me", target: "/go", size: 200, caption: "Hi" };
    const puck = qrCodeSectionToPuck(legacy);
    const back = qrCodePuckToSection(puck, legacy);
    expect(back.sectionTitle).toBe("Scan me");
    expect(back.target).toBe("/go");
    expect(back.size).toBe(200);
  });

  it("booking request maps services between puck objects and string array", () => {
    const prev = import.meta.env.VITE_COMPONENT_BOOKING_ENABLED;
    import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = "true";

    const legacy = {
      sectionTitle: "Book",
      intro: "Hi",
      services: ["Checkup", "Follow-up"],
      minNoticeHours: 12,
      daysAheadMax: 14,
      timezone: "UTC",
      confirmationText: "Thanks",
    };
    const puck = bookingRequestSectionToPuck(legacy);
    expect(puck.services).toEqual([{ name: "Checkup" }, { name: "Follow-up" }]);
    const section = bookingRequestPuckToSection(puck, legacy);
    expect(section.services).toEqual(["Checkup", "Follow-up"]);

    render(<BookingRequestBlock template="healthcare" sectionId="sect-1" {...section} />);
    expect(screen.getByText("Book")).toBeInTheDocument();

    import.meta.env.VITE_COMPONENT_BOOKING_ENABLED = prev;
  });

  it("voucher offer maps voucherId to userVoucherId and strips secrets", () => {
    const legacy = {
      sectionTitle: "Deal",
      userVoucherId: "507f1f77bcf86cd799439011",
      code: "SECRET",
    };
    const puck = voucherOfferSectionToPuck(legacy);
    expect(puck.voucherId).toBe("507f1f77bcf86cd799439011");
    const back = voucherOfferPuckToSection(
      { ...puck, description: "Save today", cta: "Go", ctaUrl: "https://example.test" },
      legacy
    );
    expect(back.userVoucherId).toBe("507f1f77bcf86cd799439011");
    expect(back.code).toBeUndefined();
    expect(back.voucherCode).toBeUndefined();
  });

  it("sectionDataToPuckProps mirrors puckPropsToSectionData for gallery", () => {
    const legacy = { facilityImages: [{ url: "https://example.com/z.jpg", caption: "Z" }] };
    const puck = sectionDataToPuckProps("Gallery", legacy, "healthcare");
    const back = puckPropsToSectionData("Gallery", puck, "healthcare", legacy);
    expect(back.facilityImages).toEqual(legacy.facilityImages);
    expect(stripPuckRenderProps({ id: "1", puck: { a: 1 }, title: "x" })).toEqual({ title: "x" });
  });
});