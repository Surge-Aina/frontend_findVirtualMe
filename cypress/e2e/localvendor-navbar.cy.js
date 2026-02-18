const vendorId = "690159b1a872fe05a6cc02b5";
it("shows Manage Tags for vendor owner", () => {
  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
    },
  }).as("getMe");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");

  cy.contains("Manage Tags").should("be.visible");
});

it("hides Manage Tags for public users", () => {
  cy.intercept("GET", "**/user/me", {
    body: { user: null },
  });

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`);

  cy.contains("Manage Tags").should("not.exist");
});

it("hides Manage Tags in mobile menu for public users", () => {
  cy.viewport("iphone-8");

  // Public user (not vendor owner)
  cy.intercept("GET", "**/user/me", {
    body: { user: null },
  });

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`);

  // Open mobile menu
  cy.get('[data-testid="vendor-navbar"]').find('[data-testid="vendor-mobile-menu-toggle"]').click();

  // Manage Tags should not exist at all
  cy.get('[data-testid="manage-tags"]').should("not.exist");
});

it("shows Manage Tags in mobile menu for owner", () => {
  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
    },
  }).as("getMe");

  cy.viewport("iphone-8");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");

  // Only interact with LOCAL vendor navbar
  cy.get('[data-testid="vendor-navbar"]').find('[data-testid="vendor-mobile-menu-toggle"]').click();

  cy.get('[data-testid="manage-tags"]').scrollIntoView().should("be.visible").and("contain.text", "Manage Tags");
});
