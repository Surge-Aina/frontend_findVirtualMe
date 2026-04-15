describe("Project Manager - Full Sign Up + Onboarding", () => {
  const unique = Date.now();
  const newUser = {
    firstName: "Allan",
    lastName: "Walker",
    email: `allan_${unique}@example.com`,
    password: "StrongPass123!",
    username: `allan_${unique}`,
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("creates user through onboarding", () => {
    cy.intercept("POST", "**/api/users", {
      statusCode: 201,
      body: {
        user: {
          _id: "pm-signup-user-1",
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
          goal: "find-job",
          industry: "tech",
          experienceLevel: "entry",
          skills: ["javascript"],
          portfolios: [],
        },
      },
    }).as("signupRequest");

    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "pm-signup-token",
        user: {
          _id: "pm-signup-user-1",
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
          goal: "find-job",
          industry: "tech",
          experienceLevel: "entry",
          skills: ["javascript"],
          portfolios: [],
        },
        portfolioIds: [],
      },
    }).as("loginRequest");

    cy.intercept("POST", "**/api/portfolios", {
      statusCode: 201,
      body: {
        portfolio: {
          _id: "pm-portfolio-1",
          template: "projectManager",
          title: `${newUser.firstName} ${newUser.lastName}`,
        },
      },
    }).as("createPortfolio");

    cy.intercept("PATCH", "**/api/users/portfolio-id", {
      statusCode: 200,
      body: { ok: true },
    }).as("linkPortfolio");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: {
          _id: "pm-signup-user-1",
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
          goal: "find-job",
          industry: "tech",
          experienceLevel: "entry",
          skills: ["javascript"],
          portfolios: [{ portfolioId: "pm-portfolio-1", portfolioType: "ProjectManager" }],
        },
        portfolioIds: [{ portfolioId: "pm-portfolio-1", portfolioType: "ProjectManager" }],
      },
    }).as("getMe");

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
    cy.contains("Student / Entry Level").click();

    // Step 4 - Skills
    cy.get("[data-cy=skill-javascript]").click();
    cy.get("[data-cy=skills-continue]").click();

    // Step 5 - User Info
    cy.get("#firstName").type(newUser.firstName);
    cy.get("#lastName").type(newUser.lastName);
    cy.get("#email").clear().type(newUser.email);
    cy.get("#password").type(newUser.password);
    cy.get("#username").type(newUser.username);

    cy.clock();
    cy.contains("Complete Setup").click();
    cy.wait("@signupRequest");
    cy.wait("@loginRequest");
    cy.tick(4000);

    cy.location("pathname", { timeout: 10000 }).should("include", "/onboarding_info");

    cy.contains("Choose a Template").should("be.visible");
    cy.contains("Product Manager").click();
    cy.wait("@createPortfolio");
    cy.wait("@linkPortfolio");
    cy.wait("@getMe");

    cy.location("pathname", { timeout: 10000 }).should((path) => {
      expect(path).to.eq("/portfolios/view/pm-portfolio-1/edit");
    });
  });
});
