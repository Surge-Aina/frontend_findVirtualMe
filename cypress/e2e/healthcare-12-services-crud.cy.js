/// <reference types="cypress" />

/**
 * FE-E2E-HC-VENDOR-5 — Admin Dashboard Content
 *
 * Tests admin dashboard content loads correctly.
 */

describe("FE-E2E-HC-VENDOR-5 — Admin Dashboard Content", () => {
  // Use a valid MongoDB ObjectId format
  const practiceId = "507f1f77bcf86cd799439011";
  const ownerId = "507f1f77bcf86cd799439012";

  const mockPractice = {
    _id: practiceId,
    userId: ownerId,
    portfolioType: "Healthcare",
    practice: {
      name: "Services CRUD Practice",
      tagline: "Testing services",
      description: "Demo practice",
    },
    contact: { phone: "(111) 111-1111", email: "test@practice.com" },
    services: [
      {
        id: "svc-existing",
        title: "Existing Service",
        description: "This service already exists",
        price: "$100",
      },
    ],
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

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: { id: ownerId, _id: ownerId, email: "owner@test.com" },
      },
    }).as("getMe");

    cy.visit(`/portfolios/healthcare/${practiceId}/admin/dashboard`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.url().should("include", "/admin/dashboard");
  });

  it("loads admin dashboard", () => {
    // Should have some content
    cy.get("body", { timeout: 15000 }).should("be.visible");
    cy.url().should("include", "/admin/dashboard");
  });

  it("has buttons on admin dashboard", () => {
    cy.wait("@getPractice", { timeout: 10000 });
    cy.get("button", { timeout: 15000 }).should("have.length.greaterThan", 0);
  });

  it("has form elements on admin dashboard", () => {
    cy.wait("@getPractice", { timeout: 10000 });
    
    // Check for any interactive elements
    cy.get("button, input, textarea, select", { timeout: 15000 }).should("have.length.greaterThan", 0);
  });
});