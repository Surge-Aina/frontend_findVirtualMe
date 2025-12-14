// cypress/e2e/fe-e2e-port-3.cleaningService.cy.js

// ==========================================
// CLEANING SERVICE PORTFOLIO - SMOKE TESTS
// ==========================================

describe("Cleaning Service Portfolio - Smoke Flow", () => {
  
  beforeEach(() => {
    // Stub all API calls (no backend needed)
    cy.intercept("GET", "**/api/portfolios/*", {
      statusCode: 200,
      body: {
        portfolio: {
          _id: "test-portfolio-123",
          businessName: "Test Cleaning Service",
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

    cy.intercept("GET", "**/api/portfolios/my-portfolio/quotes", {
      statusCode: 200,
      body: []
    }).as("getQuotes");

    cy.intercept("POST", "**/api/portfolios/quotes", {
      statusCode: 200,
      body: { message: "Quote created successfully", quoteId: "q123" }
    }).as("submitQuote");

    cy.visit("/portfolios/cleaningService");
  });

  it("loads the landing/about page successfully", () => {
    cy.url().should("include", "/cleaningService");
    cy.contains("Demo Mode").should("exist");
    cy.contains("Get Started").should("exist");
  });

  it("renders the cleaning service navbar", () => {
    cy.contains("About").should("exist");
    cy.contains("Services").should("exist");
    cy.contains("Pricing").should("exist");
  });

  it("services section renders with content", () => {
    cy.contains("Services").click();
    cy.url().should("include", "/services");
    cy.get("body").should("not.be.empty");
  });

  it("pricing section renders with service charges and quote form", () => {
    cy.contains("Pricing").click();
    cy.url().should("include", "/charges");
    
    cy.contains("Service Charges").should("exist");
    cy.contains("Request a Quote").should("exist");
    cy.contains("Your Name").should("exist");
    cy.contains("Email").should("exist");
    cy.contains("Phone").should("exist");
    cy.contains("Due Date").should("exist");
    cy.contains("Extra Details").should("exist");
    cy.contains("Send Request").should("exist");
  });

  it("about section renders with tagline content", () => {
    cy.url().should("include", "/about");
    cy.get(".clean-about-container").should("exist");
    cy.get(".cta-button").should("exist");
  });

  it("completes full smoke flow: landing → inquiry submit", () => {
    // Step 1: Navigate through the flow
    cy.contains("Get Started").click();
    cy.url().should("include", "/services");

    cy.contains("Pricing").click();
    cy.url().should("include", "/charges");

    // Step 2: Fill out the quote form
    cy.contains("Your Name")
      .parent()
      .find("input")
      .type("Test User");

    cy.get('input[type="date"]').type("2025-12-31");

    cy.contains("Email")
      .parent()
      .find("input")
      .type("test@example.com");

    cy.contains("Phone")
      .parent()
      .find("input")
      .type("555-123-4567");

    cy.get("textarea").type("This is a test inquiry from Cypress smoke test");

    // Step 3: Submit the form
    cy.contains("button", "Send Request").click();

    // Step 4: Verify API was called with correct data
    cy.wait("@submitQuote").its("request.body").should("deep.include", {
      name: "Test User",
      email: "test@example.com",
      phone: "555-123-4567"
    });

    // Step 5: Verify success message
    cy.contains("Quote request submitted").should("be.visible");
  });

});


// ==========================================
// LOCAL VENDOR PORTFOLIO - SMOKE TESTS
// ==========================================

// ==========================================
// LOCAL VENDOR PORTFOLIO - SMOKE TESTS
// ==========================================

describe("Local Vendor Portfolio - Smoke Flow", () => {
  
  beforeEach(() => {
    // Stub vendor full data
    cy.intercept("GET", "**/vendor/*/full", {
      statusCode: 200,
      body: {
        _id: "vendor-123",
        businessName: "Test Local Vendor",
        tagline: "Quality service you can trust"
      }
    }).as("getVendorFull");

    // Stub banner API - pattern is /banner/{vendorId}
    cy.intercept("GET", "**/banner/*", {
      statusCode: 200,
      body: [{
        _id: "banner-1",
        title: "Test Vendor",
        description: "Welcome to our store",
        image: "/test-banner.jpg",
        shape: "fullscreen"
      }]
    }).as("getBanner");

    // Stub about API - pattern is /about/{vendorId}
    cy.intercept("GET", "**/about/*", {
      statusCode: 200,
      body: {
        contentBlocks: [
          { _id: "ab1", heading: "Our Story", subheading: "We started in 2020..." },
          { _id: "ab2", heading: "Our Mission", subheading: "To provide the best..." }
        ],
        gridImages: []
      }
    }).as("getAbout");

    // Stub menu API - pattern is /menu/{vendorId}
    cy.intercept("GET", "**/menu/*", {
      statusCode: 200,
      body: [
        { _id: "m1", name: "Item A", price: 10, description: "Delicious item", category: "Main", isAvailable: true },
        { _id: "m2", name: "Item B", price: 15, description: "Tasty item", category: "Main", isAvailable: true },
        { _id: "m3", name: "Item C", price: 20, description: "Premium item", category: "Special", isAvailable: true }
      ]
    }).as("getMenu");

    // Stub gallery API - pattern is /gallery/{vendorId}
    cy.intercept("GET", "**/gallery/*", {
      statusCode: 200,
      body: [
        { _id: "g1", imageUrl: "/test-image-1.jpg", caption: "Photo 1" },
        { _id: "g2", imageUrl: "/test-image-2.jpg", caption: "Photo 2" }
      ]
    }).as("getGallery");

    // Stub reviews API - pattern is /reviews/{vendorId}
    cy.intercept("GET", "**/reviews/*", {
      statusCode: 200,
      body: [
        { _id: "r1", name: "John Doe", rating: 5, feedback: "Great service!", createdAt: "2025-01-01" },
        { _id: "r2", name: "Jane Smith", rating: 4, feedback: "Very good!", createdAt: "2025-01-02" }
      ]
    }).as("getReviews");

    // Stub tagged images API - pattern is /tagged/{vendorId}
    cy.intercept("GET", "**/tagged/*", {
      statusCode: 200,
      body: []
    }).as("getTaggedImages");

    // Stub vendors list
    cy.intercept("GET", "**/vendor", {
      statusCode: 200,
      body: [{ _id: "vendor-123", name: "Test Vendor", email: "test@vendor.com" }]
    }).as("getVendors");

    cy.visit("/portfolios/localVendor");
  });

  it("loads the local vendor portfolio page", () => {
    cy.url().should("include", "/localVendor");
    cy.get(".localvendor").should("exist");
  });

  it("renders the navbar with brand and navigation links", () => {
    // Brand name
    cy.contains("Street Vendor").should("exist");
    
    // Navigation links
    cy.contains("Home").should("exist");
    cy.contains("About").should("exist");
    cy.contains("Menu").should("exist");
    cy.contains("Gallery").should("exist");
    cy.contains("Reviews").should("exist");
    cy.contains("Login").should("exist");
  });

  it("renders the banner/hero section with CTA buttons", () => {
    cy.get("#home").should("exist");
    cy.contains("View Menu").should("exist");
    cy.contains("About Us").should("exist");
  });

  it("renders the about section", () => {
    cy.get("#about").should("exist");
  });

  it("renders the menu section with title", () => {
    cy.get("#menu").should("exist");
    cy.contains("Menu").should("exist");
  });

  it("renders the gallery section with title", () => {
    cy.get("#gallery").should("exist");
    cy.contains("Gallery").should("exist");
  });

  it("renders the reviews section with title", () => {
    cy.get("#reviews").should("exist");
    cy.contains("Customer Reviews").should("exist");
  });

  it("renders the showcase section", () => {
    cy.get("#showcase").should("exist");
    cy.contains("Explore Our Showcase").should("exist");
  });

});