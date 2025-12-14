// cypress/e2e/fe-e2e-cln-1.cleaningPublic.cy.js

describe("Cleaning Portfolio - Public Slug View & Quote Submission", () => {
  
  const testPortfolioId = "test-portfolio-123";

  beforeEach(() => {
    // Stub GET portfolio (matches with any query params)
    cy.intercept("GET", /\/api\/portfolios\/[^/]+(\?.*)?$/, {
      statusCode: 200,
      body: {
        portfolio: {
          _id: testPortfolioId,
          slug: "sparkle-cleaning",
          businessName: "Sparkle Cleaning Service",
          tagline1: "We bring sparkle to your space",
          tagline2: "From roof to floor",
          tagline3: "Every detail matters",
          services: [
            { _id: "s1", title: "Deep Cleaning", price: 150 },
            { _id: "s2", title: "Regular Cleaning", price: 80 },
            { _id: "s3", title: "Move-out Cleaning", price: 200 }
          ]
        }
      }
    }).as("getPortfolio");

    // Stub quotes list
    cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes**", {
      statusCode: 200,
      body: []
    }).as("getQuotes");

    // Stub quote submission
    cy.intercept("POST", /\/api\/portfolios\/quotes/, {
      statusCode: 200,
      body: { 
        message: "Quote created successfully", 
        quoteId: "q123" 
      }
    }).as("submitQuote");
  });

  describe("Public Portfolio View (by portfolioId)", () => {
    
    beforeEach(() => {
      cy.visit(`/portfolios/cleaningService/${testPortfolioId}`);
      cy.get(".cleaning-app", { timeout: 10000 }).should("exist");
    });

    it("loads the portfolio and redirects to about page", () => {
      cy.url().should("include", testPortfolioId);
    });

    it("renders the hero/about section", () => {
      cy.get(".cta-button").should("exist");
      cy.contains("Get Started").should("exist");
    });

    it("renders the navbar with correct links", () => {
      cy.contains("About").should("exist");
      cy.contains("Services").should("exist");
      cy.contains("Pricing").should("exist");
    });

    it("can navigate to services page", () => {
      cy.contains("Services").click();
      cy.url().should("include", "/services");
    });

    it("can navigate to pricing page", () => {
      cy.contains("Pricing").click();
      cy.url().should("include", "/charges");
    });
  });

  describe("Quote Form Submission", () => {
    
    beforeEach(() => {
      cy.visit(`/portfolios/cleaningService/${testPortfolioId}/charges`);
      cy.get(".cleaning-app", { timeout: 10000 }).should("exist");
    });

    it("renders the quote form with all required fields", () => {
      cy.contains("Request a Quote").should("exist");
      cy.contains("Your Name").should("exist");
      cy.contains("Email").should("exist");
      cy.contains("Phone").should("exist");
      cy.contains("Due Date").should("exist");
      cy.contains("Send Request").should("exist");
    });

    it("renders service checkboxes", () => {
      cy.get(".services-checkboxes", { timeout: 10000 }).should("exist");
      cy.get('.services-checkboxes input[type="checkbox"]').should("have.length.at.least", 1);
    });

    it("shows error when no service selected", () => {
      // Fill the form but don't select a service
      cy.contains("Your Name")
        .parent()
        .find("input")
        .type("John Doe");

      cy.get('input[type="date"]').type("2025-12-31");

      cy.contains("Email")
        .parent()
        .find("input")
        .type("john@example.com");

      cy.contains("Phone")
        .parent()
        .find("input")
        .type("555-987-6543");

      cy.get("textarea").type("Testing without service selection");

      // Submit the form
      cy.contains("button", "Send Request").click();

      // Should show error toast
      cy.contains("Select at least one service", { timeout: 5000 }).should("be.visible");
    });

    it("successfully submits a quote request", () => {
      // Select a service first
      cy.get(".services-checkboxes", { timeout: 10000 }).should("exist");
      cy.get('.services-checkboxes input[type="checkbox"]').first().check({ force: true });

      // Fill the form
      cy.contains("Your Name")
        .parent()
        .find("input")
        .type("John Doe");

      cy.get('input[type="date"]').type("2025-12-31");

      cy.contains("Email")
        .parent()
        .find("input")
        .type("john@example.com");

      cy.contains("Phone")
        .parent()
        .find("input")
        .type("555-987-6543");

      cy.get("textarea").type("I need a deep cleaning for my apartment");

      // Submit the form
      cy.contains("button", "Send Request").click();

      // Check for success toast
      cy.contains("Quote request submitted!", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Full User Flow: Landing → Quote Submit", () => {
    
    it("completes full flow from landing to successful quote submission", () => {
      // Step 1: Visit portfolio landing page
      cy.visit(`/portfolios/cleaningService/${testPortfolioId}`);
      cy.get(".cleaning-app", { timeout: 10000 }).should("exist");

      // Step 2: Check hero renders
      cy.contains("Get Started").should("exist");

      // Step 3: Navigate to Services
      cy.contains("Get Started").click();
      cy.url().should("include", "/services");

      // Step 4: Navigate to Pricing/Charges
      cy.contains("Pricing").click();
      cy.url().should("include", "/charges");

      // Step 5: Verify pricing section
      cy.contains("Service Charges").should("exist");
      cy.contains("Request a Quote").should("exist");

      // Step 6: Select a service
      cy.get(".services-checkboxes", { timeout: 10000 }).should("exist");
      cy.get('.services-checkboxes input[type="checkbox"]').first().check({ force: true });

      // Step 7: Fill the quote form
      cy.contains("Your Name")
        .parent()
        .find("input")
        .type("Jane Smith");

      cy.get('input[type="date"]').type("2025-12-15");

      cy.contains("Email")
        .parent()
        .find("input")
        .type("jane@example.com");

      cy.contains("Phone")
        .parent()
        .find("input")
        .type("555-111-2222");

      cy.get("textarea").type("Looking for weekly cleaning service");

      // Step 8: Submit
      cy.contains("button", "Send Request").click();

      // Step 9: Verify success
      cy.contains("Quote request submitted!", { timeout: 10000 }).should("be.visible");
    });
  });

});