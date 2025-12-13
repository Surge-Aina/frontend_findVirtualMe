// cypress/e2e/fe-e2e-cln-2.cleaningStudio.cy.js

describe("FE-E2E-CLN-2: Cleaning Studio Portfolio Builder", () => {
  
  const testPortfolioId = "test-portfolio-123";

  const mockUser = {
    _id: "user-123",
    email: "owner@test.com",
    name: "Test Owner"
  };

  const mockPortfolio = {
    _id: testPortfolioId,
    businessName: "Sparkle Cleaning",
    tagline1: "We bring sparkle to your space",
    services: [
      { _id: "s1", title: "Deep Cleaning", description: "Full deep clean", price: 150 },
      { _id: "s2", title: "Regular Cleaning", description: "Weekly clean", price: 80 }
    ],
    roomPricing: [
      { roomType: "bedroom", price: 25 },
      { roomType: "kitchen", price: 40 },
      { roomType: "bathroom", price: 30 },
      { roomType: "livingRoom", price: 35 }
    ]
  };

  beforeEach(() => {
    // 1. Stub me-user - MUST return user for AuthContext
    cy.intercept("GET", "**/api/portfolios/me-user", {
      statusCode: 200,
      body: { user: mockUser }
    }).as("getUser");

    // 2. Stub portfolio - MUST return isOwner: true
    cy.intercept("GET", "**/api/portfolios/test-portfolio-123**", {
      statusCode: 200,
      body: {
        portfolio: mockPortfolio,
        isOwner: true
      }
    }).as("getPortfolio");

    // 3. Other stubs
    cy.intercept("PATCH", "**/api/portfolios/my-portfolio", {
      statusCode: 200,
      body: { message: "Updated" }
    }).as("updatePortfolio");

    cy.intercept("POST", "**/api/portfolios/my-portfolio/services", {
      statusCode: 201,
      body: { message: "Service added", service: { _id: "s3", title: "New", description: "New" } }
    }).as("addService");

    cy.intercept("PUT", "**/api/portfolios/my-portfolio/services/*", {
      statusCode: 200,
      body: { message: "Service updated" }
    }).as("updateService");

    cy.intercept("DELETE", "**/api/portfolios/my-portfolio/services/*", {
      statusCode: 200,
      body: { message: "Service deleted" }
    }).as("deleteService");

    cy.intercept("PUT", "**/api/portfolios/my-portfolio/room-pricing", {
      statusCode: 200,
      body: { message: "Room pricing updated" }
    }).as("updateRoomPricing");

    cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes**", {
      statusCode: 200,
      body: []
    }).as("getQuotes");
  });

  // Helper - visit and WAIT for auth to complete
  const visitAsOwner = (path) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token");
        win.localStorage.setItem("userId", mockUser._id);
        win.localStorage.setItem("email", mockUser.email);
        win.localStorage.setItem("userPortfolios", JSON.stringify([testPortfolioId]));
      }
    });

    // Wait for page to load
    cy.get(".cleaning-app", { timeout: 15000 }).should("exist");
    
    // CRITICAL: Wait for BOTH API calls to complete
    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    
    // Give React time to re-render after state updates
    cy.wait(500);
  };

  describe("Owner sees admin features", () => {
    
    it("shows Admin Mode chip on services page", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      // Now check for admin chip (with retry)
      cy.get(".admin-chip", { timeout: 10000 }).should("contain", "Admin");
    });

    it("shows Add Service button", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      cy.contains("button", "Add Service", { timeout: 10000 }).should("be.visible");
    });

    it("shows Edit Room Prices button", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      cy.contains("Edit Room Prices", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Owner can add a service", () => {
    
    it("adds a new service", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      // Wait for admin button to appear
      cy.contains("button", "Add Service", { timeout: 10000 }).click();

      // Fill form
      cy.get('input[placeholder="Enter title"]').type("Window Cleaning");
      cy.get('textarea[placeholder="Enter description"]').type("Window cleaning service");

      // Submit
      cy.contains("button", "Submit").click();

      // Verify
      cy.wait("@addService");
      cy.contains("Service added").should("be.visible");
    });
  });

  describe("Owner can edit room pricing", () => {
    
    it("edits room prices", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      // Wait for button and click
      cy.contains("Edit Room Prices", { timeout: 10000 }).click();

      // Edit price
      cy.get(".price-editor-input").first().clear().type("50");

      // Save
      cy.contains("Done Editing Prices").click();

      // Verify
      cy.wait("@updateRoomPricing");
      cy.contains("Room prices updated").should("be.visible");
    });
  });

  describe("Owner can edit service prices", () => {
    
    it("edits a service price", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      
      // Wait for Edit button and click
      cy.contains("Edit", { timeout: 10000 }).first().click();

      // Enter new price
      cy.get(".price-edit-form input").clear().type("200");

      // Save
      cy.get(".price-edit-form").contains("Save").click();

      // Verify
      cy.wait("@updateService");
      cy.contains("Price updated").should("be.visible");
    });
  });

  describe("Owner can delete a service", () => {
    
    it("deletes a service", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      // Stub confirm dialog
      cy.on("window:confirm", () => true);

      // Wait for delete button and click
    cy.get(".delete-btn", { timeout: 10000 }).first().click({ force: true });

      // Verify
      cy.wait("@deleteService");
      cy.contains("Service deleted").should("be.visible");
    });
  });

  describe("Full owner flow", () => {
    
    it("completes full flow: view → add service → edit pricing", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/services`);
      
      // Verify admin mode
      cy.get(".admin-chip", { timeout: 10000 }).should("exist");

      // Add service
      cy.contains("button", "Add Service").click();
      cy.get('input[placeholder="Enter title"]').type("Test Service");
      cy.get('textarea[placeholder="Enter description"]').type("Test");
      cy.contains("button", "Submit").click();
      cy.wait("@addService");
      cy.contains("Service added").should("be.visible");

      // Edit room prices
      cy.contains("Edit Room Prices").click();
      cy.get(".price-editor-input").first().clear().type("55");
      cy.contains("Done Editing Prices").click();
      cy.wait("@updateRoomPricing");
      cy.contains("Room prices updated").should("be.visible");

      // Go to pricing page
      cy.contains("Pricing").click();
      cy.url().should("include", "/charges");
      
      // Verify can edit
      cy.contains("Edit").should("exist");
    });
  });

});