    // cypress/e2e/handyman-16-edit-logs-audit-trail.cy.js

    describe("FE-E2E-HM-ADMIN-2 — Portfolio Edit Logs & Audit Trail", () => {
    it("creates then updates a handyman portfolio and confirms both log entries", () => {
        // --- INTERCEPTS FOR STABILITY ON EDIT PAGE ---
        // Your app sometimes calls /api/user/me and gets 404, which causes a redirect.
        // We stub it as a valid admin user so the edit page stays mounted.
        cy.intercept("GET", "**/api/users/me", {
        statusCode: 200,
        body: {
            _id: "admin-stub-id",
            email: "admin@test.com",
            role: "admin",
            name: "Admin User",
        },
        }).as("apiUserMe");

        cy.intercept("GET", "**/api/handyman-template/*").as("handymanTemplate");
        cy.intercept("GET", "**/api/handyman/portfolio*").as("handymanPortfolio");

        // 1) Login with admin credentials via UI
        cy.visit("/");

        cy.contains("button", /log in\s*\/\s*sign up/i)
        .should("exist")
        .click({ force: true });

        cy.get('input[name="email"]')
        .should("exist")
        .clear()
        .type("admin@test.com");

        cy.get('input[name="password"]')
        .should("exist")
        .clear()
        .type("Admin@123", { log: false });

        cy.contains("button", /^sign in$/i)
        .should("exist")
        .click({ force: true });

        // 2) Land on profile page
        cy.url({ timeout: 15000 }).should("include", "/profile");
        cy.contains(/personal information/i).should("exist");

        // 3) Go to dashboard
        cy.contains("a,button", /^dashboard$/i)
        .should("exist")
        .click();

        cy.url({ timeout: 15000 }).should("include", "/dashboard");

        // 4) Click "Add portfolio" and create a new handyman portfolio
        cy.contains(/add portfolio/i)
        .should("be.visible")
        .click();

        cy.url({ timeout: 15000 }).should("include", "/resume");

        cy.contains(/handyman\s*\/\s*local repair services/i)
        .should("be.visible")
        .click();

        // 5) That will take you to that portfolio
        cy.url({ timeout: 20000 }).should(
        "match",
        /\/portfolios\/handyman\/[^/]+$/
        );

        cy.contains(/trusted handyman/i, { timeout: 20000 }).should("exist");

        // 6) Edit that portfolio (any minor edit is fine)
        // Use the "Click here to edit" banner on the portfolio page
        cy.contains(/click here to edit/i, { timeout: 20000 })
        .should("be.visible")
        .click();

        cy.url({ timeout: 20000 }).should(
        "match",
        /\/portfolios\/handyman\/[^/]+\/edit$/
        );

        // Wait for the edit form data to fully load
        cy.wait("@handymanTemplate");
        cy.wait("@handymanPortfolio");

        cy.contains(/edit your handyman portfolio/i, { timeout: 20000 }).should(
        "be.visible"
        );

        // Safely edit a field (hero.title) once the page is stable
        cy.get('input[name="hero.title"]', { timeout: 15000 })
        .should("exist")
        .should("be.visible")
        .then(($input) => {
            cy.wrap($input)
            .clear()
            .type("Trusted Handyman – updated by Cypress");
        });

        cy.contains("button", /save changes/i)
        .should("be.enabled")
        .click();

        cy.contains(/all changes saved|changes saved|portfolio updated/i, {
        timeout: 20000,
        }).should("be.visible");

        // 7) Click on Admin button on nav bar
        cy.contains("a,button", /^admin$/i)
        .should("be.visible")
        .click();

        cy.url({ timeout: 15000 }).should("include", "/admin");

        // 8) Click on logs
        cy.contains("button,a", /^logs$/i)
        .should("be.visible")
        .click();

        cy.url({ timeout: 15000 }).should("include", "/logs");
        cy.contains(/portfolio edit logs/i, { timeout: 15000 }).should(
        "be.visible"
        );

        // 9) Check if you see the portfolio creation log and update log
        cy.get("table", { timeout: 15000 }).within(() => {
        // created + handyman
        cy.get("tr")
            .filter(':contains("handyman")')
            .filter(':contains("created")')
            .should("have.length.at.least", 1);

        // updated + handyman
        cy.get("tr")
            .filter(':contains("handyman")')
            .filter(':contains("updated")')
            .should("have.length.at.least", 1);
        });

        // 10) Choose any one of the logs and click on view button
        cy.get("table")
        .contains("tr", /handyman/i)
        .first()
        .within(() => {
            cy.contains(/view/i).click();
        });

        // 11) Check that log details open at the bottom of the page
        cy.contains(/log details/i, { timeout: 10000 }).should("be.visible");
        cy.contains(/mouse events/i).should("be.visible");
        cy.contains(/portfolio id/i).should("be.visible");
    });
    });
