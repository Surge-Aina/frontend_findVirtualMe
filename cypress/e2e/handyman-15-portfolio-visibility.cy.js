    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-ADMIN-1 — Admin Portfolio Visibility
     * Exact screenshot flow:
     * Home -> Login modal -> Sign In -> Redirect /profile -> Click Dashboard (top nav) -> Verify My Portfolios + Handyman
     */

    const ADMIN_EMAIL = "admin@test.com";
    const ADMIN_PASSWORD = "Admin@123";

    /**
     * Cookie bar in your screenshot shows "Cookie Settings".
     * There's no guaranteed "Accept" button, so we:
     * - if an Accept/Close exists, click it
     * - otherwise do nothing (but keep clicks forceful where overlap can happen)
     */
    function closeCookieIfPresent() {
    cy.get("body").then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (!bodyText.includes("cookie")) return;

        const candidates = [
        /accept/i,
        /agree/i,
        /ok/i,
        /got it/i,
        /close/i,
        /dismiss/i,
        ];

        for (const re of candidates) {
        const $btn = $body.find("button").filter((_, el) => re.test(el.innerText));
        if ($btn.length) {
            cy.wrap($btn.first()).click({ force: true });
            break;
        }
        }
    });
    }

    describe("FE-E2E-HM-ADMIN-1 — Admin Portfolio Visibility", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it("admin can view handyman portfolios from dashboard", () => {
        // 1) visit /
        cy.visit("/");

        // optional: try to reduce overlap if banner exists
        closeCookieIfPresent();

        // 2) click Log in / Sign up
        cy.contains("button", /log in\s*\/\s*sign up/i)
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

        // 3) enter email + password
        cy.get('input#email, input[placeholder="Email"], input[type="email"], input[name="email"]')
        .first()
        .should("exist")
        .scrollIntoView()
        .clear()
        .type(ADMIN_EMAIL);

        cy.get('input#password, input[placeholder="Password"], input[type="password"], input[name="password"]')
        .first()
        .should("exist")
        .scrollIntoView()
        .clear()
        .type(ADMIN_PASSWORD, { log: false });

        // 4) click Sign In
        cy.contains("button", /^sign in$/i)
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

        // 5) redirected to /profile
        cy.location("pathname", { timeout: 20000 }).should("eq", "/profile");

        // optional: cookie again on profile
        closeCookieIfPresent();

        // 6) click Dashboard from top nav (exact screenshot)
        // Use force in case fixed header / cookie bar overlaps
        cy.contains("a,button", /^dashboard$/i)
        .should("exist")
        .scrollIntoView()
        .click({ force: true });

        // 7) verify /dashboard + content
        cy.location("pathname", { timeout: 20000 }).should("eq", "/dashboard");

        cy.contains(/my portfolios/i, { timeout: 20000 }).should("be.visible");

        // must see handyman card
        cy.contains(/handyman/i).should("exist");

        // your screenshot has both public + private badges
        //cy.contains(/public/i).should("exist");
        //cy.contains(/private/i).should("exist");
    });
    });
