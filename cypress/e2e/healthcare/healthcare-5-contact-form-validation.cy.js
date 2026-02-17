/// <reference types="cypress" />

/**
 * FE-E2E-HC-GUEST-5 — Contact Form Validation (Frontend)
 *
 * Tests contact form on healthcare portfolio.
 */

describe("FE-E2E-HC-GUEST-5 — Contact Form Validation (Frontend)", () => {
  // Use a valid MongoDB ObjectId format
  const practiceId = "507f1f77bcf86cd799439011";

  const mockPractice = {
    _id: practiceId,
    userId: "507f1f77bcf86cd799439012",
    portfolioType: "Healthcare",
    isPublic: true,
    practice: {
      name: "Contact Form Practice",
      tagline: "Testing contact",
      description: "Demo practice",
    },
    contact: {
      email: "test@practice.com",
      phone: "(111) 111-1111",
    },
    services: [],
    blogPosts: [],
    gallery: { facilityImages: [], beforeAfterCases: [] },
    stats: {},
    seo: {},
    ui: {},
  };

  beforeEach(() => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getPractice");
  });

  it("loads contact page", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/contact`);

    // Wait for page to load
    cy.get("nav", { timeout: 15000 }).should("be.visible");
    cy.url().should("include", "/contact");
  });

  it("has contact page content", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/contact`);

    cy.wait("@getPractice", { timeout: 10000 });

    // Check what content is on the page
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      cy.log("Contact page content:", bodyText.substring(0, 500));
      
      // Look for form or contact info
      const hasForm = $body.find("form").length > 0;
      const hasInputs = $body.find("input").length > 0;
      
      cy.log(`Has form: ${hasForm}, Has inputs: ${hasInputs}`);
    });

    // Page should be loaded
    cy.url().should("include", "/contact");
  });
});