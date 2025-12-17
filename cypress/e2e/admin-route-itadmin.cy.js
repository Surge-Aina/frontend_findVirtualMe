/// <reference types="cypress" />

/**
 * FE-E2E-ADMIN-1 – Admin-only route protection (ITAdminPage via AdminRoute)
 * 
 * Tests that AdminRoute correctly:
 * - Blocks unauthenticated users (redirects to home)
 * - Blocks non-admin authenticated users (redirects to home)
 * - Allows admin users to access admin routes
 * 
 * Routes tested:
 * - /admin-choice (protected with AdminRoute, shows AdminChoicePanel)
 * 
 * Note: /admin_page shows ITAdminPage but is NOT currently protected with AdminRoute.
 * This test focuses on routes that ARE protected with AdminRoute.
 */

// Ignore network-level Axios errors when backend is down.
// We still assert all the routing + UI behavior we care about.
Cypress.on("uncaught:exception", (err) => {
  if (err && err.message && err.message.includes("Network Error")) {
    // returning false here prevents Cypress from failing the test
    return false;
  }
  // Let all other errors fail the test as normal
  return true;
});

/**
 * Helper: Visit a route as an unauthenticated guest
 */
const visitAsGuest = (path = "/") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      // Avoid cookie banner interfering with UI
      win.localStorage.setItem("cookieConsent", "accepted");

      // Ensure no auth state
      win.localStorage.removeItem("token");
      win.localStorage.removeItem("email");
      win.localStorage.removeItem("userId");
    },
  });
};

/**
 * Helper: Visit a route as an authenticated user with a specific role
 */
const visitAsUser = (path, { email, role }) => {
  // Stub /user/me so AuthContext can resolve user without real backend
  cy.intercept("GET", "**/user/me", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-user-id",
        email,
        role, // "user", "admin", "vendor", etc.
      },
    },
  }).as("getMe");

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("cookieConsent", "accepted");

      // AuthContext reads token + email from localStorage on start
      win.localStorage.setItem("token", "fake-token");
      win.localStorage.setItem("email", email);
    },
  });

  cy.wait("@getMe");
};

describe("FE-E2E-ADMIN-1 – Admin-only route protection", () => {
  context("Admin-only route: /admin-choice (protected with AdminRoute)", () => {
    it("redirects unauthenticated users from admin route back to home", () => {
      // No token in storage
      visitAsGuest("/admin-choice");

      // AdminRoute: if !token → Navigate to "/"
      cy.location("pathname").should("eq", "/");

      // Navbar in guest state: login button visible
      cy.contains("button", "Log in / Sign up").should("be.visible");
    });

    it("prevents non-admin authenticated users from accessing admin route", () => {
      // Simulate a logged-in user WITHOUT admin role (e.g., regular user)
      visitAsUser("/admin-choice", {
        email: "user@example.com",
        role: "user",
      });

      // AdminRoute: token present, but user.role !== "admin" → back to "/"
      cy.location("pathname").should("eq", "/");

      // We are still "logged in" from the app's perspective
      cy.contains("button", "Profile").should("exist");
      cy.contains("button", "Logout").should("exist");
    });

    it("prevents vendor users from accessing admin route", () => {
      // Simulate a logged-in vendor user (non-admin)
      visitAsUser("/admin-choice", {
        email: "vendor@example.com",
        role: "vendor",
      });

      // AdminRoute: token present, but user.role !== "admin" → back to "/"
      cy.location("pathname").should("eq", "/");

      // We are still "logged in" from the app's perspective
      cy.contains("button", "Profile").should("exist");
      cy.contains("button", "Logout").should("exist");
    });

    it("allows admin user to access the admin choice panel", () => {
      // Simulate admin user
      visitAsUser("/admin-choice", {
        email: "admin@example.com",
        role: "admin",
      });

      // We should stay on the admin route
      cy.location("pathname").should("eq", "/admin-choice");

      // AdminChoicePanel should be visible with navigation buttons
      cy.contains("button", "Logs").should("be.visible");
      cy.contains("button", "Ticketing System").should("be.visible");
    });

    it("admin user can navigate to admin sub-routes from choice panel", () => {
      // Start as admin on the choice panel
      visitAsUser("/admin-choice", {
        email: "admin@example.com",
        role: "admin",
      });

      // Click on "Logs" button
      cy.contains("button", "Logs").click();
      
      // Should navigate to /itadmin/logs (also protected with AdminRoute)
      cy.location("pathname").should("eq", "/itadmin/logs");

      // Navigate back to choice panel
      cy.visit("/admin-choice");
      cy.location("pathname").should("eq", "/admin-choice");

      // Click on "Ticketing System" button
      cy.contains("button", "Ticketing System").click();
      
      // Should navigate to /itadmin/ticketing-system (also protected with AdminRoute)
      cy.location("pathname").should("eq", "/itadmin/ticketing-system");
    });
  });

  context("Other admin routes protected with AdminRoute", () => {
    it("blocks non-admin users from accessing /itadmin/logs", () => {
      visitAsUser("/itadmin/logs", {
        email: "user@example.com",
        role: "user",
      });

      // Should be redirected to home
      cy.location("pathname").should("eq", "/");
    });

    it("allows admin users to access /itadmin/logs", () => {
      // Stub any API calls that PortfolioEditLogViewer might make
      cy.intercept("GET", "**/api/**", {
        statusCode: 200,
        body: [],
      }).as("getLogs");

      visitAsUser("/itadmin/logs", {
        email: "admin@example.com",
        role: "admin",
      });

      // Should stay on the logs page
      cy.location("pathname").should("eq", "/itadmin/logs");
    });
  });
});

