// FE-E2E-HM-ADMIN-4 — Cross-Role Access Regression
//
// Sessions are stubbed with cy.intercept. This spec does not call a live API
// and does not send an auth-bypass header.

const SYNTHETIC_PASSWORD = "Cypress-Only-1!";

const adminUser = {
  _id: "cypress-admin-user",
  firstName: "Cypress",
  lastName: "Admin",
  email: "cypress-admin@example.invalid",
  role: "admin",
  portfolios: [],
};

const vendorUser = {
  _id: "cypress-vendor-user",
  firstName: "Cypress",
  lastName: "Vendor",
  email: "cypress-vendor@example.invalid",
  username: "cypress_vendor",
  role: "vendor",
  goal: "find-job",
  industry: "other",
  skills: ["Customer Service"],
  portfolios: [],
};

const sessionBody = (user, token) => ({
  token,
  user,
  portfolioIds: user.portfolios || [],
});

const stubSession = (user, token) => {
  cy.intercept("POST", "**/api/auth/login", {
    statusCode: 200,
    body: sessionBody(user, token),
  }).as("login");

  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: {
      user,
      portfolioIds: user.portfolios || [],
    },
  }).as("getMe");
};

const resetSession = () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit("/", {
    onBeforeLoad(win) {
      win.localStorage.clear();
    },
  });
};

const loginViaModal = (email) => {
  cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist").click({ force: true });

  cy.get('input#email, input[name="email"]').first().should("exist").clear().type(email);

  cy.get('input#password, input[name="password"]')
    .first()
    .should("exist")
    .clear()
    .type(SYNTHETIC_PASSWORD, { log: false });

  cy.contains("button", /^sign in$/i).should("exist").click({ force: true });

  cy.wait("@login");
  cy.url({ timeout: 15000 }).should("include", "/profile");
  cy.contains(/personal information/i).should("exist");
};

const signupVendor = () => {
  stubSession(vendorUser, "cypress-vendor-token");

  cy.intercept("POST", "**/api/users", {
    statusCode: 201,
    body: {
      user: vendorUser,
    },
  }).as("signup");

  cy.visit("/");

  cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist").click({ force: true });

  cy.contains("button, a", /^sign up$/i, { timeout: 20000 }).click();
  cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding");

  cy.contains(/what's your main goal\?/i, { timeout: 20000 }).should("be.visible");
  cy.contains(/find a job/i).click();

  cy.contains(/what type of work do you do\?/i, { timeout: 20000 }).should("be.visible");
  cy.contains(/^other$/i).click();

  cy.contains(/what are your skills\?/i, { timeout: 20000 }).should("be.visible");
  cy.contains(/^customer service$/i).click();
  cy.contains("button", /^continue$/i).click();

  cy.contains(/tell us about yourself/i, { timeout: 20000 }).should("be.visible");
  cy.get("#firstName").type(vendorUser.firstName);
  cy.get("#lastName").type(vendorUser.lastName);
  cy.get("#email").type(vendorUser.email);
  cy.get("#password").type(SYNTHETIC_PASSWORD, { log: false });
  cy.get("#username").type(vendorUser.username);

  cy.contains("button", /complete setup/i).click();

  cy.wait("@signup").its("response.statusCode").should("be.oneOf", [200, 201]);
  cy.wait("@login").its("response.statusCode").should("be.oneOf", [200, 201]);

  cy.url({ timeout: 20000 }).should("include", "/onboarding_info");
};

describe("FE-E2E-HM-ADMIN-4 — Cross-Role Access Regression", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/portfolios/public/list*", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicList");

    cy.intercept("GET", "**/api/portfolios/mine", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getMine");

    cy.intercept("GET", "**/api/payments/subscriptions", {
      statusCode: 200,
      body: [],
    }).as("subscriptions");
  });

  it("runs admin, vendor, and guest flows in succession without leaking access", () => {
    stubSession(adminUser, "cypress-admin-token");
    cy.visit("/");
    loginViaModal(adminUser.email);

    cy.contains("a,button", /^admin$/i).should("exist");

    cy.visit("/admin-choice");
    cy.url({ timeout: 15000 }).should("include", "/admin-choice");
    cy.contains("button, a", /log in.*sign up/i).should("not.exist");

    resetSession();
    signupVendor();

    cy.contains("a,button", /^admin$/i).should("not.exist");
    cy.contains("a,button", /^dashboard$/i).should("exist").click();
    cy.url({ timeout: 15000 }).should("include", "/dashboard");

    resetSession();

    cy.visit("/dashboard");
    cy.contains(/your dashboard|my projects|studio/i, { matchCase: false }).should("not.exist");
    cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist");

    cy.visit("/itadmin/logs");
    cy.contains(/portfolio edit logs/i, { matchCase: false }).should("not.exist");
    cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist");
  });
});
