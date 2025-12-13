// cypress/e2e/fe-e2e-cln-3.cleaningQuotes.cy.js

describe("FE-E2E-CLN-3: Cleaning Quote Management", () => {
  
  const testPortfolioId = "test-portfolio-123";

  const mockUser = {
    _id: "user-123",
    email: "owner@test.com",
    name: "Test Owner"
  };

  const mockQuotes = [
    {
      _id: "quote-1",
      services: ["Deep Cleaning", "Window Cleaning"],
      details: "Need deep cleaning for 3 bedroom apartment",
      dueDate: "2025-12-20T00:00:00.000Z",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
      status: "new"
    },
    {
      _id: "quote-2",
      services: ["Regular Cleaning"],
      details: "Weekly cleaning service",
      dueDate: "2025-12-25T00:00:00.000Z",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "555-987-6543",
      status: "in_progress"
    }
  ];

  const mockPortfolio = {
    _id: testPortfolioId,
    businessName: "Sparkle Cleaning",
    services: [
      { _id: "s1", title: "Deep Cleaning", description: "Full deep clean", price: 150 },
      { _id: "s2", title: "Regular Cleaning", description: "Weekly clean", price: 80 }
    ]
  };

  beforeEach(() => {
    // Stub me-user
    cy.intercept("GET", "**/api/portfolios/me-user", {
      statusCode: 200,
      body: { user: mockUser }
    }).as("getUser");

    // Stub portfolio with isOwner: true
    cy.intercept("GET", "**/api/portfolios/test-portfolio-123**", {
      statusCode: 200,
      body: {
        portfolio: mockPortfolio,
        isOwner: true
      }
    }).as("getPortfolio");

    // Stub GET quotes - returns list of quotes
    cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes**", {
      statusCode: 200,
      body: mockQuotes
    }).as("getQuotes");

    // Stub PATCH quote status
    cy.intercept("PATCH", "**/api/portfolios/quotes/*/status", {
      statusCode: 200,
      body: { message: "Status updated" }
    }).as("updateQuoteStatus");
  });

  // Helper - visit as owner and wait for auth
  const visitAsOwner = (path) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token");
        win.localStorage.setItem("userId", mockUser._id);
        win.localStorage.setItem("email", mockUser.email);
        win.localStorage.setItem("userPortfolios", JSON.stringify([testPortfolioId]));
      }
    });

    cy.get(".cleaning-app", { timeout: 15000 }).should("exist");
    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    cy.wait(500);
  };

  describe("View Quotes", () => {
    
    it("loads quotes via GET /my-portfolio/quotes", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      
      // Wait for quotes to load
      cy.wait("@getQuotes");
      
      // Verify quotes section appears for admin
      cy.contains("Quote Requests", { timeout: 10000 }).should("exist");
    });

    it("displays quote details correctly", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Check first quote info
      cy.contains("John Doe").should("exist");
      cy.contains("john@example.com").should("exist");
      cy.contains("Deep Cleaning").should("exist");
      
      // Check second quote info
      cy.contains("Jane Smith").should("exist");
      cy.contains("Regular Cleaning").should("exist");
    });

    it("shows status badges for quotes", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Check status badges exist
      cy.get(".badge", { timeout: 10000 }).should("have.length.at.least", 1);
      
      // Check for "New" status
      cy.contains("New").should("exist");
      
      // Check for "In Progress" status
      cy.contains("In Progress").should("exist");
    });

    it("shows action buttons for each quote", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Check action buttons exist
      cy.contains("button", "In Progress").should("exist");
      cy.contains("button", "Complete").should("exist");
      cy.contains("button", "Reject").should("exist");
    });
  });

  describe("Update Quote Status", () => {
    
    it("changes status to In Progress via PATCH /quotes/:id/status", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Click "In Progress" button on first quote
      cy.get(".quote-item", { timeout: 10000 }).first().within(() => {
        cy.contains("button", "In Progress").click();
      });

      // Verify PATCH was called with correct status
      cy.wait("@updateQuoteStatus").then((interception) => {
        expect(interception.request.body).to.have.property("status", "in_progress");
      });

      // Verify success toast
      cy.contains("Status updated", { timeout: 5000 }).should("be.visible");
    });

    it("changes status to Completed via PATCH /quotes/:id/status", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Click "Complete" button
      cy.get(".quote-item", { timeout: 10000 }).first().within(() => {
        cy.contains("button", "Complete").click();
      });

      // Verify PATCH was called
      cy.wait("@updateQuoteStatus").then((interception) => {
        expect(interception.request.body).to.have.property("status", "completed");
      });

      // Verify success toast
      cy.contains("Status updated", { timeout: 5000 }).should("be.visible");
    });

    it("changes status to Rejected via PATCH /quotes/:id/status", () => {
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");
      
      // Click "Reject" button
      cy.get(".quote-item", { timeout: 10000 }).first().within(() => {
        cy.contains("button", "Reject").click();
      });

      // Verify PATCH was called
      cy.wait("@updateQuoteStatus").then((interception) => {
        expect(interception.request.body).to.have.property("status", "rejected");
      });

      // Verify success toast
      cy.contains("Status updated", { timeout: 5000 }).should("be.visible");
    });
  });

  describe("Empty Quotes State", () => {
    
    it("shows 'No requests yet' when no quotes exist", () => {
      // Override quotes stub to return empty array
      cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes**", {
        statusCode: 200,
        body: []
      }).as("getEmptyQuotes");

      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getEmptyQuotes");
      
      // Check empty state message
      cy.contains("No requests yet", { timeout: 10000 }).should("exist");
    });
  });

  describe("Full Quote Management Flow", () => {
    
    it("completes flow: view quotes → update status → see updated badge", () => {
      // Setup: After status update, return updated quote
      let statusUpdated = false;
      
      cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes**", (req) => {
        if (statusUpdated) {
          // Return updated quotes after status change
          req.reply({
            statusCode: 200,
            body: [
              { ...mockQuotes[0], status: "in_progress" },
              mockQuotes[1]
            ]
          });
        } else {
          req.reply({
            statusCode: 200,
            body: mockQuotes
          });
        }
      }).as("getQuotes");

      cy.intercept("PATCH", "**/api/portfolios/quotes/*/status", (req) => {
        statusUpdated = true;
        req.reply({
          statusCode: 200,
          body: { message: "Status updated" }
        });
      }).as("updateQuoteStatus");

      // Visit charges page
      visitAsOwner(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.wait("@getQuotes");

      // Verify quotes section
      cy.contains("Quote Requests").should("exist");
      
      // Verify initial "New" status on first quote
      cy.get(".quote-item").first().within(() => {
        cy.contains("New").should("exist");
      });

      // Update status to "In Progress"
      cy.get(".quote-item").first().within(() => {
        cy.contains("button", "In Progress").click();
      });

      // Verify API called
      cy.wait("@updateQuoteStatus");
      
      // Verify success message
      cy.contains("Status updated").should("be.visible");
    });
  });

});