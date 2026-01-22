    // cypress/e2e/handyman-18-refresh-back-deep-linking.cy.js

    describe("FE-E2E-HM-EDGE-3 — Refresh, Back Button & Deep Linking", () => {
    const vendorEmail = "vendor@example.com";
    const vendorPassword = "Password123!";

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

        cy.url({ timeout: 15000 }).should("include", "/profile");
        cy.contains(/personal information/i).should("exist");
    };

    it("handles refresh, back button, and deep links for Handyman showcase, live, and edit routes", () => {
        // ---------- PHASE 1: SHOWCASE (public) ----------
        cy.visit("/portfolios");

        cy.contains(/handyman\s*\/\s*local repair services/i)
        .should("be.visible")
        .click();

        cy.url({ timeout: 15000 }).should("include", "/portfolios/handyman");
        cy.contains(/trusted handyman|quality craftsmanship/i, {
        matchCase: false,
        timeout: 15000,
        }).should("exist");

        // Refresh keeps us on the showcase with content
        cy.reload();
        cy.url().should("include", "/portfolios/handyman");
        cy.contains(/trusted handyman|quality craftsmanship/i, {
        matchCase: false,
        timeout: 15000,
        }).should("exist");

        // Back → example portfolios list
        cy.go("back");
        cy.url({ timeout: 15000 }).should("include", "/portfolios");
        cy.contains(/example portfolios|handyman\s*\/\s*local repair services/i, {
        matchCase: false,
        }).should("exist");

        // Forward → Handyman showcase again
        cy.go("forward");
        cy.url({ timeout: 15000 }).should("include", "/portfolios/handyman");
        cy.contains(/trusted handyman|quality craftsmanship/i, {
        matchCase: false,
        timeout: 15000,
        }).should("exist");

        // ---------- PHASE 2: LIVE + EDIT (authenticated vendor) ----------
        cy.visit("/");
        loginViaModal(vendorEmail, vendorPassword);

        // Go to dashboard
        cy.contains("a,button", /^dashboard$/i)
        .should("exist")
        .click();
        cy.url({ timeout: 15000 }).should("include", "/dashboard");

        // Start Handyman portfolio flow
        cy.contains(/add portfolio/i)
        .should("exist")
        .click();
        cy.url({ timeout: 15000 }).should("include", "/resume");

        cy.contains(/handyman\s*\/\s*local repair services/i)
        .should("be.visible")
        .click();

        // We should now be on a *real* handyman portfolio URL
        cy.url({ timeout: 20000 })
        .should("match", /\/portfolios\/handyman\/[^/]+$/)
        .then((liveUrl) => {
            const editUrl = `${liveUrl}/edit`;

            // LIVE page content
            cy.contains(/trusted handyman|home repairs/i, {
            matchCase: false,
            timeout: 20000,
            }).should("exist");

            // If owner, we should see edit banner link
            cy.contains(/click here to edit/i, { timeout: 20000 }).should(
            "be.visible"
            );

            // Refresh LIVE – still under same route and content intact
            cy.reload();
            cy.url().should("eq", liveUrl);
            cy.contains(/trusted handyman|home repairs/i, {
            matchCase: false,
            timeout: 20000,
            }).should("exist");
            cy.contains(/click here to edit/i).should("be.visible");

            // Deep-link directly to EDIT route – must show edit UI
            cy.visit(editUrl);
            cy.url({ timeout: 20000 }).should("eq", editUrl);
            cy.contains(/edit your handyman portfolio/i, {
            timeout: 20000,
            }).should("be.visible");
            cy.get('input[name="hero.title"]', { timeout: 20000 }).should("exist");

            // Refresh EDIT:
            // App may either stay on /edit or redirect back to live route.
            cy.reload();
            cy.url().then((currentUrl) => {
            if (currentUrl === editUrl) {
                // Strict edit-mode reload works
                cy.contains(/edit your handyman portfolio/i).should("be.visible");
                cy.get('input[name="hero.title"]').should("exist");
            } else {
                // Some flows redirect back to LIVE on reload – still acceptable
                expect(currentUrl).to.eq(liveUrl);
                cy.contains(/trusted handyman|home repairs/i, {
                matchCase: false,
                }).should("exist");
                cy.contains(/click here to edit/i).should("be.visible");
            }
            });

            // Back/forward around live/edit may vary depending on redirect,
            // so we don't enforce strict history order here — core deep-link + refresh
            // behavior is already covered above.
        });
    });
    });
