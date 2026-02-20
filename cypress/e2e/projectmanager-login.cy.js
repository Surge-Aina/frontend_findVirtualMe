describe("Project Manager Login Modal - True UI Flow", () => {
  const TEST_EMAIL = "pm@test.com";
  const TEST_PASSWORD = "Test@123";

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");

    // Ensure navbar rendered
    cy.get('[data-testid="open-auth-modal"]', { timeout: 10000 }).should("be.visible").click({ force: true });

    // Ensure modal is open
    cy.get('[data-testid="backdrop"]').should("exist");
  });

  it("renders login modal correctly", () => {
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.contains("Sign In").should("be.visible");
    cy.contains("Sign Up").should("be.visible");
  });

  it("shows error on invalid credentials", () => {
    cy.get("#email").type("wrong@example.com");
    cy.get("#password").type("wrongpass");

    cy.contains("Sign In").click();

    cy.contains("Invalid Credentials").should("be.visible");
  });

  it("logs in successfully and redirects to profile", () => {
    cy.intercept("POST", "**/user/login").as("loginRequest");

    cy.get("#email").type(TEST_EMAIL);
    cy.get("#password").type(TEST_PASSWORD);

    cy.contains("Sign In").click();

    cy.wait("@loginRequest");

    cy.url().should("include", "/profile");
  });

  it("navigates to onboarding when Sign Up clicked", () => {
    cy.contains("Sign Up").click();
    cy.url().should("include", "/onboarding");
  });
});
