describe("Profile - Billing Section", () => {
  const TEST_EMAIL = "hello@fusionflavors.com";
  const TEST_PASSWORD = "Test@123";

  beforeEach(() => {
    cy.resetAppState();

    cy.apiLogin(TEST_EMAIL, TEST_PASSWORD);

    cy.visit("/profile");

    // Navigate to Billing tab
    cy.contains("button", "Billing").click();
  });

  it("renders the Billing section header", () => {
    cy.contains("Billing").should("be.visible");
  });

  it("renders all pricing plans", () => {
    cy.contains("Free").should("be.visible");
    cy.contains("Basic").should("be.visible");
    cy.contains("Pro").should("be.visible");
  });

  it("renders plan prices", () => {
    cy.contains("$0").should("be.visible");
    cy.contains("$10").should("be.visible");
    cy.contains("$20").should("be.visible");
  });

  it("renders plan descriptions", () => {
    cy.contains("Get started with essential features").should("be.visible");
    cy.contains("Perfect for individuals getting started").should("be.visible");
    cy.contains("Best for growing professionals").should("be.visible");
  });

  it("renders feature lists for each plan", () => {
    cy.contains("Basic analytics").should("be.visible");
    cy.contains("Unlimited projects").should("be.visible");
    cy.contains("Premium templates").should("be.visible");
  });

  it("renders CTA buttons for plans", () => {
    cy.contains("button", "Get Started").should("have.length.at.least", 1);
  });

  it("renders promotional badge on Basic plan", () => {
    cy.contains("Promotional Offer").should("be.visible");
    cy.contains("ends").should("be.visible");
  });
});
