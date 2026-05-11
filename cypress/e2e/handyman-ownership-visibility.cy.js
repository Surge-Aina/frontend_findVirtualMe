/// <reference types="cypress" />

describe("Handyman ownership and visibility", () => {
  const templateId = "hm-owner-visibility-1";
  const ownerId = "owner-123";
  const nonOwnerId = "nonowner-999";

  const template = {
    _id: templateId,
    userId: ownerId,
    hero: { title: "Owner Guard", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
    services: [{ icon: "repair", title: "Repairs", description: "desc" }],
    servicesSectionTitle: "Services",
    servicesSectionIntro: "Intro",
    portfolioTitle: "Work",
    portfolioSubtitle: "sub",
    portfolioAllLabel: "All",
    processSteps: [{ number: 1, title: "Step", description: "desc" }],
    testimonials: [],
    contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
  };

  const editPath = `/portfolios/handyman/${templateId}/edit`;

  function stubTemplateAndProjects() {
    cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: template,
    }).as("getTemplate");

    cy.intercept("GET", "**/api/handyman/portfolio*", {
      statusCode: 200,
      body: [],
    }).as("getProjects");
  }

  function closeCookieIfPresent() {
    cy.get("body").then(($body) => {
      const bodyText = $body.text().toLowerCase();
      if (!bodyText.includes("cookie")) return;

      const candidates = [/accept/i, /agree/i, /ok/i, /got it/i, /close/i, /dismiss/i];

      for (const re of candidates) {
        const $btn = $body.find("button").filter((_, el) => re.test(el.innerText));
        if ($btn.length) {
          cy.wrap($btn.first()).click({ force: true });
          break;
        }
      }
    });
  }

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("shows the public owner banner for the portfolio owner", () => {
    stubTemplateAndProjects();
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          id: ownerId,
          _id: ownerId,
          email: "owner@test.com",
          name: "Owner",
          portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
        },
        id: ownerId,
        _id: ownerId,
        email: "owner@test.com",
        name: "Owner",
        portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
      },
    }).as("getMeOwner");

    cy.visit(`/portfolios/handyman/${templateId}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.wait("@getTemplate");
    cy.wait("@getProjects");
    cy.wait("@getMeOwner");
    cy.contains("You are viewing your portfolio.", { timeout: 8000 }).should("be.visible");
    cy.get(`a[href="${editPath}"]`, { timeout: 8000 }).should("be.visible").click();
    cy.location("pathname", { timeout: 8000 }).should("eq", editPath);
  });

  it("does not show the edit banner to guests", () => {
    stubTemplateAndProjects();

    cy.visit(`/portfolios/handyman/${templateId}`, {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });

    cy.wait("@getTemplate");
    cy.wait("@getProjects");
    cy.get(`a[href="${editPath}"]`).should("not.exist");
  });

  it("redirects a non-owner away from the edit page", () => {
    stubTemplateAndProjects();

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: nonOwnerId,
          id: nonOwnerId,
          email: "nonowner@test.com",
          name: "Non Owner",
          portfolios: [],
        },
      },
    }).as("getMe");

    cy.visit(editPath, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-nonowner");
      },
    });

    cy.wait("@getTemplate");
    cy.wait("@getMe");
    cy.contains("You do not have permission to edit this portfolio.").should("be.visible");
    cy.location("pathname").should("eq", `/portfolios/handyman/${templateId}`);
  });

  it("shows handyman portfolios on the dashboard for an authenticated user", () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: "admin-e2e",
          email: "admin@test.com",
          role: "admin",
          name: "Admin",
          portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
        },
        portfolioIds: [{ portfolioId: templateId, portfolioType: "Handyman" }],
      },
    }).as("getMe");

    cy.intercept("GET", "**/api/portfolios/mine", {
      statusCode: 200,
      body: {
        portfolios: [
          {
            _id: templateId,
            template: "handyman",
            title: "My Handyman Portfolio",
            portfolioType: "Handyman",
            visibility: "private",
          },
        ],
      },
    }).as("getMine");

    cy.intercept("GET", "**/api/portfolios/public/list*", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicList");

    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "cypress-stub-admin-token");
        win.localStorage.setItem("email", "admin@test.com");
      },
    });

    cy.wait("@getMe");
    cy.wait("@getMine");
    cy.wait("@getPublicList");
    closeCookieIfPresent();

    cy.location("pathname", { timeout: 20000 }).should("eq", "/dashboard");
    cy.contains(/my portfolios/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/handyman/i).should("exist");
  });
});
