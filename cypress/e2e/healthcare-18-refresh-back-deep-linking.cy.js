/// <reference types="cypress" />

/**
 * FE-E2E-HC-EDGE-3 — Refresh, Back Button & Deep Linking
 *
 * Tests browser navigation on healthcare pages.
 */

describe("FE-E2E-HC-EDGE-3 — Refresh, Back Button & Deep Linking", () => {
  const practiceId = "hc-deep-link-1";
  const ownerId = "owner-123";

  const mockPractice = {
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    isPublic: true,
    practice: {
      name: "Deep Link Practice",
      tagline: "Testing navigation",
      description: "Demo practice",
    },
    contact: { phone: "(111) 111-1111", email: "test@practice.com" },
    services: [],
    blogPosts: [],
    gallery: { facilityImages: [], beforeAfterCases: [] },
    stats: {},
    ui: {},
  };

  it("handles refresh and navigation on Healthcare landing page", () => {
    cy.visit("/portfolios");

    cy.contains(/healthcare/i)
      .should("be.visible")
      .click();

    cy.url({ timeout: 15000 }).should("include", "/portfolios/healthcare");
    cy.contains(/build your practice|healthcare|get started/i, {
      matchCase: false,
      timeout: 15000,
    }).should("exist");

    // Refresh keeps us on the landing
    cy.reload();
    cy.url().should("include", "/portfolios/healthcare");

    // Back → portfolios list
    cy.go("back");
    cy.url({ timeout: 15000 }).should("include", "/portfolios");

    // Forward → Healthcare landing
    cy.go("forward");
    cy.url({ timeout: 15000 }).should("include", "/portfolios/healthcare");
  });

  it("handles refresh on live portfolio page", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getPractice");

    cy.visit(`/portfolios/healthcare/${practiceId}`);

    // Wait for content to load
    cy.get("nav", { timeout: 15000 }).should("be.visible");

    // Refresh - should stay on same page
    cy.reload();
    cy.url().should("include", `/portfolios/healthcare/${practiceId}`);
    cy.get("nav", { timeout: 15000 }).should("be.visible");
  });

  it("handles deep link to admin dashboard", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getPractice");

    cy.intercept("GET", /\/healthcare\/admin\/data\//, {
      statusCode: 200,
      body: mockPractice,
    }).as("getAdminData");

    cy.intercept("GET", "**/user/me", {
      statusCode: 200,
      body: {
        user: { id: ownerId, _id: ownerId, email: "owner@test.com" },
        portfolioIds: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
      },
    }).as("getMe");

    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    // Should show admin dashboard
    cy.url().should("include", "/admin/dashboard");
    cy.get('input, button, [role="tab"]', { timeout: 15000 }).should("exist");

    // Refresh - should stay on admin dashboard
    cy.reload();
    cy.url().should("include", "/admin/dashboard");
  });
});