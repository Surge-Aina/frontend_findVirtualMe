// cypress/e2e/ticketing.cy.js
/// <reference types="cypress" />

/**
 * ⚠️ IMPORTANT: These tests use FAKE VALUES and STUBS only
 * - No real backend required - only frontend needs to run
 * - All API calls are intercepted and stubbed
 * - Authentication uses localStorage with fake tokens
 * - All ticket data is mocked
 */

// Ignore network-level Axios errors when backend is down.
Cypress.on("uncaught:exception", (err) => {
  if (err && err.message && err.message.includes("Network Error")) {
    return false;
  }
  return true;
});

const withCookieConsent = (path = "/") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("cookieConsent", "accepted");
    },
  });
};

const visitAsVendor = (path, { email, role = "vendor" } = {}) => {
  const vendorEmail = email || "vendor@example.com";
  
  // Stub /user/me so AuthContext can resolve user without real backend
  cy.intercept("GET", "**/user/me", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-vendor-id",
        email: vendorEmail,
        role,
        firstName: "Test",
        LastName: "Vendor",
        portfolios: ["test-portfolio-123"], // Fake portfolio data
      },
    },
  }).as("getMe");

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("cookieConsent", "accepted");
      // Use fake token - no real authentication needed
      win.localStorage.setItem("token", "fake-vendor-token-12345");
      win.localStorage.setItem("email", vendorEmail);
      win.localStorage.setItem("userId", "test-vendor-id");
    },
  });

  cy.wait("@getMe");
};

const visitAsAdmin = (path, { email, role = "admin" } = {}) => {
  const adminEmail = email || "admin@example.com";
  
  // Stub /user/me so AuthContext can resolve user without real backend
  cy.intercept("GET", "**/user/me", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-admin-id",
        email: adminEmail,
        role,
      },
    },
  }).as("getMe");

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("cookieConsent", "accepted");
      // Use fake token - no real authentication needed
      win.localStorage.setItem("token", "fake-admin-token-67890");
      win.localStorage.setItem("email", adminEmail);
      win.localStorage.setItem("userId", "test-admin-id");
    },
  });

  cy.wait("@getMe");
};

describe("FE-E2E-TICKETING – Ticketing System", () => {
  // Global setup: Stub all potential API endpoints that might be called
  beforeEach(() => {
    // Stub ticket status update endpoint (in case user clicks status buttons)
    cy.intercept("PUT", "**/support-form/*", {
      statusCode: 200,
      body: { ok: true, status: "In Progress" },
    }).as("updateTicketStatus");

    // Stub ticket delete endpoint (in case user clicks delete)
    cy.intercept("DELETE", "**/support-form/*", {
      statusCode: 200,
      body: { ok: true },
    }).as("deleteTicket");

    // Stub ticket reply endpoint (in case user adds reply)
    cy.intercept("POST", "**/support-form/*/replies", {
      statusCode: 200,
      body: { ok: true, replies: ["Test reply"] },
    }).as("addReply");
  });

  // -----------------------------------------
  // FE-E2E-TICKETING-1 – Create support ticket from UI
  // -----------------------------------------
  describe("Create support ticket from UI", () => {
    it("logged-in vendor can create ticket, see it listed in ticketing section", () => {
      const ticketId = `T${Date.now()}`;
      const ticketData = {
        ticketID: ticketId,
        requestType: "Report a technical issue",
        name: "Test Vendor",
        email: "vendor@example.com",
        message: "I am experiencing a bug with the portfolio editor",
        status: "New",
        priority: "Normal",
        createdAt: new Date().toISOString(),
        replies: [],
      };

      // Mock ticket creation endpoint
      cy.intercept("POST", "**/support-form/with-email", {
        statusCode: 200,
        body: {
          ok: true,
          ticketID: ticketId,
          message: "Request submitted successfully",
        },
      }).as("createTicket");

      // Stub ticket listing endpoint - returns fake ticket data
      cy.intercept("GET", "**/support-form", {
        statusCode: 200,
        body: [ticketData],
      }).as("getTickets");

      // Visit support form as logged-in vendor
      visitAsVendor("/support");

      // Verify we're on the support page
      cy.contains("Support & Help").should("be.visible");

      // Fill out the support form
      // Note: For logged-in users, name/email fields are pre-filled from user context
      // and may be hidden. We skip filling them to avoid page re-render issues.
      // The form will use the pre-filled values from the user context.

      // Select request type
      cy.get('select[name="requestType"]').select("Report a technical issue");

      // Fill portfolio ID (optional)
      cy.get('input[name="portfolioId"]').type("test-portfolio-123");

      // Fill message
      cy.get('textarea[name="message"]').type("I am experiencing a bug with the portfolio editor");

      // Submit the form
      cy.contains("button", "Submit Request").click();

      // Wait for ticket creation
      cy.wait("@createTicket");

      // Verify success message (toast notification)
      // The ITForm component shows a toast on success
      cy.contains("Request submitted successfully", { timeout: 5000 }).should("exist");

      // Navigate to ticketing system to verify ticket appears
      // Note: Based on AdminRoute, only admins can access /itadmin/ticketing-system
      // For this test, we'll verify as admin that the ticket was created
      visitAsAdmin("/itadmin/ticketing-system");

      // Wait for tickets to load
      cy.wait("@getTickets");

      // Verify ticket board is visible
      cy.contains("Ticket Board").should("be.visible");

      // Verify the created ticket appears in the list
      cy.contains(ticketId).should("be.visible");
      cy.contains("Report a technical issue").should("be.visible");
      
      // Message content is only visible when ticket details are expanded
      // Click "Description / Details" button to expand ticket details
      cy.contains("button", "Description / Details").first().click();
      
      // Now verify the message content is visible
      cy.contains("I am experiencing a bug with the portfolio editor").should("be.visible");
    });

    it("guest user can create ticket via support form", () => {
      const ticketId = `T${Date.now()}`;

      // Stub ticket creation endpoint - returns fake success response
      cy.intercept("POST", "**/support-form/with-email", {
        statusCode: 200,
        body: {
          ok: true,
          ticketID: ticketId,
          message: "Request submitted successfully",
        },
      }).as("createTicket");

      withCookieConsent("/support");

      // Verify we're on the support page
      cy.contains("Support & Help").should("be.visible");

      // Fill out all required fields (guest users see all fields)
      cy.get('input[name="name"]').type("Guest User");
      cy.get('input[name="email"]').type("guest@example.com");
      cy.get('select[name="requestType"]').select("Request additional portfolio slots");
      cy.get('textarea[name="message"]').type("I would like to request more portfolio slots for my account");

      // Submit the form
      cy.contains("button", "Submit Request").click();

      // Wait for ticket creation
      cy.wait("@createTicket");

      // Verify success message
      cy.contains("Request submitted successfully", { timeout: 5000 }).should("exist");
    });
  });

  // -----------------------------------------
  // FE-E2E-TICKETING-2 – Ticket detail view
  // -----------------------------------------
  describe("Ticket detail view", () => {
    it("navigate from list to detail view, status & metadata render correctly", () => {
      const ticketId = "T12345";
      const ticketData = {
        ticketID: ticketId,
        requestType: "Upgrade subscription",
        name: "John Doe",
        email: "john.doe@example.com",
        message: "I would like to upgrade my subscription to the premium plan. Please let me know the steps.",
        status: "In Progress",
        priority: "High",
        createdAt: "2024-01-15T10:30:00.000Z",
        completionTime: null,
        replies: [
          "We've received your request and are processing it.",
          "Your subscription upgrade is being reviewed by our team.",
        ],
      };

      // Stub ticket listing endpoint - returns fake ticket data
      cy.intercept("GET", "**/support-form", {
        statusCode: 200,
        body: [ticketData],
      }).as("getTickets");

      // Visit ticketing system as admin
      visitAsAdmin("/itadmin/ticketing-system");

      // Wait for tickets to load
      cy.wait("@getTickets");

      // Verify ticket board is visible
      cy.contains("Ticket Board").should("be.visible");

      // Verify ticket appears in the list
      cy.contains(ticketId).should("be.visible");
      cy.contains("Upgrade subscription").should("be.visible");

      // Click "Description / Details" button to expand ticket details
      cy.contains("button", "Description / Details").first().click();

      // Verify ticket details are expanded and visible - scroll to ensure elements are visible
      cy.contains("Description").scrollIntoView().should("be.visible");
      cy.contains("I would like to upgrade my subscription to the premium plan").scrollIntoView().should("be.visible");

      // Verify metadata is displayed
      // Note: These elements may be in a scrollable container with overflow,
      // so we verify existence and content rather than strict visibility
      cy.contains("Name:").should("exist");
      cy.contains("John Doe").should("exist");
      cy.contains("Email:").should("exist");
      cy.contains("john.doe@example.com").should("exist");
      cy.contains("Created At:").should("exist");
      cy.contains("Completion Time:").should("exist");

      // Verify status badge - scroll to ensure it's visible
      cy.contains("Status: In Progress").scrollIntoView().should("be.visible");

      // Verify priority badge - scroll to ensure it's visible
      cy.contains("Priority: High").scrollIntoView().should("be.visible");

      // Verify replies section - scroll to ensure elements are visible
      cy.contains("Replies").scrollIntoView().should("be.visible");
      cy.contains("We've received your request and are processing it.").scrollIntoView().should("be.visible");
      cy.contains("Your subscription upgrade is being reviewed by our team.").scrollIntoView().should("be.visible");

      // Verify action buttons are present
      cy.contains("button", "Mark as Completed").should("be.visible");
      cy.contains("button", "Delete Ticket").should("be.visible");
    });

    it("ticket with no replies shows appropriate message", () => {
      const ticketId = "T67890";
      const ticketData = {
        ticketID: ticketId,
        requestType: "Coupon not working",
        name: "Jane Smith",
        email: "jane@example.com",
        message: "My coupon code is not being accepted at checkout",
        status: "New",
        priority: "Normal",
        createdAt: "2024-01-20T14:00:00.000Z",
        completionTime: null,
        replies: [],
      };

      // Stub ticket listing endpoint - returns fake ticket data
      cy.intercept("GET", "**/support-form", {
        statusCode: 200,
        body: [ticketData],
      }).as("getTickets");

      visitAsAdmin("/itadmin/ticketing-system");
      cy.wait("@getTickets");

      cy.contains("Ticket Board").should("be.visible");
      cy.contains(ticketId).should("be.visible");

      // Expand ticket details
      cy.contains("button", "Description / Details").first().click();

      // Verify "No replies yet" message
      cy.contains("No replies yet").should("be.visible");

      // Verify reply form is visible for non-completed tickets
      cy.get('textarea[placeholder="Write a reply…"]').should("be.visible");
    });

    it("completed ticket does not show reply form", () => {
      const ticketId = "T99999";
      const ticketData = {
        ticketID: ticketId,
        requestType: "Delete my account",
        name: "Test User",
        email: "test@example.com",
        message: "Please delete my account",
        status: "Completed",
        priority: "Normal",
        createdAt: "2024-01-10T09:00:00.000Z",
        completionTime: "2024-01-12T15:30:00.000Z",
        replies: ["Account deletion request processed."],
      };

      // Stub ticket listing endpoint - returns fake ticket data
      cy.intercept("GET", "**/support-form", {
        statusCode: 200,
        body: [ticketData],
      }).as("getTickets");

      visitAsAdmin("/itadmin/ticketing-system");
      cy.wait("@getTickets");

      cy.contains("Ticket Board").should("be.visible");
      cy.contains(ticketId).should("be.visible");

      // Expand ticket details
      cy.contains("button", "Description / Details").first().click();

      // Verify status is Completed
      // Scroll to element first to ensure it's in viewport
      cy.contains("Status: Completed").scrollIntoView().should("be.visible");

      // Verify completion time is shown
      cy.contains("Completion Time:").scrollIntoView().should("be.visible");

      // Verify reply form is NOT visible for completed tickets
      cy.get('textarea[placeholder="Write a reply…"]').should("not.exist");
    });
  });

  // -----------------------------------------
  // FE-E2E-TICKETING-3 – Ticket filtering and status columns
  // -----------------------------------------
  describe("Ticket filtering and status columns", () => {
    it("can toggle between all tickets view and status-split view", () => {
      const tickets = [
        {
          ticketID: "T001",
          requestType: "New Ticket",
          name: "User 1",
          email: "user1@example.com",
          message: "New ticket message",
          status: "New",
          priority: "Normal",
          createdAt: new Date().toISOString(),
          replies: [],
        },
        {
          ticketID: "T002",
          requestType: "In Progress Ticket",
          name: "User 2",
          email: "user2@example.com",
          message: "In progress ticket message",
          status: "In Progress",
          priority: "High",
          createdAt: new Date().toISOString(),
          replies: [],
        },
        {
          ticketID: "T003",
          requestType: "Completed Ticket",
          name: "User 3",
          email: "user3@example.com",
          message: "Completed ticket message",
          status: "Completed",
          priority: "Normal",
          createdAt: new Date().toISOString(),
          replies: [],
        },
      ];

      // Stub ticket listing endpoint - returns fake ticket data
      cy.intercept("GET", "**/support-form", {
        statusCode: 200,
        body: tickets,
      }).as("getTickets");

      visitAsAdmin("/itadmin/ticketing-system");
      cy.wait("@getTickets");

      cy.contains("Ticket Board").should("be.visible");

      // Initially should show "All" view (default)
      cy.contains("All (3)").should("be.visible");

      // Toggle to split by status
      cy.contains("button", "Filter: On (Split by Status)").click();

      // Verify status columns appear
      cy.contains("New (1)").should("be.visible");
      cy.contains("In Progress (1)").should("be.visible");
      cy.contains("Completed (1)").should("be.visible");

      // Toggle back to all view
      cy.contains("button", "Filter: Off (Show All)").click();

      // Verify back to all view
      cy.contains("All (3)").should("be.visible");
    });
  });
});

