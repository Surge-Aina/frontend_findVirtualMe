    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-GUEST-2 — Dynamic Portfolio Page (Valid ID)
     *
     * Ensures a public visitor can load a published portfolio at:
     * /portfolios/handyman/:id
     * Validates hydration for:
     * - hero
     * - services
     * - projects (portfolio fetch)
     * - contact details
     *
     * (We keep it guest/public; no auth needed.)
     */

    describe("FE-E2E-HM-GUEST-2 — Dynamic Portfolio Page (Valid ID)", () => {
    const templateId = "hm-public-template-1";

    const mockTemplate = {
        _id: templateId,
        userId: "owner-user-123",
        hero: {
        title: "Harshal’s Handyman Services",
        subtitle: "Fast, reliable repairs — book today.",
        phoneNumber: "(650) 555-0199",
        // intentionally omit badges/cta to rely on Hero defaults (fallbacks)
        imageUrl: "https://via.placeholder.com/1200x800?text=Hero",
        },
        servicesSectionTitle: "What I Can Help With",
        servicesSectionIntro: "Common home repairs & upgrades.",
        services: [
        { icon: "🔧", title: "General Repairs", description: "Small fixes & installs." },
        { icon: "💧", title: "Plumbing", description: "Faucets, leaks, toilets." },
        ],
        portfolioTitle: "Recent Work",
        portfolioSubtitle: "Before & after projects.",
        portfolioAllLabel: "All",
        processSteps: [
        { number: 1, title: "Reach Out", description: "Tell us what you need." },
        { number: 2, title: "Schedule", description: "Pick a time that works." },
        ],
        // Use empty testimonials to validate fallback UI on dynamic page
        testimonials: [],
        contact: {
        title: "Request a Quote",
        subtitle: "We respond within 24 hours.",
        formTitle: "Send a message",
        phone: "(650) 555-0199",
        email: "hello@handyman.test",
        hours: "Mon–Sat: 8AM–6PM",
        note: "Emergency calls available",
        },
    };

    const mockProjects = [
        {
        _id: "p1",
        title: "Drywall Patch",
        subtitle: "Seamless finish",
        category: "Repairs",
        beforeImageUrl: "https://via.placeholder.com/600x400?text=Before",
        afterImageUrl: "https://via.placeholder.com/600x400?text=After",
        },
    ];

    it("hydrates hero/services/projects/contact for a valid public portfolio", () => {
        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: mockTemplate,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/handyman/portfolio*", (req) => {
        const tid = req.query?.templateId;
        if (!tid || String(tid) === String(templateId)) {
            req.reply({ statusCode: 200, body: mockProjects });
        } else {
            req.reply({ statusCode: 200, body: [] });
        }
        }).as("getProjects");

        cy.visit(`/portfolios/handyman/${templateId}`);

        cy.wait("@getTemplate");
        cy.wait("@getProjects");

        // HERO data hydration
        cy.get("section#home").should("be.visible");
        cy.get("section#home .hero-h1").should("contain.text", "Harshal’s Handyman Services");
        cy.get("section#home .hero-sub").should("contain.text", "Fast, reliable repairs");
        cy.get("section#home .hero-phone-pill").should("contain.text", "(650) 555-0199");

        // SERVICES data hydration
        cy.get("section#services").should("be.visible");
        cy.get("section#services h2").should("contain.text", "What I Can Help With");
        cy.get("section#services .service-card").should("have.length", 2);
        cy.get("section#services .service-card").first().should("contain.text", "General Repairs");

        // PORTFOLIO (fetched projects)
        cy.get("section#portfolio").scrollIntoView().should("be.visible");
        cy.get("section#portfolio .portfolio-title").should("contain.text", "Recent Work");
        cy.get("section#portfolio .project-card").should("have.length", 1);
        cy.get("section#portfolio .project-title").should("contain.text", "Drywall Patch");
        cy.get("section#portfolio .category-pill").should("contain.text", "Repairs");

        // TESTIMONIALS fallback (empty)
        cy.get("section#testimonials").scrollIntoView().should("be.visible");
        cy.contains("No testimonials yet.").should("be.visible");

        // CONTACT: should NOT be demo mode on dynamic page (inputs enabled)
        cy.get("section#contact").scrollIntoView().should("be.visible");
        cy.get("section#contact h2").should("contain.text", "Request a Quote");
        cy.get("section#contact .info-card").should("contain.text", "hello@handyman.test");
        cy.get("section#contact input#name").should("be.enabled");
        cy.get("section#contact button.contact-submit").should("be.enabled");
    });
    });
