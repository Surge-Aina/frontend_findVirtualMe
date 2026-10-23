describe("Project Manager - Experience Card", () => {
  const portfolioId = "pm-experience-e2e";
  const ownerEmail = "pm-owner@example.com";
  let serverPortfolio;

  const initServerPortfolio = () => {
    serverPortfolio = {
      _id: portfolioId,
      id: portfolioId,
      portfolioType: "projectManager",
      email: ownerEmail,
      name: "PM Owner",
      experiences: [],
    };
  };

  const stubPortfolioApi = () => {
    cy.intercept("GET", "**/portfolio/id/*", (req) => {
      req.reply({
        statusCode: 200,
        body: serverPortfolio,
      });
    }).as("getPortfolio");

    cy.intercept("PATCH", "**/portfolio/edit", (req) => {
      const incoming = req.body?.portfolio || {};
      serverPortfolio = {
        ...serverPortfolio,
        ...incoming,
        experiences: incoming.experiences || serverPortfolio.experiences,
      };

      req.reply({
        statusCode: 200,
        body: serverPortfolio,
      });
    }).as("savePortfolio");
  };

  const stubOwnerSession = () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: "pm-owner-1",
          email: ownerEmail,
          role: "USER",
          portfolios: [{ portfolioId, portfolioType: "ProjectManager" }],
        },
      },
    }).as("getUser");
  };

  beforeEach(() => {
    initServerPortfolio();
    stubOwnerSession();
    stubPortfolioApi();

    cy.visit(`/portfolios/ProjectManager/${portfolioId}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "pm-experience-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });
    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    cy.viewport(1280, 900);
    cy.get('[data-testid="tab-experience"]').click();
  });

  it("renders experience card", () => {
    cy.get('[data-testid="experience-card"]').should("be.visible");
  });

  it("shows empty state when no experience exists", () => {
    cy.contains("No experience entries yet").should("be.visible");
  });

  it("does not show owner controls for non-owner", () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: "pm-guest-1",
          email: "guest@example.com",
          role: "USER",
          portfolios: [],
        },
      },
    }).as("getGuestUser");

    cy.visit(`/portfolios/ProjectManager/${portfolioId}`);
    cy.wait("@getGuestUser");
    cy.wait("@getPortfolio");
    cy.get('[data-testid="tab-experience"]').click();

    cy.get('[data-testid="add-experience-btn"]').should("not.exist");
    cy.get('[data-testid="edit-experience-btn"]').should("not.exist");
    cy.get('[data-testid="delete-experience-btn"]').should("not.exist");
  });

  it("adds new experience entry", () => {
    cy.get('[data-testid="add-experience-btn"]').first().click();

    cy.get('[data-testid="experience-title-input"]').type("Software Engineer");
    cy.get('[data-testid="experience-company-input"]').type("Google");
    cy.get('[data-testid="experience-start-input"]').type("2020-01-01");
    cy.get('[data-testid="experience-end-input"]').type("2022-01-01");
    cy.get('[data-testid="experience-location-input"]').type("Chicago");
    cy.get('[data-testid="experience-description-input"]').type("Worked on scalable systems.");

    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.contains("Software Engineer").should("be.visible");
    cy.contains("Google").should("be.visible");
  });

  it("cancels add mode", () => {
    cy.get('[data-testid="add-experience-btn"]').first().click();

    cy.get('[data-testid="experience-title-input"]').type("Temp");

    cy.get('[data-testid="cancel-add-experience-btn"]').click({ force: true });

    cy.get('[data-testid="submit-experience-btn"]').should("not.exist");
  });

  it("edits an existing experience entry", () => {
    // Pre-add
    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type("Temp Role");
    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.contains("Temp Role")
      .parents('[data-testid="experience-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="edit-experience-btn"]').first().click();
      });

    cy.get('[data-testid="experience-title-input"]').clear().type("Updated Role");

    cy.get('[data-testid="save-experience-btn"]').click();

    cy.contains("Updated Role").should("be.visible");
  });

  it("cancels edit without saving", () => {
    const role = `Cancel ${Date.now()}`;

    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type(role);
    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.contains(role)
      .closest('[data-testid="experience-entry"]')
      .within(() => {
        cy.get('[data-testid="edit-experience-btn"]').click();
      });

    cy.get('[data-testid="experience-title-input"]').clear().type("Changed");

    cy.get('[data-testid="cancel-experience-btn"]').click();

    cy.contains(role).should("be.visible");
    cy.contains("Changed").should("not.exist");
  });

  it("deletes experience entry", () => {
    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type("Delete Role");
    cy.get('[data-testid="submit-experience-btn"]').click();

    // Scope to the correct card
    cy.contains("Delete Role")
      .closest("div[class*='rounded-xl']")
      .within(() => {
        cy.get('[data-testid="edit-experience-btn"]').click();
      });

    cy.get('[data-testid="delete-experience-btn"]').click();

    cy.contains("Delete Role").should("not.exist");
  });

  it("renders Present when no end date", () => {
    const role = `Present ${Date.now()}`;

    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type(role);
    cy.get('[data-testid="experience-start-input"]').type("2022-01-01");
    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.contains(role)
      .closest('[data-testid="experience-entry"]')
      .within(() => {
        cy.contains("Present").should("be.visible");
      });
  });

  it("does not render location when empty", () => {
    const role = `NoLocation ${Date.now()}`;

    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type(role);
    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.contains(role)
      .closest('[data-testid="experience-entry"]')
      .within(() => {
        cy.contains("📍").should("not.exist");
      });
  });

  it("persists after reload", () => {
    cy.get('[data-testid="add-experience-btn"]').first().click();
    cy.get('[data-testid="experience-title-input"]').type("Persistent Role");
    cy.get('[data-testid="submit-experience-btn"]').click();

    cy.reload();
    cy.get('[data-testid="tab-experience"]').click();

    cy.contains("Persistent Role").should("be.visible");
  });
});
