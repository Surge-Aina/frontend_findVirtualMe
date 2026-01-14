    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-GUEST-3 — Dynamic Portfolio Page (Invalid / Missing ID)
     *
     * Adjusted to match actual routing/guards:
     * - "Missing ID" => /portfolios/handyman lands on Showcase (not dynamic page)
     * - "Malformed ID" may be blocked client-side => no API request occurs
     */

    describe("FE-E2E-HM-GUEST-3 — Dynamic Portfolio Page (Invalid / Missing ID)", () => {
    it("missing ID: lands on Showcase (no crash, user sees public page)", () => {
        cy.visit("/portfolios/handyman/");

        // Should land on the showcase route and render hero/services etc.
        cy.location("pathname").should("match", /^\/portfolios\/handyman\/?$/);

        cy.get("section#home").should("be.visible");
        cy.get("section#services").should("be.visible");
        cy.get("section#contact").should("be.visible");
    });

    it("invalid ID (404): shows friendly error state", () => {
        const badId = "does-not-exist-404";

        cy.intercept("GET", `**/api/handyman-template/${badId}`, {
        statusCode: 404,
        body: { message: "Not found" },
        }).as("getBadTemplate");

        cy.visit(`/portfolios/handyman/${badId}`);
        cy.wait("@getBadTemplate");

        cy.contains("Could not load this portfolio.").should("be.visible");
        cy.contains("Loading...").should("not.exist");
    });

    it("malformed ID: shows friendly error and does not crash (may be blocked client-side)", () => {
        const malformedId = "%%%";
        const encoded = encodeURIComponent(malformedId); // %25%25%25

        // Intercept any template call; if guard blocks, no request should happen.
        cy.intercept("GET", "**/api/handyman-template/*").as("getAnyTemplate");

        cy.visit(`/portfolios/handyman/${encoded}`);

        // If a client-side guard exists, you should see the same friendly error state
        // without any API call.
        cy.contains("Could not load this portfolio.").should("be.visible");

        // Assert that template request did NOT happen (guard prevented it)
        cy.get("@getAnyTemplate.all").then((calls) => {
        expect(calls, "template GET calls").to.have.length(0);
        });
    });
    });
