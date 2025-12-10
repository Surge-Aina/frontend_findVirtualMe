describe("Onboarding - Multi-step progression and validation", () => {
  const startOnboarding = () => {
    cy.visit("/onboarding", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", "dummy-token");
        win.localStorage.setItem("email", "vendor@example.com");
        win.localStorage.setItem("userId", "test-user-id");
      },
    });
  };

  it("user can progress through steps (normal path)", () => {
    startOnboarding();

    cy.get("[data-cy=step-goal]").should("exist");
    cy.get("[data-cy=goal-card-find-job]").click();

    cy.get("[data-cy=step-industry]").should("exist");
    cy.get("[data-cy=industry-tech]").click();

    cy.get("[data-cy=step-experience]").should("exist");
    cy.contains("Entry").click();

    cy.get("[data-cy=step-skills]").should("exist");

    cy.get("[data-cy=skill-javascript]").click();
    cy.get("[data-cy=skills-continue]").should("not.be.disabled").click();

    cy.get("[data-cy=step-userInfo]").should("exist");
  });

  it("shows validation errors in UserInfoForm and blocks progression", () => {
    startOnboarding();

    cy.get("[data-cy=goal-card-find-job]").click();
    cy.get("[data-cy=industry-design]").click();

    cy.get("[data-cy=skill-branding]").click();

    cy.get("[data-cy=skills-continue]").should("not.be.disabled").click();

    cy.get("[data-cy=step-userInfo]").should("exist");

    cy.contains("Complete Setup").click();

    cy.contains("First name is required").should("exist");
    cy.contains("Last name is required").should("exist");
    cy.contains("Email is required").should("exist");
    cy.contains("Password is required").should("exist");
    cy.contains("Username is required").should("exist");

    cy.get("#firstName").type("Test");
    cy.get("#lastName").type("User");
    cy.get("#password").type("Password123");
    cy.get("#username").type("testuser");

    // Now test invalid email
    cy.get("#email").type("invalid-email");
    cy.contains("Complete Setup").click();

    cy.get("#email").then(($input) => {
      const msg = $input[0].validationMessage;
      expect(msg).to.contain("include an '@'");
    });
  });

  it("submits successfully when fields are valid", () => {
    startOnboarding();

    cy.get("[data-cy=goal-card-find-job]").click();
    cy.get("[data-cy=industry-design]").click();
    cy.get("[data-cy=step-skills]").should("exist");

    // --- FIXED: Select same design skill ---
    cy.get("[data-cy=skill-branding]").click();
    cy.get("[data-cy=skills-continue]").should("not.be.disabled").click();

    cy.get("#firstName").type("Alice");
    cy.get("#lastName").type("Walker");
    cy.get("#email").clear().type("alice@example.com");
    cy.get("#password").type("StrongPass123");
    cy.get("#username").type("alicewalker");

    cy.intercept("POST", "**/user/addUser", {
      statusCode: 200,
      body: { success: true, user: { email: "alice@example.com" } },
    }).as("addUserStub");

    cy.contains("Complete Setup").click();

    cy.wait("@addUserStub");
  });
});
