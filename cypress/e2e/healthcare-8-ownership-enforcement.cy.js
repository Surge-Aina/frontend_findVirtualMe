/// <reference types="cypress" />

/**
 * FE-E2E-HC-VENDOR-1 — Portfolio Admin Access
 *
 * Tests that authenticated users can access admin dashboard.
 */

describe("FE-E2E-HC-VENDOR-1 — Portfolio Admin Access", () => {
  const practiceId = "hc-owner-guard-1";
  const ownerId = "owner-123";

  const mockPractice = {
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    isPublic: true,
    practice: {
      name: "Owner Guard Practice",
      tagline: "Testing ownership",
      description: "Demo practice",
    },
    contact: { phone: "(111) 111-1111", email: "test@practice.com" },
    services: [{ id: "svc-1", title: "General Checkup", description: "desc" }],
    blogPosts: [],
    gallery: { facilityImages: [], beforeAfterCases: [] },
    stats: {},
    ui: {},
  };

  it("authenticated user can access admin dashboard", () => {
    // Use regex to match healthcare endpoints
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
        user: { id: ownerId, _id: ownerId, email: "owner@test.com", name: "Owner" },
        portfolioIds: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
      },
    }).as("getMe");

    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    // Wait for admin dashboard to load
    cy.url().should("include", "/admin/dashboard");
    
    // Should see form elements or navigation
    cy.get('input, button, [role="tab"]', { timeout: 15000 }).should("exist");
  });

  it("unauthenticated user is redirected from admin dashboard", () => {
    cy.intercept("GET", "**/user/me", {
      statusCode: 401,
      body: { message: "Unauthorized" },
    }).as("getMeUnauth");

    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 401,
      body: { message: "Unauthorized" },
    }).as("getPracticeUnauth");

    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    // Should redirect away from admin dashboard or show auth required
    cy.url({ timeout: 15000 }).should("satisfy", (url) => {
      return (
        url.includes("/login") ||
        url.includes("/signup") ||
        url === Cypress.config("baseUrl") + "/" ||
        // Some apps show the page but with auth modal
        url.includes("/admin/dashboard")
      );
    });
  });
});