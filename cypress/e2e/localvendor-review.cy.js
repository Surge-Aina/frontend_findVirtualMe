import { startVendorAsOwner } from "../support/vendorStudio";

const vendorId = "690159b1a872fe05a6cc02b5";

const visitReviewsAsOwner = (reviews = []) => {
  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
    },
  }).as("getMe");

  cy.intercept("GET", `**/reviews/${vendorId}`, {
    statusCode: 200,
    body: reviews,
  }).as("getReviews");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}#reviews`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");
  cy.wait("@getReviews");
};

describe("Reviews – Owner view", () => {
  it("renders existing reviews", () => {
    visitReviewsAsOwner([
      {
        _id: "rev1",
        name: "John",
        feedback: "Amazing food",
        rating: 5,
        createdAt: "2024-01-01",
      },
    ]);

    cy.contains("Amazing food").should("be.visible");
    cy.contains("John").should("be.visible");
    cy.contains("★★★★★").should("exist");
  });

  it("allows adding a new review", () => {
    visitReviewsAsOwner([]);

    cy.intercept("POST", "**/reviews/**", { statusCode: 200 }).as("createReview");

    cy.intercept("GET", "**/reviews/**", {
      body: [
        {
          _id: "rev2",
          name: "Alice",
          feedback: "Loved it",
          rating: 4,
        },
      ],
    }).as("getReviewsAfterCreate");

    cy.contains("+ Add Review").click();

    cy.get("input[placeholder='Jane Doe']").type("Alice");
    cy.get("textarea[placeholder='What did you think?']").type("Loved it");
    cy.get("button[aria-label='4 stars']").click();

    cy.contains("Save").click();

    cy.wait("@createReview");
    cy.wait("@getReviewsAfterCreate");

    cy.contains("Loved it").should("be.visible");
  });

  it("allows editing a review", () => {
    visitReviewsAsOwner([
      {
        _id: "rev1",
        name: "John",
        feedback: "Amazing food",
        rating: 5,
      },
    ]);

    cy.intercept("PUT", "**/reviews/**", { statusCode: 200 }).as("updateReview");

    cy.intercept("GET", "**/reviews/**", {
      body: [
        {
          _id: "rev1",
          name: "John",
          feedback: "Updated feedback",
          rating: 4,
        },
      ],
    }).as("getReviewsAfterUpdate");

    cy.get("section#reviews")
      .find("button")
      .contains(/^Edit$/)
      .first()
      .click();

    cy.get("textarea[placeholder='What did you think?']").clear().type("Updated feedback");

    cy.contains("Save").click();

    cy.wait("@updateReview");
    cy.wait("@getReviewsAfterUpdate");

    cy.contains("Updated feedback").should("be.visible");
  });

  it("allows deleting a review", () => {
    visitReviewsAsOwner([
      {
        _id: "rev1",
        name: "John",
        feedback: "Amazing food",
        rating: 5,
      },
    ]);

    cy.intercept("DELETE", "**/reviews/**", { statusCode: 200 }).as("deleteReview");
    cy.intercept("GET", "**/reviews/**", { body: [] }).as("getReviewsAfterDelete");

    cy.get("section#reviews")
      .find("button")
      .contains(/^Delete$/)
      .first()
      .click();

    cy.wait("@deleteReview");
    cy.wait("@getReviewsAfterDelete");

    cy.contains("Amazing food").should("not.exist");
  });
});

describe("Reviews – Public view", () => {
  it("hides edit controls", () => {
    cy.intercept("GET", "**/reviews/**", {
      body: [
        {
          _id: "rev1",
          name: "John",
          feedback: "Public review",
          rating: 5,
        },
      ],
    });

    cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}`);

    cy.contains("Public review").should("be.visible");
    cy.contains("Edit").should("not.exist");
    cy.contains("Delete").should("not.exist");
    cy.contains("+ Add Review").should("not.exist");
  });
});
