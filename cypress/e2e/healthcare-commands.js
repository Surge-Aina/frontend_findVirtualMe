// cypress/support/healthcare-commands.js
// Custom commands for Healthcare Portfolio testing
// Follows existing project patterns from commands.js

const getBackendUrl = () => Cypress.env("backendUrl");

// ============================================
// API COMMANDS
// ============================================

/**
 * Create a healthcare portfolio via API
 */
Cypress.Commands.add("createHealthcarePortfolioAPI", () => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist before creating portfolio").to.exist;

    return cy
      .request({
        method: "POST",
        url: `${backendUrl}/healthcare/create`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        failOnStatusCode: false,
      })
      .then((res) => {
        expect(
          [200, 201],
          `Create portfolio should succeed. Got status=${res.status}`
        ).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Get user's healthcare portfolios via API
 */
Cypress.Commands.add("getMyHealthcarePortfoliosAPI", () => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist").to.exist;

    return cy
      .request({
        method: "GET",
        url: `${backendUrl}/healthcare/my-portfolios`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        failOnStatusCode: false,
      })
      .then((res) => {
        expect([200, 201], `Get portfolios should succeed`).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Get admin data for a specific portfolio
 */
Cypress.Commands.add("getHealthcareAdminDataAPI", (portfolioId) => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist").to.exist;

    return cy
      .request({
        method: "GET",
        url: `${backendUrl}/healthcare/admin/data/${portfolioId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        failOnStatusCode: false,
      })
      .then((res) => {
        expect([200, 201], `Get admin data should succeed`).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Save admin data for a specific portfolio
 */
Cypress.Commands.add("saveHealthcareAdminDataAPI", (portfolioId, data) => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist").to.exist;

    return cy
      .request({
        method: "POST",
        url: `${backendUrl}/healthcare/admin/data/${portfolioId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: data,
        failOnStatusCode: false,
      })
      .then((res) => {
        expect([200, 201], `Save admin data should succeed`).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Toggle public/private status for a portfolio
 */
Cypress.Commands.add("toggleHealthcarePublicAPI", (portfolioId, isPublic) => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist").to.exist;

    return cy
      .request({
        method: "POST",
        url: `${backendUrl}/healthcare/admin/toggle-public/${portfolioId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: { isPublic },
        failOnStatusCode: false,
      })
      .then((res) => {
        expect([200, 201], `Toggle public status should succeed`).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Delete a healthcare portfolio
 */
Cypress.Commands.add("deleteHealthcarePortfolioAPI", (portfolioId) => {
  const backendUrl = getBackendUrl();

  return cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token, "Token should exist").to.exist;

    return cy
      .request({
        method: "DELETE",
        url: `${backendUrl}/healthcare/admin/delete/${portfolioId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        failOnStatusCode: false,
      })
      .then((res) => {
        expect([200, 201, 204], `Delete portfolio should succeed`).to.include(res.status);
        return res.body;
      });
  });
});

/**
 * Get public practice data (no auth required)
 */
Cypress.Commands.add("getPublicPracticeDataAPI", (practiceId) => {
  const backendUrl = getBackendUrl();

  return cy
    .request({
      method: "GET",
      url: `${backendUrl}/healthcare/practice/${practiceId}`,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    })
    .then((res) => res);
});

// ============================================
// NAVIGATION COMMANDS
// ============================================

/**
 * Navigate to healthcare admin dashboard
 */
Cypress.Commands.add("visitHealthcareAdmin", (portfolioId) => {
  cy.visit(`/portfolios/healthcare/${portfolioId}/admin/dashboard`);
  cy.url().should("include", `/admin/dashboard`);
  // Wait for loading to complete
  cy.get('[class*="animate-spin"]', { timeout: 10000 }).should("not.exist");
});

/**
 * Navigate to public healthcare portfolio
 */
Cypress.Commands.add("visitHealthcarePortfolio", (portfolioId) => {
  cy.visit(`/portfolios/healthcare/${portfolioId}`);
  cy.get('[class*="animate-spin"]', { timeout: 10000 }).should("not.exist");
});

/**
 * Navigate to admin tab by name
 */
Cypress.Commands.add("navigateToAdminTab", (tabName) => {
  const tabMap = {
    practice: "Practice Info",
    contact: "Contact & Hours",
    services: "Services",
    blog: "Blog Posts",
    gallery: "Gallery",
    ui: "Buttons & Links",
    seo: "SEO Settings",
  };

  const tabLabel = tabMap[tabName] || tabName;
  cy.contains("button", tabLabel).click();
  cy.wait(300); // Allow tab content to load
});

/**
 * Save admin changes and wait for confirmation
 */
Cypress.Commands.add("saveAdminChanges", () => {
  cy.contains("button", "Save Changes").click();
  cy.contains("Saved!", { timeout: 10000 }).should("be.visible");
});

// ============================================
// FORM HELPER COMMANDS
// ============================================

/**
 * Add a service via admin UI
 */
Cypress.Commands.add("addServiceViaUI", (serviceData) => {
  cy.contains("button", "Add Service").click();
  
  if (serviceData.title) {
    cy.get('input[placeholder*="service title"]').clear().type(serviceData.title);
  }
  if (serviceData.description) {
    cy.get('textarea[placeholder*="Describe the service"]').clear().type(serviceData.description);
  }
  if (serviceData.price) {
    cy.get('input[placeholder*="$"]').clear().type(serviceData.price);
  }
  if (serviceData.duration) {
    cy.get('input[placeholder*="minutes"]').clear().type(serviceData.duration);
  }
  
  // Add features if provided
  if (serviceData.features && serviceData.features.length > 0) {
    serviceData.features.forEach((feature) => {
      cy.contains("+ Add Feature").click();
      cy.get('input[placeholder*="Enter feature"]').last().type(feature);
    });
  }

  cy.contains("button", "Save").first().click();
});

/**
 * Add a blog post via admin UI
 */
Cypress.Commands.add("addBlogPostViaUI", (postData) => {
  cy.contains("button", "Add Blog Post").click();
  
  if (postData.title) {
    cy.get('input[placeholder*="Enter post title"]').clear().type(postData.title);
  }
  if (postData.excerpt) {
    cy.get('textarea[placeholder*="Brief description"]').clear().type(postData.excerpt);
  }
  if (postData.content) {
    cy.get('textarea[placeholder*="Write your blog post"]').clear().type(postData.content);
  }
  if (postData.category) {
    cy.get('input[placeholder*="Health Tips"]').clear().type(postData.category);
  }
  if (postData.tags) {
    const tagString = Array.isArray(postData.tags) ? postData.tags.join(", ") : postData.tags;
    cy.get('input[placeholder*="health, wellness"]').clear().type(tagString);
  }
  if (postData.featured) {
    cy.get('input[type="checkbox"]').check();
  }

  cy.contains("button", "Save").click();
});

/**
 * Add a facility image via admin UI
 */
Cypress.Commands.add("addFacilityImageViaUI", (imageData) => {
  cy.contains("button", "Add Facility Image").click();
  
  if (imageData.url) {
    cy.get('input[placeholder*="example.com/image.jpg"]').type(imageData.url);
  }
  if (imageData.caption) {
    cy.get('input[placeholder*="caption"]').type(imageData.caption);
  }
  if (imageData.description) {
    cy.get('textarea[placeholder*="description"]').type(imageData.description);
  }

  cy.contains("button", "Save").click();
});

// ============================================
// SETUP/TEARDOWN COMMANDS
// ============================================

/**
 * Setup test user with healthcare portfolio
 * Creates a new user and portfolio in one step
 */
Cypress.Commands.add("setupHealthcareTestUser", () => {
  const unique = Date.now();
  const email = `healthcare_e2e_${unique}@example.com`;
  const password = "Password123!";

  return cy.apiSignup({ email, password }).then(() => {
    return cy.createHealthcarePortfolioAPI().then((portfolio) => {
      return {
        email,
        password,
        portfolioId: portfolio._id || portfolio.id,
        portfolio,
      };
    });
  });
});

/**
 * Ensure user has at least one healthcare portfolio
 * Creates one if none exist
 */
Cypress.Commands.add("ensureHealthcarePortfolio", () => {
  return cy.getMyHealthcarePortfoliosAPI().then((portfolios) => {
    if (portfolios && portfolios.length > 0) {
      return portfolios[0];
    }
    return cy.createHealthcarePortfolioAPI();
  });
});

/**
 * Visit healthcare admin as owner (similar to vendorStudio.js pattern)
 * Uses intercepts to stub backend responses
 */
Cypress.Commands.add("startHealthcareAsOwner", (options = {}) => {
  const portfolioId = options.portfolioId || "test-healthcare-id";
  const practiceName = options.practiceName || "Test Healthcare Practice";

  // Stub auth
  cy.intercept("GET", "**/user/me", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-user-id",
        role: "user",
        portfolios: [{ portfolioId, portfolioType: "Healthcare" }],
      },
      portfolioIds: [{ portfolioId, portfolioType: "Healthcare" }],
    },
  }).as("getMe");

  // Stub healthcare admin data
  cy.intercept("GET", `**/healthcare/admin/data/${portfolioId}`, {
    statusCode: 200,
    body: {
      _id: portfolioId,
      portfolioType: "Healthcare",
      practice: {
        name: practiceName,
        tagline: "Quality Healthcare",
        description: "Test practice description",
      },
      contact: {
        phone: "+1 555-123-4567",
        email: "test@practice.com",
      },
      services: [],
      blogPosts: [],
      gallery: { facilityImages: [], beforeAfterCases: [] },
      seo: {},
      ui: {},
      isPublic: false,
    },
  }).as("getHealthcareAdmin");

  // Visit admin dashboard
  cy.visit(`/portfolios/healthcare/${portfolioId}/admin/dashboard`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", "test-token");
    },
  });

  cy.wait("@getMe");
});

/**
 * Visit healthcare public portfolio as visitor (similar to vendorStudio.js pattern)
 * Uses intercepts to stub backend responses
 */
Cypress.Commands.add("startHealthcareAsVisitor", (options = {}) => {
  const portfolioId = options.portfolioId || "test-healthcare-id";
  const practiceName = options.practiceName || "Test Healthcare Practice";

  // Stub public practice data (no auth required)
  cy.intercept("GET", `**/healthcare/practice/${portfolioId}`, {
    statusCode: 200,
    body: {
      _id: portfolioId,
      portfolioType: "Healthcare",
      practice: {
        name: practiceName,
        tagline: "Quality Healthcare Services",
        description: "Providing excellent healthcare",
      },
      contact: {
        phone: "+1 555-123-4567",
        email: "info@practice.com",
      },
      services: [
        {
          id: "service-1",
          title: "General Checkup",
          description: "Comprehensive health examination",
          price: "$100",
        },
      ],
      blogPosts: [],
      gallery: { facilityImages: [], beforeAfterCases: [] },
      stats: {
        yearsExperience: "10",
        patientsServed: "5000",
        successRate: "98",
        doctorsCount: "5",
      },
      ui: {
        hero: {
          primaryButtonText: "Get Started",
          secondaryButtonText: "Learn More",
        },
      },
      isPublic: true,
    },
  }).as("getPublicPractice");

  // Visit public portfolio
  cy.visit(`/portfolios/healthcare/${portfolioId}`);

  cy.wait("@getPublicPractice");
});
