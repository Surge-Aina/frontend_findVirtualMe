const vendorId = "690159b1a872fe05a6cc02b5";

const visitMenuAsOwner = (menu = []) => {
  cy.intercept("GET", "**/user/me", {
    body: {
      user: {
        role: "vendor",
        portfolios: [{ portfolioId: vendorId }],
      },
    },
  }).as("getMe");

  cy.intercept("GET", "**/menu/**", {
    statusCode: 200,
    body: menu,
  }).as("getMenu");

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}#menu`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");
  cy.wait("@getMenu");
};

it("renders menu items", () => {
  visitMenuAsOwner([
    {
      _id: "item1",
      name: "Veg Burger",
      description: "Fresh veggie patty",
      price: 8.99,
      category: "Burgers",
      isAvailable: true,
    },
  ]);

  cy.contains("Veg Burger").should("be.visible");
  cy.contains("Fresh veggie patty").should("be.visible");
  cy.contains("$8.99").should("be.visible");
});

it("shows admin controls", () => {
  visitMenuAsOwner([]);

  cy.contains("+ Add Menu Item").should("be.visible");
});

it("allows adding a menu item", () => {
  visitMenuAsOwner([]);

  cy.intercept("POST", "**/menu/**", {
    statusCode: 200,
  }).as("createMenu");

  cy.intercept("GET", "**/menu/**", {
    body: [
      {
        _id: "item1",
        name: "Paneer Wrap",
        description: "Spicy paneer wrap",
        price: 7.5,
        category: "Wraps",
        isAvailable: true,
      },
    ],
  }).as("getMenuAfterCreate");

  cy.contains("+ Add Menu Item").click();

  cy.get('input[placeholder="Name"]').type("Paneer Wrap");
  cy.get('input[placeholder="Price"]').type("7.5");
  cy.get('input[placeholder="Category"]').type("Wraps");
  cy.get('input[placeholder="Description"]').type("Spicy paneer wrap");

  cy.contains(/^Add$/).click();

  cy.wait("@createMenu");
  cy.wait("@getMenuAfterCreate");

  cy.contains("Paneer Wrap").should("be.visible");
});

it("allows editing a menu item", () => {
  visitMenuAsOwner([
    {
      _id: "item1",
      name: "Veg Burger",
      description: "Fresh veggie patty",
      price: 8.99,
      category: "Burgers",
      isAvailable: true,
    },
  ]);

  cy.intercept("PUT", "**/menu/**", {
    statusCode: 200,
  }).as("updateMenu");

  cy.intercept("GET", "**/menu/**", {
    body: [
      {
        _id: "item1",
        name: "Veg Burger Deluxe",
        description: "Upgraded burger",
        price: 9.99,
        category: "Burgers",
        isAvailable: true,
      },
    ],
  }).as("getMenuAfterUpdate");

  cy.get("section#menu")
    .find("button")
    .contains(/^Edit$/)
    .first()
    .click();

  cy.get('input[placeholder="Name"]').clear().type("Veg Burger Deluxe");
  cy.get('input[placeholder="Price"]').clear().type("9.99");

  cy.contains(/^Update$/).click();

  cy.wait("@updateMenu");
  cy.wait("@getMenuAfterUpdate");

  cy.contains("Veg Burger Deluxe").should("be.visible");
  cy.contains("$9.99").should("be.visible");
});

it("allows deleting a menu item", () => {
  visitMenuAsOwner([
    {
      _id: "item1",
      name: "Delete Me",
      description: "Temp",
      price: 5,
      isAvailable: true,
    },
  ]);

  cy.on("window:confirm", () => true);

  cy.intercept("DELETE", "**/menu/**", {
    statusCode: 200,
  }).as("deleteMenu");

  cy.get("section#menu")
    .find("button")
    .contains(/^Delete$/)
    .first()
    .click();

  cy.wait("@deleteMenu");

  // UI removes item locally (no refetch needed)
  cy.contains("Delete Me").should("not.exist");
});

it("hides admin controls for public users", () => {
  cy.intercept("GET", "**/menu/**", {
    body: [
      {
        name: "Veg Burger",
        price: 8.99,
      },
    ],
  });

  cy.visit(`/portfolios/vendor/fusion-flavors/${vendorId}#menu`);

  cy.contains("Veg Burger").should("be.visible");
  cy.contains("+ Add Menu Item").should("not.exist");
  cy.contains("Edit").should("not.exist");
  cy.contains("Delete").should("not.exist");
});
