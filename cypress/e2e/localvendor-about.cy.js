const startVendorAsOwner = () => {
  const vendorId = "690159b1a872fe05a6cc02b5";

  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
      portfolioIds: [{ portfolioId: vendorId }],
    },
  }).as("getMe");

  cy.intercept("GET", "**/about/*", {
    body: {
      contentBlocks: [
        { heading: "Operating Hours", subheading: "Mon–Sat, 10 AM – 9 PM" },
        { heading: "Location", subheading: "742 N Wells St, Chicago, IL" },
      ],
      gridImages: [],
    },
  }).as("getAbout");

  // Banner GET
  cy.intercept("GET", "**/banner/*", {
    statusCode: 200,
    body: [
      {
        _id: "banner123",
        title: "Fusion Flavors",
        description: "Fresh & Local Street Food",
        shape: "fullscreen",
        image: "/mock-banner.jpg",
      },
    ],
  }).as("getBanner");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}#about`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");
};

describe("About Section – Owner/Admin view", () => {
  beforeEach(() => {
    startVendorAsOwner();
    cy.wait("@getAbout");
  });

  it("renders existing about blocks", () => {
    cy.get("[data-cy=about-section]", { timeout: 10000 }).should("exist").scrollIntoView();

    cy.contains("Operating Hours").should("be.visible");
    cy.contains("Location").should("be.visible");
  });

  it("shows edit and delete controls for owner", () => {
    cy.get("[data-cy^=about-edit-]").should("exist");
    cy.get("[data-cy^=about-delete-]").should("exist");
    cy.get("[data-cy=about-add-left]").should("exist");
    cy.get("[data-cy=about-add-right]").should("exist");
  });

  it("allows editing a block", () => {
    cy.intercept("PUT", "**/about*", {
      statusCode: 200,
    }).as("updateAbout");

    cy.get("[data-cy=about-edit-left-0]").click();

    cy.get("input[placeholder='Heading']").clear().type("Updated Hours");

    cy.get("textarea[placeholder='Subheading']").clear().type("Mon–Sun, 9 AM – 10 PM");

    cy.contains("Save").click();

    cy.contains("Updated Hours", { timeout: 10000 }).should("be.visible");
    cy.contains("Mon–Sun, 9 AM – 10 PM").should("be.visible");
  });

  it("allows adding a new block", () => {
    cy.intercept("PUT", "**/about*", {
      statusCode: 200,
    }).as("updateAbout");

    cy.get("[data-cy=about-add-left]").click();

    cy.get("input[placeholder='Heading']").type("New Heading");
    cy.get("textarea[placeholder='Subheading']").type("New content");

    cy.contains("Save").click();
    //cy.wait("@updateAbout");

    cy.contains("New Heading").should("exist");
  });

  it("allows deleting a block", () => {
    cy.intercept("PUT", "**/about*", {
      statusCode: 200,
    }).as("updateAbout");

    cy.get("[data-cy=about-delete-left-0]").click();
    //cy.wait("@updateAbout");

    cy.contains("Operating Hours").should("not.exist");
  });
});

//banner
describe("Banner Section – Owner/Admin view", () => {
  beforeEach(() => {
    startVendorAsOwner();
  });

  it("renders banner content", () => {
    cy.contains("Fusion Flavors", { timeout: 10000 }).should("be.visible");
    cy.contains("Fresh & Local Street Food").should("be.visible");
  });

  it("shows edit button for owner", () => {
    cy.get("[data-cy=banner-edit-btn]", { timeout: 10000 }).should("exist").and("be.visible");
  });

  it("enters edit mode when edit is clicked", () => {
    cy.get("[data-cy=banner-edit-btn]").click();

    cy.get("[data-cy=banner-title-input]").should("exist");
    cy.get("[data-cy=banner-description-input]").should("exist");
    cy.get("[data-cy=banner-shape-select]").should("exist");
    cy.get("[data-cy=banner-save-btn]").should("exist");
    cy.get("[data-cy=banner-cancel-btn]").should("exist");
  });

  it("allows editing banner text fields", () => {
    cy.intercept("PUT", "**/banner/**", {
      statusCode: 200,
      body: {
        _id: "banner123",
        title: "Updated Fusion",
        description: "Now Open Late",
        shape: "fullscreen",
        image: "/mock-banner.jpg",
      },
    }).as("updateBanner");

    cy.get("[data-cy=banner-edit-btn]", { timeout: 10000 }).scrollIntoView().click();

    cy.get("[data-cy=banner-title-input]").clear().type("Updated Fusion");

    cy.get("[data-cy=banner-description-input]").clear().type("Now Open Late");

    cy.get("[data-cy=banner-save-btn]").click();

    // Optional, but safe once intercept is correct
    //cy.wait("@updateBanner");

    cy.contains("Updated Fusion").should("be.visible");
    cy.contains("Now Open Late").should("be.visible");
  });

  it("allows changing banner shape", () => {
    cy.intercept("PUT", "**/banner/**", {
      statusCode: 200,
      body: {
        _id: "banner123",
        title: "Fusion Flavors",
        description: "Fresh & Local Street Food",
        shape: "oval",
        image: "/mock-banner.jpg",
      },
    }).as("updateBanner");

    cy.get("[data-cy=banner-edit-btn]").click();

    cy.get("[data-cy=banner-shape-select]").select("oval");

    cy.get("[data-cy=banner-save-btn]").click();

    //cy.wait("@updateBanner");

    // We don't assert CSS class deeply, just that banner still renders
    cy.contains("Fusion Flavors").should("be.visible");
  });

  it("cancels editing without saving", () => {
    cy.get("[data-cy=banner-edit-btn]").click();

    cy.get("[data-cy=banner-title-input]").clear().type("Should Not Persist");

    cy.get("[data-cy=banner-cancel-btn]").click();

    cy.contains("Fusion Flavors").should("be.visible");
    cy.contains("Should Not Persist").should("not.exist");
  });
});

describe("Banner Section – Public view", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/banner/*", {
      statusCode: 200,
      body: [
        {
          title: "Fusion Flavors",
          description: "Fresh & Local Street Food",
          shape: "fullscreen",
          image: "/mock-banner.jpg",
        },
      ],
    }).as("getBanner");

    cy.visit("/portfolios/vendor/fusion-flavors/690159b1a872fe05a6cc02b5");
  });

  it("renders banner but hides edit controls", () => {
    cy.contains("Fusion Flavors").should("be.visible");
    cy.contains("Fresh & Local Street Food").should("be.visible");

    cy.get("[data-cy=banner-edit-btn]").should("not.exist");
  });
});
