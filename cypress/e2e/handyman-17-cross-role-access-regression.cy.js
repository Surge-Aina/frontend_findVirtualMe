    // cypress/e2e/handyman-18-cross-role-access-regression.cy.js

    describe("FE-E2E-HM-ADMIN-4 — Cross-Role Access Regression", () => {
    const loginViaModal = (email, password) => {
        cy.contains("button", /log in\s*\/\s*sign up/i)
        .should("exist")
        .click({ force: true });

        cy.get(
        'input#email, input[placeholder="Email"], input[type="email"], input[name="email"]'
        )
        .first()
        .should("exist")
        .clear()
        .type(email);

        cy.get(
        'input#password, input[placeholder="Password"], input[type="password"], input[name="password"]'
        )
        .first()
        .should("exist")
        .clear()
        .type(password, { log: false });

        cy.contains("button", /^sign in$/i)
        .should("exist")
        .click({ force: true });

        // land on profile
        cy.url({ timeout: 15000 }).should("include", "/profile");
        cy.contains(/personal information/i).should("exist");
    };

    it("runs admin, vendor, and guest flows in succession without leaking access", () => {
        // ------- PHASE 1: ADMIN SESSION -------
        cy.visit("/");

        loginViaModal("admin@test.com", "Admin@123");

        // Admin-only navigation visible
        cy.contains("a,button", /^admin$/i).should("exist");

        // Admin can access /admin (admin choice page)
        cy.visit("/admin");
        cy.url({ timeout: 15000 }).should("include", "/admin");
        cy.contains(/logs|ticketing system|admin/i, { matchCase: false }).should(
        "exist"
        );

        // End admin session
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/");

        // ------- PHASE 2: VENDOR SESSION -------
        // NOTE: vendor seeded user
        loginViaModal("vendor@example.com", "Password123!");

        // After fresh vendor login, admin nav must NOT be present
        cy.contains("a,button", /^admin$/i).should("not.exist");

        // Vendor can still use normal vendor features like dashboard
        cy.contains("a,button", /^dashboard$/i)
        .should("exist")
        .click();
        cy.url({ timeout: 15000 }).should("include", "/dashboard");

        // End vendor session
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/");

        // ------- PHASE 3: GUEST SESSION (no login) -------
        // Guest hits dashboard: should not see private dashboard UI
        cy.visit("/dashboard");
        cy.url().then(() => {
        cy.contains(/your dashboard|my projects|studio/i, {
            matchCase: false,
        }).should("not.exist");

        // Guest should see login / sign up CTA somewhere
        cy.contains("button", /log in\s*\/\s*sign up/i).should("exist");
        });

        // Guest hits admin logs directly: must not see admin UI
        cy.visit("/itadmin/logs");
        cy.url().then(() => {
        cy.contains(/portfolio edit logs/i, { matchCase: false }).should(
            "not.exist"
        );
        cy.contains("button", /log in\s*\/\s*sign up/i).should("exist");
        });
    });
    });
