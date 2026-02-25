describe("Project Manager - Education Card", () => {
  before(() => {
    cy.ensurePMUserExists();
    cy.loginPMUser().then(() => {
      cy.ensurePMPortfolio();
    });
  });

  beforeEach(() => {
    const portfolioId = Cypress.env("pmPortfolioId");
    cy.visit(`/portfolios/ProjectManager/${portfolioId}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", Cypress.env("pmToken"));
      },
    });

    cy.viewport(1280, 900);
    cy.get('[data-testid="tab-education"]').click();
  });

  it("does not show owner controls for non-owner", () => {
    const portfolioId = Cypress.env("pmPortfolioId");

    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit(`/portfolios/ProjectManager/${portfolioId}`);
    cy.get('[data-testid="tab-education"]').click();

    cy.get('[data-testid="add-education-btn"]').should("not.exist");
    cy.get('[data-testid="edit-education-btn"]').should("not.exist");
  });

  it("renders education card", () => {
    cy.get('[data-testid="education-card"]').should("be.visible");
  });

  it("cancels add mode", () => {
    cy.get('[data-testid="add-education-btn"]').first().click();
    cy.get('[data-testid="education-school-input"]').type("Temp");

    cy.get('[data-testid="cancel-add-education-btn"]').should("be.visible").click({ force: true });

    cy.get('[data-testid="submit-education-btn"]').should("not.exist");
  });

  it("shows empty state when no education entries exist", () => {
    cy.contains("No education entries yet").should("be.visible");
  });

  it("adds new education entry", () => {
    cy.intercept("GET", "**/portfolio/id/**").as("getPortfolio");

    cy.get('[data-testid="add-education-btn"]').first().click();

    cy.get('[data-testid="education-school-input"]').type("University of Illinois");

    cy.get('[data-testid="education-field-input"]').type("Computer Science");

    cy.get('[data-testid="education-start-input"]').type("2020-01-01");

    cy.get('[data-testid="education-end-input"]').type("2022-01-01");

    cy.get('[data-testid="education-description-input"]').type("Graduate program");

    cy.get('[data-testid="education-degrees-input"]').type("MS");

    cy.get('[data-testid="education-awards-input"]').type("Dean List");

    cy.get('[data-testid="submit-education-btn"]')
      .should("exist")
      .should("be.visible")
      .should("not.be.disabled")
      .click();

    //cy.wait("@getPortfolio");

    cy.contains("University of Illinois").should("be.visible");

    cy.contains("MS").should("be.visible");
    cy.contains("Dean List").should("be.visible");
  });

  it("edits an existing education entry", () => {
    cy.intercept("PATCH", "**/portfolio/edit").as("editPortfolio");

    // Add entry first
    cy.get('[data-testid="add-education-btn"]').first().click();

    cy.get('[data-testid="education-school-input"]').type("Temp School");
    cy.get('[data-testid="submit-education-btn"]').click();

    cy.wait("@editPortfolio");

    // Ensure it rendered
    cy.contains("Temp School").should("be.visible");

    // Now edit
    cy.get('[data-testid="edit-education-btn"]').first().click();

    cy.get('[data-testid="education-school-input"]').clear().type("Updated School");

    cy.get('[data-testid="save-education-btn"]').click();

    //cy.wait("@editPortfolio");

    cy.contains("Updated School").should("be.visible");
  });

  it("deletes education entry", () => {
    cy.intercept("PATCH", "**/portfolio/edit").as("editPortfolio");

    // Add entry first
    cy.get('[data-testid="add-education-btn"]').first().click();

    cy.get('[data-testid="education-school-input"]').type("Delete School");
    cy.get('[data-testid="submit-education-btn"]').click();

    //cy.wait("@editPortfolio");

    cy.contains("Delete School").should("be.visible");

    // Edit mode
    cy.contains("Delete School")
      .closest("div[class*='rounded-xl']")
      .within(() => {
        cy.get('[data-testid="edit-education-btn"]').click();
      });

    cy.get('[data-testid="delete-education-btn"]').click();

    //cy.wait("@editPortfolio");

    cy.contains("Delete School").should("not.exist");
  });

  it("renders comma separated degrees as badges", () => {
    const school = `Degree ${Date.now()}`;

    cy.get('[data-testid="add-education-btn"]').first().click();

    cy.get('[data-testid="education-school-input"]').type(school);
    cy.get('[data-testid="education-degrees-input"]').type("MS, MBA");
    cy.get('[data-testid="submit-education-btn"]').click();

    cy.contains(school)
      .closest('[data-testid="education-entry"]')
      .within(() => {
        cy.contains("MS").should("be.visible");
        cy.contains("MBA").should("be.visible");
      });
  });

  it("persists after reload", () => {
    cy.get('[data-testid="add-education-btn"]').first().click();
    cy.get('[data-testid="education-school-input"]').type("Persistent School");
    cy.get('[data-testid="submit-education-btn"]')
      .should("exist")
      .should("be.visible")
      .should("not.be.disabled")
      .click();

    cy.reload();

    cy.get('[data-testid="tab-education"]').click();

    cy.contains("Persistent School").should("be.visible");
  });
});
