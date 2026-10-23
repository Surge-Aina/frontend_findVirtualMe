describe("Project Manager - Projects Card", () => {
  const portfolioId = "pm-projects-e2e";
  const ownerEmail = "pm-owner@example.com";
  let serverPortfolio;

  const initServerPortfolio = () => {
    serverPortfolio = {
      _id: portfolioId,
      id: portfolioId,
      portfolioType: "projectManager",
      email: ownerEmail,
      name: "PM Owner",
      projects: [],
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
        projects: incoming.projects || serverPortfolio.projects,
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
        win.localStorage.setItem("token", "pm-projects-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });

    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    cy.viewport(1280, 900);
    cy.get('[data-testid="tab-projects"]').click();
  });

  it("does not show add/edit buttons for non-owner", () => {
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
    cy.viewport(1280, 900);
    cy.wait("@getGuestUser");
    cy.wait("@getPortfolio");
    cy.get('[data-testid="tab-projects"]').click();

    cy.get('[data-testid="add-project-btn"]').should("not.exist");
    cy.get('[data-testid="edit-project-btn"]').should("not.exist");
  });

  it("renders projects card", () => {
    cy.get('[data-testid="projects-card"]').should("be.visible");
  });

  it("shows empty state when no projects exist", () => {
    cy.contains("No projects yet").should("be.visible");
  });

  it("adds new project", () => {
    cy.get('[data-testid="add-project-btn"]').first().click();

    cy.get('[data-testid="project-name-input"]').type("AI Portfolio");
    cy.get('[data-testid="project-description-input"]').type("Built AI system.");
    cy.get('[data-testid="project-link-input"]').type("https://example.com");

    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("AI Portfolio").should("be.visible");
    cy.contains("Built AI system.").should("be.visible");
  });

  it("cancels edit mode without saving", () => {
    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type("Cancel Test");
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("Cancel Test")
      .closest("div[class*='rounded-xl']")
      .within(() => {
        cy.get('[data-testid="edit-project-btn"]').click();
      });

    cy.get('[data-testid="project-name-input"]').clear().type("Changed Name");
    cy.get('[data-testid="cancel-project-btn"]').click();

    cy.contains("Cancel Test").should("be.visible");
    cy.contains("Changed Name").should("not.exist");
  });

  it("renders project link correctly", () => {
    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type("Link Project");
    cy.get('[data-testid="project-link-input"]').type("https://example.com");
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("Link Project")
      .closest("div[class*='rounded-xl']")
      .find("a")
      .should("have.attr", "href", "https://example.com");
  });

  it("edits existing project", () => {
    // Pre-add
    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type("Temp Project");
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("Temp Project")
      .closest("div[class*='rounded-xl']")
      .within(() => {
        cy.get('[data-testid="edit-project-btn"]').click();
      });

    cy.get('[data-testid="project-name-input"]').clear().type("Updated Project");
    cy.get('[data-testid="save-project-btn"]').click();

    cy.contains("Updated Project").should("be.visible");
  });

  it("deletes project", () => {
    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type("Delete Project");
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("Delete Project")
      .closest("div[class*='rounded-xl']")
      .within(() => {
        cy.get('[data-testid="edit-project-btn"]').click();
      });

    cy.get('[data-testid="delete-project-btn"]').click();

    cy.contains("Delete Project").should("not.exist");
  });

  it("shows empty state again after deleting last project", () => {
    cy.clearAllProjects();
    const name = `Temp ${Date.now()}`;

    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type(name);
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains(name)
      .closest('[data-testid="project-card"]')
      .within(() => {
        cy.get('[data-testid="edit-project-btn"]').click();
      });

    cy.get('[data-testid="delete-project-btn"]').click();

    cy.contains("No projects yet").should("be.visible");
  });

  it("persists after reload", () => {
    cy.get('[data-testid="add-project-btn"]').first().click();
    cy.get('[data-testid="project-name-input"]').type("Persistent Project");
    cy.get('[data-testid="submit-project-btn"]').click();

    cy.contains("Persistent Project").should("be.visible");

    cy.reload();
    cy.get('[data-testid="tab-projects"]').click();

    cy.contains("Persistent Project").should("be.visible");
  });
});
