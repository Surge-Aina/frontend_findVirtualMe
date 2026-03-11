describe("Account Settings", () => {
  const TEST_EMAIL = "hello@fusionflavors.com";
  const TEST_PASSWORD = "Test@123";

  //At a code level, the toggle only controls local React state that updates UI styles and helper text.
  //  It does not persist, call the backend, or affect portfolio visibility yet.
  beforeEach(() => {
    cy.resetAppState();

    cy.apiLogin(TEST_EMAIL, TEST_PASSWORD).then((res) => {
      cy.window().then((win) => {
        win.localStorage.setItem("token", res.token);
        win.localStorage.setItem("auth_user", JSON.stringify(res.user));
      });
    });

    cy.visit("/profile");

    // Navigate via sidebar like a real user
    cy.contains("button", "Account Settings").click();
  });

  it("renders Account Settings page", () => {
    cy.contains("h2", "Account Settings").should("be.visible");
    cy.contains("Manage your account preferences and privacy settings.").should("be.visible");
  });

  it("shows Privacy Settings section", () => {
    cy.contains("h3", "Privacy Settings").should("be.visible");
    cy.contains("Portfolio Visibility").should("be.visible");
  });

  it("shows portfolio visibility as enabled by default", () => {
    cy.contains("Your portfolios are currently visible to everyone").should("be.visible");
  });

  it("allows user to toggle portfolio visibility off", () => {
    // Click the toggle
    cy.contains("Portfolio Visibility").parent().parent().find("button").click();

    cy.contains(" Your portfolios are currently private").should("be.visible");
  });

  it("allows user to toggle portfolio visibility back on", () => {
    // Turn off
    cy.contains("Portfolio Visibility").parent().parent().find("button").click();

    cy.contains(" Your portfolios are currently private").should("be.visible");

    // Turn back on
    cy.contains("Portfolio Visibility").parent().parent().find("button").click();

    cy.contains("Your portfolios are currently visible to everyone").should("be.visible");
  });
});
