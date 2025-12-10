describe("Onboarding Flow - First Step Rendering", () => {
  const fakeAuth = () => {
    cy.resetAppState();

    cy.visit("/onboarding", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", "dummy-token");
        win.localStorage.setItem("email", "vendor@example.com");
        win.localStorage.setItem("userId", "stub-user-id");
      },
    });
  };

  it("renders onboarding Step 1 (Goal) and onboarding shell correctly", () => {
    fakeAuth();

    // Main container
    cy.get("[data-cy=onboarding-container]").should("exist");

    // First step
    cy.get("[data-cy=step-goal]").should("exist");

    // Progress bar
    cy.get("[data-cy=progress-bar]").should("be.visible");
    cy.contains("Goal").should("be.visible");

    // Goal cards
    cy.get("[data-cy=goal-card-find-job]").should("exist");
    cy.get("[data-cy=goal-card-grow-business]").should("exist");
    cy.get("[data-cy=goal-card-showcase-work]").should("exist");
    cy.get("[data-cy=goal-card-attract-clients]").should("exist");

    // Resume upload section
    cy.get("[data-cy=resume-upload-section]").should("exist");
  });
});
