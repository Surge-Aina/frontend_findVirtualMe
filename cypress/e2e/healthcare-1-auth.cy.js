// FE-E2E-HC-AUTH-1 — Healthcare Portfolio auth
//
// Account creation and login are stubbed with cy.intercept. The preview build
// points at a closed local port, so this spec never calls a real backend and
// never sends an auth-bypass header.

const SYNTHETIC_PASSWORD = "Cypress-Only-1!";
const practiceId = "cypress-hc-portfolio-1";

const user = {
  _id: "cypress-hc-user",
  firstName: "Cypress",
  lastName: "Clinician",
  email: "cypress-hc@example.invalid",
  username: "cypress_clinician",
  role: "user",
  goal: "grow-business",
  portfolios: [],
};

const meResponse = {
  user,
  portfolioIds: [],
};

const stubAuth = () => {
  cy.intercept("POST", "**/api/users", {
    statusCode: 201,
    body: { user },
  }).as("signup");

  cy.intercept("POST", "**/api/auth/login", {
    statusCode: 200,
    body: {
      token: "cypress-hc-token",
      ...meResponse,
    },
  }).as("login");

  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: meResponse,
  }).as("getMe");
};

const openSignup = () => {
  cy.visit("/");
  cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 }).should("be.visible").click();
  cy.contains("button", /^sign up$/i, { timeout: 20000 }).click();
  cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding");
};

describe("FE-E2E-HC-AUTH-1 — Healthcare Portfolio auth", () => {
  it("registers through onboarding, creates Healthcare portfolio, and reaches the portfolio page", () => {
    stubAuth();

    cy.intercept("POST", "**/api/portfolios", {
      statusCode: 201,
      body: {
        portfolio: {
          _id: practiceId,
          template: "healthcare",
          title: "Cypress Practice",
        },
      },
    }).as("createPortfolio");

    cy.intercept("PATCH", "**/api/users/portfolio-id", {
      statusCode: 200,
      body: { ok: true },
    }).as("linkPortfolio");

    cy.intercept("POST", "**/api/portfolios/edit-log", {
      statusCode: 201,
      body: { success: true },
    }).as("editLog");

    openSignup();

    cy.get("[data-cy=goal-card-grow-business]").click();
    cy.contains(/tell us about yourself/i, { timeout: 20000 }).should("be.visible");

    cy.get("#firstName").type(user.firstName);
    cy.get("#lastName").type(user.lastName);
    cy.get("#email").type(user.email);
    cy.get("#password").type(SYNTHETIC_PASSWORD, { log: false });
    cy.get("#username").type(user.username);
    cy.contains("button", /complete setup/i).click();

    cy.wait("@signup").its("response.statusCode").should("eq", 201);
    cy.wait("@login").its("response.statusCode").should("eq", 200);

    cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding_info");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.eq("cypress-hc-token");
      expect(win.localStorage.getItem("email")).to.eq(user.email);
    });

    cy.contains("Choose a Template").should("be.visible");
    cy.contains("Healthcare Professional").click();

    cy.wait("@createPortfolio");
    cy.wait("@linkPortfolio");
    cy.wait("@editLog");
    cy.wait("@getMe");

    cy.location("pathname", { timeout: 20000 }).should("eq", `/portfolios/view/${practiceId}/edit`);
  });

  it("logs out, logs back in via UI, navigates to Dashboard, and opens the created Healthcare portfolio", () => {
    stubAuth();

    cy.intercept("GET", "**/api/portfolios/mine", {
      statusCode: 200,
      body: {
        portfolios: [
          {
            _id: practiceId,
            template: "healthcare",
            title: "Cypress Practice",
            portfolioName: "Cypress Practice",
            practice: { name: "Cypress Practice" },
            portfolioType: "Healthcare",
            visibility: "private",
          },
        ],
      },
    }).as("getMine");

    cy.intercept("GET", "**/api/portfolios/public/list*", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicList");

    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "cypress-hc-token");
        win.localStorage.setItem("email", user.email);
      },
    });

    cy.contains("button", /^logout$/i, { timeout: 20000 }).should("be.visible").click();
    cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 }).should("be.visible").click();

    cy.get("#email").type(user.email);
    cy.get("#password").type(SYNTHETIC_PASSWORD, { log: false });
    cy.contains("button", /^sign in$/i).click();

    cy.wait("@login");
    cy.wait("@getMe");
    cy.location("pathname", { timeout: 20000 }).should("eq", "/profile");

    cy.contains("button, a", /^dashboard$/i).click();
    cy.wait("@getMine");
    cy.contains(/my portfolios/i).should("be.visible");
    cy.contains("Cypress Practice").should("be.visible");

    cy.contains("Cypress Practice")
      .parentsUntil("body")
      .first()
      .within(() => {
        cy.contains("button", /^edit$/i).click();
      });

    cy.location("pathname", { timeout: 20000 }).should("eq", `/portfolios/view/${practiceId}/edit`);
  });

  it("shows a setup error when account creation cannot reach the API", () => {
    cy.intercept("POST", "**/api/users", { forceNetworkError: true }).as("signup");

    openSignup();
    cy.get("[data-cy=goal-card-grow-business]").click();
    cy.contains(/tell us about yourself/i, { timeout: 20000 }).should("be.visible");

    cy.get("#firstName").type(user.firstName);
    cy.get("#lastName").type(user.lastName);
    cy.get("#email").type(user.email);
    cy.get("#password").type(SYNTHETIC_PASSWORD, { log: false });
    cy.get("#username").type(user.username);
    cy.contains("button", /complete setup/i).click();

    cy.contains(/could not finish account setup/i, { timeout: 20000 }).should("be.visible");
    cy.location("pathname").should("eq", "/onboarding");
  });
});
