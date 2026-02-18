describe("Profile Information", () => {
  const TEST_EMAIL = "hello@fusionflavors.com";
  const TEST_PASSWORD = "Test@123";

  beforeEach(() => {
    cy.resetAppState();

    cy.apiLogin(TEST_EMAIL, TEST_PASSWORD).then((res) => {
      cy.window().then((win) => {
        win.localStorage.setItem("token", res.token);
        win.localStorage.setItem("auth_user", JSON.stringify(res.user));
      });
    });

    cy.visit("/profile");
  });

  /**
   * VIEW MODE
   */
  it("renders all profile fields with values", () => {
    cy.contains("h2", "Personal Information").should("be.visible");

    const fields = ["First Name", "Last Name", "Username", "Email", "Bio", "Location", "Website"];

    fields.forEach((label) => {
      cy.contains("label", label).should("be.visible").parent().find("div, input").should("exist");
    });
  });

  it("shows user profile information", () => {
    cy.contains("label", "First Name").parent().find("input, div").should("contain.text", "FusionUpdated");

    cy.contains("label", "Last Name").parent().find("input, div").should("contain.text", "Flavors");

    cy.contains("label", "Email").parent().find("input, div").should("contain.text", "hello@fusionflavors.com");

    cy.contains("label", "Location").parent().find("input, div").should("contain.text", "New York, NY");
  });

  /**
   * EDIT MODE
   */
  it("allows user to enter edit mode", () => {
    cy.contains("button", "Edit").click();

    cy.get('input[name="firstName"]').should("be.enabled");
    cy.get('input[name="lastName"]').should("be.enabled");
    cy.get('input[name="email"]').should("be.enabled");

    cy.contains("button", "Save Changes").should("be.visible");
  });

  it("allows user to modify profile fields", () => {
    cy.contains("button", "Edit").click();

    cy.get('input[name="firstName"]').clear().type("FusionUpdated");

    cy.get('input[name="location"]').clear().type("New York, NY");

    cy.contains("button", "Save Changes").should("not.be.disabled");
  });

  /**
   * SAVE + PERSISTENCE
   */
  it("persists updated profile data after save and page refresh", () => {
    cy.intercept("PATCH", "**/user/updateUser").as("updateProfile");

    cy.contains("button", "Edit").click();

    cy.get('input[name="firstName"]').clear().type("FusionUpdated");
    cy.get('input[name="location"]').clear().type("New York, NY");

    cy.contains("button", "Save Changes").click();

    cy.wait("@updateProfile");

    cy.contains("FusionUpdated Flavors").should("be.visible");
    cy.contains("New York, NY").should("be.visible");

    cy.reload();

    cy.contains("FusionUpdated Flavors").should("be.visible");
    cy.contains("New York, NY").should("be.visible");
  });

  /**
   * CANCEL EDIT
   */
  it("reverts changes when edit is cancelled", () => {
    cy.contains("button", "Edit").click();

    cy.get('input[name="firstName"]').clear().type("SHOULD_NOT_SAVE");

    cy.contains("button", "Cancel").click();

    cy.contains("SHOULD_NOT_SAVE").should("not.exist");
    cy.contains("FusionUpdated Flavors").should("be.visible");
  });
});
