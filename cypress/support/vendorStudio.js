// cypress/support/vendorStudio.js

export const startVendorAsOwner = (options = {}) => {
  const vendorId = options.vendorId || "690159b1a872fe05a6cc02b5";
  const username = options.username || "fusion-flavors";

  // ---- AUTH: mock logged-in vendor ----
  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-user-id",
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
      portfolioIds: [{ portfolioId: vendorId }],
    },
  }).as("getMe");

  // ---- VENDOR CORE ----
  cy.intercept("GET", `**/vendor/${vendorId}/full`, {
    statusCode: 200,
    body: {
      _id: vendorId,
      name: "Fusion Flavors",
    },
  }).as("getVendor");

  // ---- ABOUT ----
  cy.intercept("GET", `**/about/${vendorId}`, {
    statusCode: 200,
    body: {
      contentBlocks: [
        {
          heading: "Operating Hours",
          subheading: "Mon–Sat, 10 AM – 9 PM",
        },
        {
          heading: "Location",
          subheading: "742 N Wells St, Chicago, IL",
        },
      ],
      gridImages: [],
    },
  }).as("getAbout");

  // ---- BANNER ----
  cy.intercept("GET", `**/banner/${vendorId}`, {
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

  // ---- GALLERY  ----
  cy.intercept("GET", `**/gallery/${vendorId}`, {
    statusCode: 200,
    body: [],
  }).as("getGallery");

  // ---- MENU  ----
  cy.intercept("GET", `**/menu/${vendorId}`, {
    statusCode: 200,
    body: [],
  }).as("getMenu");

  // ---- TAGGED / REVIEWS (safe no-op stubs) ----
  cy.intercept("GET", `**/tagged/${vendorId}`, {
    statusCode: 200,
    body: [],
  });

  cy.intercept("GET", `**/reviews/${vendorId}`, {
    statusCode: 200,
    body: [],
  });

  // ---- VISIT OWNER VIEW ----
  cy.visit(`/portfolios/vendor/${username}/${vendorId}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  // ---- WAIT FOR AUTH ----
  cy.wait("@getMe");
};
