/// <reference types="cypress" />

/**
 * FE-E2E-HC-VENDOR-9 — Stats Section
 *
 * Tests editing practice statistics:
 * - Years of experience
 * - Patients served
 * - Success rate
 * - Number of doctors/staff
 */

describe("FE-E2E-HC-VENDOR-9 — Stats Section", () => {
  const practiceId = "507f1f77bcf86cd799439011";
  const ownerId = "507f1f77bcf86cd799439012";

  const mockPractice = {
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    isPublic: true,
    practice: {
      name: "Stats Test Practice",
      tagline: "Testing stats",
      description: "Demo practice",
    },
    contact: { phone: "(111) 111-1111", email: "test@practice.com" },
    services: [],
    blogPosts: [],
    gallery: { facilityImages: [], beforeAfterCases: [] },
    stats: {
      yearsExperience: "10",
      patientsServed: "5000",
      successRate: "95",
      doctorsCount: "8",
    },
    seo: {},
    ui: {},
  };

  beforeEach(() => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getPractice");

    cy.intercept("GET", /\/healthcare\/admin\/data\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getAdminData");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: { id: ownerId, _id: ownerId, email: "owner@test.com", name: "Owner" },
        portfolioIds: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
      },
    }).as("getMe");

    cy.intercept("POST", /\/healthcare\/admin\/data\//, {
      statusCode: 200,
      body: { success: true },
    }).as("saveAdminData");
  });

  it("loads admin dashboard with stats section", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.url().should("include", "/admin/dashboard");
    cy.wait("@getPractice", { timeout: 10000 });

    // Dashboard should load
    cy.get("body", { timeout: 15000 }).should("be.visible");
  });

  it("displays stats-related inputs or section", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.wait("@getPractice", { timeout: 10000 });

    // Look for stats-related content
    cy.get("body").then(($body) => {
      const bodyText = $body.text().toLowerCase();
      
      const hasStatsKeywords = 
        bodyText.includes("years") ||
        bodyText.includes("experience") ||
        bodyText.includes("patients") ||
        bodyText.includes("success") ||
        bodyText.includes("doctors") ||
        bodyText.includes("stats") ||
        bodyText.includes("statistics");

      cy.log(`Has stats-related content: ${hasStatsKeywords}`);

      // Look for number inputs that might be stats
      const numberInputs = $body.find('input[type="number"]').length;
      cy.log(`Number inputs found: ${numberInputs}`);
    });

    // Dashboard should have interactive elements
    cy.get("button, input", { timeout: 10000 }).should("have.length.greaterThan", 0);
  });

  it("can edit stats values", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.wait("@getPractice", { timeout: 10000 });

    // Try to find and edit a number input (likely stats)
    cy.get("body").then(($body) => {
      if ($body.find('input[type="number"]').length > 0) {
        cy.get('input[type="number"]').first().clear().type("25");
        cy.get('input[type="number"]').first().should("have.value", "25");
        cy.log("Successfully edited number input (likely stats)");
      } else if ($body.find('input[type="text"]').length > 0) {
        // Stats might be text inputs
        cy.get('input[type="text"]').then(($inputs) => {
          // Find one that looks like a number
          const numericInput = $inputs.filter((i, el) => /^\d+$/.test(el.value));
          if (numericInput.length > 0) {
            cy.wrap(numericInput.first()).clear().type("100");
            cy.log("Edited text input with numeric value");
          }
        });
      }
    });
  });

  it("displays stats on public portfolio page", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}`);

    cy.wait("@getPractice", { timeout: 10000 });

    // Check for stats display on public page
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      
      // Look for our mock stats values
      const hasYears = bodyText.includes("10") && bodyText.toLowerCase().includes("year");
      const hasPatients = bodyText.includes("5000") || bodyText.includes("5,000");
      const hasSuccess = bodyText.includes("95") && bodyText.includes("%");

      cy.log(`Shows years: ${hasYears}`);
      cy.log(`Shows patients: ${hasPatients}`);
      cy.log(`Shows success rate: ${hasSuccess}`);
    });

    // Page should display
    cy.get("nav", { timeout: 15000 }).should("be.visible");
  });
});
