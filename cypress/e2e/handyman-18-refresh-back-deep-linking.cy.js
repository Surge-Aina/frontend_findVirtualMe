    // cypress/e2e/handyman-18-refresh-back-deep-linking.cy.js

describe("FE-E2E-HM-EDGE-3 — Refresh, Back Button & Deep Linking", () => {
  const templateId = "hm-edge-1";
  const ownerId = "hm-edge-owner";
  const ownerEmail = "hm-edge-owner@example.com";

  const stubOwnerApi = () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: ownerId,
          email: ownerEmail,
          name: "Edge Owner",
          portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
        },
      },
    }).as("getMe");

    cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Trusted Handyman", subtitle: "Quality craftsmanship", phoneNumber: "(111) 111-1111" },
        services: [{ icon: "repair", title: "Repairs", description: "desc" }],
        servicesSectionTitle: "Services",
        servicesSectionIntro: "Intro",
        portfolioTitle: "Work",
        portfolioSubtitle: "sub",
        portfolioAllLabel: "All",
        processSteps: [{ number: 1, title: "Step", description: "desc" }],
        testimonials: [],
        contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
      },
    }).as("getTemplate");

    cy.intercept("GET", "**/api/handyman/portfolio*", {
      statusCode: 200,
      body: [],
    }).as("getProjects");
  };

  it("handles refresh, back button, and deep links for Handyman showcase, live, and edit routes", () => {
    cy.visit("/portfolios");
    cy.contains(/handyman\s*\/\s*local repair services/i).click();

    cy.url({ timeout: 15000 }).should("include", "/portfolios/handyman");
    cy.contains(/trusted handyman|quality craftsmanship/i, { matchCase: false, timeout: 15000 }).should("exist");

    cy.reload();
    cy.url().should("include", "/portfolios/handyman");
    cy.contains(/trusted handyman|quality craftsmanship/i, { matchCase: false, timeout: 15000 }).should("exist");

    cy.go("back");
    cy.url({ timeout: 15000 }).should("include", "/portfolios");
    cy.contains(/handyman\s*\/\s*local repair services/i).should("exist");

    cy.go("forward");
    cy.url({ timeout: 15000 }).should("include", "/portfolios/handyman");
    cy.contains(/trusted handyman|quality craftsmanship/i, { matchCase: false, timeout: 15000 }).should("exist");

    stubOwnerApi();

    const liveUrl = `/portfolios/handyman/${templateId}`;
    const editUrl = `${liveUrl}/edit`;

    cy.visit(liveUrl, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "hm-edge-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });

    cy.wait("@getTemplate");
    cy.wait("@getProjects");
    cy.wait("@getMe");
    cy.contains(/trusted handyman|quality craftsmanship/i, { matchCase: false, timeout: 20000 }).should("exist");
    cy.contains(/click here to edit/i).should("be.visible");

    cy.reload();
    cy.url().should("eq", `${Cypress.config("baseUrl")}${liveUrl}`);
    cy.contains(/click here to edit/i).should("be.visible");

    cy.visit(editUrl, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "hm-edge-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });
    cy.wait("@getTemplate");
    cy.wait("@getProjects");
    cy.wait("@getMe");
    cy.contains(/edit your handyman portfolio/i, { timeout: 20000 }).should("be.visible");
    cy.get('input[name="hero.title"]').should("exist");

    cy.reload();
    cy.url().then((currentUrl) => {
      if (currentUrl.endsWith("/edit")) {
        cy.contains(/edit your handyman portfolio/i).should("be.visible");
        cy.get('input[name="hero.title"]').should("exist");
      } else {
        expect(currentUrl).to.eq(`${Cypress.config("baseUrl")}${liveUrl}`);
        cy.contains(/click here to edit/i).should("be.visible");
      }
    });
  });
});
