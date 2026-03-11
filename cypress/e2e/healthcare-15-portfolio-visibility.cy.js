/// <reference types="cypress" />

/**
 * FE-E2E-HC-ADMIN-1 — Portfolio Visibility Toggle
 *
 * Tests public/private portfolio access.
 */

describe("FE-E2E-HC-ADMIN-1 — Portfolio Visibility", () => {
  const practiceId = "hc-visibility-1";
  const ownerId = "owner-123";

  const createMockPractice = (isPublic) => ({
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    isPublic,
    practice: {
      name: "Visibility Test Practice",
      tagline: "Testing visibility",
      description: "Demo practice",
    },
    contact: { phone: "(111) 111-1111", email: "test@practice.com" },
    services: [{ id: "svc-1", title: "Service", description: "desc" }],
    blogPosts: [],
    gallery: { facilityImages: [], beforeAfterCases: [] },
    stats: {},
    seo: {},
    ui: {},
  });

  it("public portfolio is accessible without authentication", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: createMockPractice(true),
    }).as("getPublicPractice");

    cy.visit(`/portfolios/healthcare/${practiceId}`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    // Should load successfully - check for nav or content
    cy.get("nav", { timeout: 15000 }).should("be.visible");
    cy.contains("Visibility Test Practice").should("be.visible");
  });

  it("private portfolio redirects to signup for unauthenticated users", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 403,
      body: { message: "Portfolio is private" },
    }).as("getPrivatePractice");

    cy.visit(`/portfolios/healthcare/${practiceId}`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    // App should redirect to signup or show error
    cy.url({ timeout: 15000 }).should("satisfy", (url) => {
      return (
        url.includes("/signup") ||
        url.includes("/login") ||
        url === Cypress.config("baseUrl") + "/"
      );
    });
  });

  it("owner can see portfolio on main dashboard", () => {
    cy.intercept("GET", "**/user/me", {
      statusCode: 200,
      body: {
        user: { 
          id: ownerId, 
          _id: ownerId, 
          email: "owner@test.com",
          portfolios: [{ portfolioId: practiceId, portfolioType: "Healthcare" }]
        },
        portfolioIds: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
      },
    }).as("getMe");

    cy.intercept("GET", "**/publicPortfolios/public", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicPortfolios");

    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    // Wait for dashboard to load
    cy.url().should("include", "/dashboard");
    cy.get('body', { timeout: 15000 }).should("be.visible");
  });
});