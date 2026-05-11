describe("FE-E2E-HM-ADMIN-2 — Portfolio Edit Logs & Audit Trail", () => {
  const templateId = "hm-audit-1";
  const ownerId = "admin-stub-id";
  const ownerEmail = "admin@test.com";
  let logs;

  const resetLogs = () => {
    logs = [
      {
        _id: "log-created",
        action: "created",
        userId: ownerId,
        name: "Admin User",
        email: ownerEmail,
        portfolioID: templateId,
        portfolioType: "handyman",
        sessionId: "session-created",
        mouseInfo: [{ x: 10, y: 20, event: "click", element: "BUTTON", timestamp: new Date().toISOString() }],
        timestamp: new Date().toISOString(),
      },
    ];
  };

  beforeEach(() => {
    resetLogs();

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        _id: ownerId,
        id: ownerId,
        user: {
          _id: ownerId,
          id: ownerId,
          email: ownerEmail,
          role: "admin",
          name: "Admin User",
          portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
        },
        portfolioIds: [{ portfolioId: templateId, portfolioType: "Handyman" }],
      },
    }).as("apiUserMe");

    cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Trusted Handyman", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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
    }).as("handymanTemplate");

    cy.intercept("GET", "**/api/handyman/portfolio*", {
      statusCode: 200,
      body: [],
    }).as("handymanPortfolio");

    cy.intercept("PUT", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: { ok: true },
    }).as("saveTemplate");

    cy.intercept("POST", "**/api/portfolios/edit-log", (req) => {
      logs.push({
        _id: "log-updated",
        action: "updated",
        userId: ownerId,
        name: "Admin User",
        email: ownerEmail,
        portfolioID: templateId,
        portfolioType: "handyman",
        sessionId: "session-updated",
        mouseInfo: [{ x: 30, y: 40, event: "click", element: "INPUT", timestamp: new Date().toISOString() }],
        timestamp: new Date().toISOString(),
      });
      req.reply({ statusCode: 201, body: { success: true } });
    }).as("editLog");

    cy.intercept("GET", "**/api/portfolios/edit-log?page=1&limit=50", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          logs: [...logs],
          totalPages: 1,
        },
      });
    }).as("fetchLogs");
  });

  it("creates then updates a handyman portfolio and confirms both log entries", () => {
    cy.visit(`/portfolios/handyman/${templateId}/edit`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "admin-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });

    cy.wait("@handymanTemplate");
    cy.wait("@apiUserMe");
    cy.wait("@handymanPortfolio");
    cy.contains(/edit your handyman portfolio/i).should("be.visible");

    cy.get('input[name="hero.title"]').clear().type("Trusted Handyman updated by Cypress");
    cy.contains("button", /save changes/i).click({ force: true });

    cy.wait("@saveTemplate");
    cy.wait("@editLog");
    cy.visit("/admin-choice", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "admin-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });

    cy.wait("@apiUserMe");
    cy.contains("button", /^logs$/i).click();
    cy.wait("@fetchLogs");

    cy.contains(/portfolio edit logs/i).should("be.visible");
    cy.get("table").within(() => {
      cy.contains("tr", /created/i).should("exist");
      cy.contains("tr", /updated/i).should("exist");
    });

    cy.get("table").contains("tr", /updated/i).within(() => {
      cy.contains(/view/i).click();
    });

    cy.contains(/log details/i).should("be.visible");
    cy.contains(/mouse events/i).should("be.visible");
    cy.contains(/portfolio id/i).should("be.visible");
  });
});
