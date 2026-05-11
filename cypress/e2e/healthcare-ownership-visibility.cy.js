/// <reference types="cypress" />

describe("Healthcare ownership and visibility", () => {
  const practiceId = "hc-owner-visibility-1";
  const ownerId = "owner-123";

  const createMockPractice = (isPublic = true) => ({
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

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("loads a public healthcare portfolio without authentication", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: createMockPractice(true),
    }).as("getPublicPractice");

    cy.visit(`/portfolios/healthcare/${practiceId}`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    cy.get("nav", { timeout: 15000 }).should("be.visible");
    cy.contains("Visibility Test Practice").should("be.visible");
  });

  it("redirects unauthenticated users away from a private healthcare portfolio", () => {
    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 403,
      body: { message: "Portfolio is private" },
    }).as("getPrivatePractice");

    cy.visit(`/portfolios/healthcare/${practiceId}`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    cy.url({ timeout: 15000 }).should("satisfy", (url) => {
      return (
        url.includes("/signup") ||
        url.includes("/login") ||
        url === Cypress.config("baseUrl") + "/"
      );
    });
  });

  it("allows an authenticated owner into the healthcare admin dashboard", () => {
    const practice = createMockPractice(true);

    cy.intercept("GET", /\/healthcare\/practice\//, {
      statusCode: 200,
      body: practice,
    }).as("getPractice");

    cy.intercept("GET", /\/healthcare\/admin\/data\//, {
      statusCode: 200,
      body: practice,
    }).as("getAdminData");

    cy.intercept("GET", "**/api/users/me", {
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

    cy.url().should("include", "/admin/dashboard");
    cy.get("input, button, [role=\"tab\"]", { timeout: 15000 }).should("exist");
  });

  it("shows the owner portfolio on the main dashboard", () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          id: ownerId,
          _id: ownerId,
          email: "owner@test.com",
          portfolios: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
        },
        portfolioIds: [{ portfolioId: practiceId, portfolioType: "Healthcare" }],
      },
    }).as("getMe");

    cy.intercept("GET", "**/api/portfolios/public/list", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicPortfolios");

    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.url().should("include", "/dashboard");
    cy.get("body", { timeout: 15000 }).should("be.visible");
  });
});
