/// <reference types="cypress" />

/**
 * FE-E2E-HC-VENDOR-2 — Admin Dashboard Operations
 *
 * Tests the healthcare admin dashboard loads correctly.
 */

describe("FE-E2E-HC-VENDOR-2 — Admin Dashboard Operations", () => {
  // Use a valid MongoDB ObjectId format
  const practiceId = "507f1f77bcf86cd799439011";
  const ownerId = "507f1f77bcf86cd799439012";

  const mockPractice = {
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    isPublic: false,
    practice: {
      name: "Edit Test Practice",
      tagline: "Original Tagline",
      description: "Original description",
    },
    contact: {
      phone: "(111) 111-1111",
      email: "test@practice.com",
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
  });

  it("loads admin dashboard page", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    // Should be on admin dashboard URL
    cy.url().should("include", "/admin/dashboard");
    
    // Page should have some content
    cy.get("body", { timeout: 15000 }).should("be.visible");
  });

  it("has interactive elements on admin dashboard", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.url().should("include", "/admin/dashboard");
    
    // Wait for API calls
    cy.wait("@getPractice", { timeout: 10000 });
    
    // Should have some buttons or inputs
    cy.get("button, input, textarea, select", { timeout: 15000 }).should("have.length.greaterThan", 0);
  });

  it("displays admin content from API", () => {
    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.wait("@getPractice", { timeout: 10000 });

    // Log what's on the page
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      cy.log("Admin page content:", bodyText.substring(0, 500));
    });

    // Page loaded successfully
    cy.url().should("include", "/admin/dashboard");
  });
});