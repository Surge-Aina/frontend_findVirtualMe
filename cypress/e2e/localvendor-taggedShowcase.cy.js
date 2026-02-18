const vendorId = "690159b1a872fe05a6cc02b5";

const visitShowcase = (taggedImages = []) => {
  cy.intercept("GET", "**/user/me", {
    body: { user: null }, // public view
  });

  cy.intercept("GET", "**/tagged/**", {
    statusCode: 200,
    body: taggedImages,
  }).as("getTaggedImages");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}#showcase`);
  cy.wait("@getTaggedImages");
};

it("shows empty state when no showcase image exists", () => {
  visitShowcase([]);

  cy.contains("No showcase image available.").should("be.visible");
});

it("renders showcase image", () => {
  visitShowcase([
    {
      _id: "t1",
      imageUrl: "/mock-showcase.jpg",
      tags: [],
    },
  ]);

  cy.get("section#showcase").should("be.visible");
  cy.get("img[alt='Product Showcase']").should("be.visible");
});

it("renders tagged items on the image", () => {
  visitShowcase([
    {
      _id: "t1",
      imageUrl: "/mock-showcase.jpg",
      tags: [
        {
          x: 0.5,
          y: 0.5,
          menuItem: {
            name: "Veg Burger",
            price: 8.99,
            isAvailable: true,
          },
        },
      ],
    },
  ]);

  cy.contains("Veg Burger").should("be.visible");
  cy.contains("$8.99").should("be.visible");
});

it("opens item details when a tag is clicked", () => {
  visitShowcase([
    {
      _id: "t1",
      imageUrl: "/mock-showcase.jpg",
      tags: [
        {
          x: 0.4,
          y: 0.4,
          menuItem: {
            name: "Veg Burger",
            price: 8.99,
            description: "Fresh veggie patty",
            isAvailable: true,
          },
        },
      ],
    },
  ]);

  cy.contains("Veg Burger").click();

  cy.contains("Fresh veggie patty").should("be.visible");
  cy.contains("$8.99").should("be.visible");
  cy.contains("Available").should("be.visible");
});

it("closes item details popover", () => {
  visitShowcase([
    {
      _id: "t1",
      imageUrl: "/mock-showcase.jpg",
      tags: [
        {
          x: 0.4,
          y: 0.4,
          menuItem: {
            name: "Veg Burger",
            price: 8.99,
            isAvailable: true,
          },
        },
      ],
    },
  ]);

  // Open popover
  cy.contains("Veg Burger").click();

  // Close popover
  cy.get("button[aria-label='Close']").click();

  // Badge still exists
  cy.contains("Veg Burger").should("exist");

  // Popover is gone
  cy.get("button[aria-label='Close']").should("not.exist");
});

it("opens item details when clicked from legend", () => {
  visitShowcase([
    {
      _id: "t1",
      imageUrl: "/mock-showcase.jpg",
      tags: [
        {
          x: 0.2,
          y: 0.2,
          menuItem: {
            name: "Paneer Wrap",
            price: 7.5,
            isAvailable: false,
          },
        },
      ],
    },
  ]);

  cy.contains("Paneer Wrap").click();

  cy.contains("Unavailable").should("be.visible");
  cy.contains("$7.5").should("be.visible");
});
