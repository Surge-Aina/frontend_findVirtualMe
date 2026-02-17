describe("Project Manager - Full Sign Up + Onboarding", () => {
  const unique = Date.now();
  const newUser = {
    firstName: "Allan",
    lastName: "Walker",
    email: `allan_${unique}@example.com`,
    password: "StrongPass123",
    username: `allan_${unique}`,
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("creates user through onboarding", () => {
    // Open modal
    cy.contains("Log in / Sign up").click({ force: true });

    // Go to onboarding
    cy.contains("button", "Sign Up").scrollIntoView().click({ force: true });

    cy.url().should("include", "/onboarding");

    // Step 1 - Goal
    cy.get("[data-cy=goal-card-find-job]").click();

    // Step 2 - Industry
    cy.get("[data-cy=industry-tech]").click();

    // Step 3 - Experience
    cy.contains("Entry").click();

    // Step 4 - Skills
    cy.get("[data-cy=skill-javascript]").click();
    cy.get("[data-cy=skills-continue]").click();

    // Step 5 - User Info
    cy.get("#firstName").type(newUser.firstName);
    cy.get("#lastName").type(newUser.lastName);
    cy.get("#email").clear().type(newUser.email);
    cy.get("#password").type(newUser.password);
    cy.get("#username").type(newUser.username);

    cy.contains("Complete Setup").click();

    cy.location("pathname", { timeout: 10000 }).should("include", "/onboarding_info");

    cy.contains("Choose a Template").should("be.visible");
    cy.contains("Product Manager").click();

    cy.location("pathname", { timeout: 10000 }).should((path) => {
      expect(path).to.match(/\/portfolios\/ProjectManager\/.+/);
    });
  });
});
