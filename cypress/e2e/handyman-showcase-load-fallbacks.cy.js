    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-GUEST-1 — Public Showcase Load & Fallbacks
     *
     * Validates the public Handyman Showcase page loads for guests:
     * - Hero, Services, Portfolio (static), Process, Testimonials, Contact
     * - Checks “fallback-ish” behavior:
     *   - Hero badges render via component defaults
     *   - Testimonials optional fields (location/service) not required
     *   - Contact form is demo mode on Showcase (disabled inputs + disabled submit)
     */

    describe("FE-E2E-HM-GUEST-1 — Public Showcase Load & Fallbacks", () => {
    it("loads all showcase sections and applies graceful fallbacks", () => {
        // Public showcase route (non-dynamic)
        cy.visit("/portfolios/handyman");

        // HERO
        cy.get("section#home").should("be.visible");
        cy.get("section#home .hero-h1").should("be.visible").and("not.be.empty");
        cy.get("section#home .hero-sub").should("be.visible");

        // Fallback / defaults: badges always render (from Hero defaults if not provided)
        cy.get("section#home .hero-badges li").should("have.length", 3);
        cy.get("section#home .hero-badges").should("contain.text", "Licensed");
        cy.get("section#home .hero-badges").should("contain.text", "5-Star");
        cy.get("section#home .hero-badges").should("contain.text", "24/7");

        // SERVICES
        cy.get("section#services").should("be.visible");
        cy.get("section#services h2").should("contain.text", "Our Services");
        cy.get("section#services .service-card").its("length").should("be.gte", 1);

        // PORTFOLIO (static mode on showcase)
        cy.get("section#portfolio").scrollIntoView().should("be.visible");
        cy.get("section#portfolio .portfolio-title")
        .should("be.visible")
        .and("not.be.empty");
        cy.get("section#portfolio .projects-grid .project-card")
        .its("length")
        .should("be.gte", 1);

        // Filters render (at least "All")
        cy.get("section#portfolio .portfolio-filters button")
        .contains(/^all$/i)
        .should("be.visible");

        // PROCESS
        cy.get("section#process").scrollIntoView().should("be.visible");
        cy.get("section#process h2").should("be.visible");
        cy.get("section#process .timeline-item").its("length").should("be.gte", 1);

        // TESTIMONIALS
        cy.get("section#testimonials").scrollIntoView().should("be.visible");
        cy.get("section#testimonials h2").should("be.visible");
        cy.get("section#testimonials .testimonial-card").its("length").should("be.gte", 1);

        // Optional fields should not be required: location/service can be absent without breaking layout
        cy.get("section#testimonials .testimonial-card .t-name").first().should("be.visible");
        cy.get("section#testimonials .testimonial-card .t-location").should("have.length.lte", 2);
        cy.get("section#testimonials .testimonial-card .t-service").should("have.length.lte", 2);

        // CONTACT (Showcase = demo mode -> disabled)
        cy.get("section#contact").scrollIntoView().should("be.visible");
        cy.get("section#contact input#name").should("be.disabled");
        cy.get("section#contact input#phone").should("be.disabled");
        cy.get("section#contact input#email").should("be.disabled");
        cy.get("section#contact textarea#message").should("be.disabled");

        // Submit is disabled in demo mode (blocked on showcase)
        cy.get("section#contact button.contact-submit")
        .should("be.disabled")
        .and("contain.text", "Request Free Estimate");
    });
    });
