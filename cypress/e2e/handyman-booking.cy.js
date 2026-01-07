    /// <reference types="cypress" />

    /**
     * FE-E2E-PORT-1 — Handyman portfolio booking
     * - Visit dynamic Handyman portfolio route (/portfolios/handyman/:id)
     * - Assert hero + services load
     * - Fill inquiry form and submit
     * - Verify visible success state (toast) + form reset
     *
     * Notes:
     * - We MUST hit the dynamic route (/:id) because the Showcase page has ContactForm in demo mode
     *   (submit is blocked/disabled when templateId is missing). :contentReference[oaicite:0]{index=0}
     * - ToastContainer is mounted globally. :contentReference[oaicite:1]{index=1}
     */

    describe("FE-E2E-PORT-1 — Handyman portfolio booking", () => {
    // Use the same fixture-ish id your other handyman tests/logs already reference
    const templateId = "handyman-fixture-id";

    const mockTemplate = {
        _id: templateId,
        userId: "someone-else",
        hero: {
        title: "Trusted Handyman for Home Repairs & Maintenance",
        subtitle: "Licensed, Insured, and Ready to Help.",
        phoneNumber: "(123) 456-7890",
        imageUrl:
            "https://images.unsplash.com/photo-1598533112127-3da0c37f4b6d?q=80&w=1600&auto=format&fit=crop",
        badge1Text: "Licensed & Insured",
        badge2Text: "5-Star Rated",
        badge3Text: "24/7 Emergency Service",
        ctaText: "Request a Free Estimate",
        },
        servicesSectionTitle: "Our Services",
        servicesSectionIntro: "A One-Call Solution for Your To-Do List",
        services: [
        { icon: "🔧", title: "General Repairs", description: "From squeaky doors to drywall patches." },
        { icon: "💧", title: "Plumbing Services", description: "Quick plumbing repairs & installs." },
        { icon: "💡", title: "Electrical Work", description: "Safe and reliable installs." },
        ],
        portfolioTitle: "Quality Craftsmanship You Can See",
        portfolioSubtitle: "Before and after results.",
        portfolioAllLabel: "All",
        processSteps: [
        { number: 1, title: "Request a Quote", description: "Fill out our form." },
        { number: 2, title: "We Confirm Details", description: "We’ll contact you." },
        ],
        testimonials: [{ name: "Jane D.", quote: "Great service!" }],
        contact: {
        title: "Get Your Free Estimate",
        subtitle: "We respond within 24 hours.",
        formTitle: "Ready to get started? Send us a message!",
        phone: "(123) 456-7890",
        email: "contact@prohandy.com",
        hours: "Mon–Fri: 7AM–7PM",
        note: "Weekend & emergency calls available",
        },
    };

    const mockProjects = [
        {
        _id: "p1",
        title: "Faucet Replacement",
        subtitle: "Fast swap, no leaks",
        category: "Plumbing",
        beforeImageUrl: "https://via.placeholder.com/600x400?text=Before",
        afterImageUrl: "https://via.placeholder.com/600x400?text=After",
        },
    ];

    it("loads portfolio sections and submits a booking/inquiry successfully", () => {
        // Template fetch for HandymanPage
        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: mockTemplate,
        }).as("getHandymanTemplate");

        // Projects fetch for Portfolio section
        cy.intercept("GET", "**/api/handyman/portfolio*", (req) => {
        // Keep it flexible, but ensure we return projects for this templateId
        const tid = req.query?.templateId;
        if (!tid || String(tid) === String(templateId)) {
            req.reply({ statusCode: 200, body: mockProjects });
        } else {
            req.reply({ statusCode: 200, body: [] });
        }
        }).as("getHandymanProjects");

        // Inquiry submit
        cy.intercept("POST", "**/api/handyman/inquiries", (req) => {
        // Basic payload sanity (don’t hard-fail on minor UI changes)
        expect(req.body).to.have.property("templateId", templateId);
        expect(req.body).to.have.property("name");
        expect(req.body).to.have.property("phone");
        expect(req.body).to.have.property("email");
        expect(req.body).to.have.property("message");
        expect(req.body).to.have.property("selectedServiceTitles");
        req.reply({ statusCode: 201, body: { ok: true } });
        }).as("postInquiry");

        // Visit dynamic route (NOT the showcase)
        cy.visit(`/portfolios/handyman/${templateId}`);

        cy.wait("@getHandymanTemplate");
        cy.wait("@getHandymanProjects");

        // ✅ Assert hero + services sections load
        cy.get("section#home").should("be.visible");
        cy.get("section#home .hero-h1").should("be.visible").and("not.be.empty");

        cy.get("section#services").should("be.visible");
        cy.get("section#services h2").should("contain.text", "Our Services");

        // ✅ Fill out contact / booking form
        cy.get("section#contact").scrollIntoView().should("be.visible");

        cy.get('input#name').type("E2E Test User");
        cy.get('input#phone').type("(408) 555-1212");
        cy.get('input#email').type(`e2e_success_${Date.now()}@example.com`);
        cy.get('textarea#message').type("Hi! I'd like a quote for a small plumbing repair.");

        // Multi-select: open dropdown and check the first option
        cy.get("button.ms-trigger").click();
        cy.get(".ms-menu").should("be.visible");
        cy.get('.ms-menu input[type="checkbox"]').first().check({ force: true });

        // Submit
        cy.get("button.contact-submit")
        .should("be.enabled")
        .and("contain.text", "Request Free Estimate")
        .click();

        cy.wait("@postInquiry");

        // ✅ Verify visible success state (toast text)
        cy.contains("Message sent successfully! We will get back to you soon.", { timeout: 8000 })
        .should("be.visible");

        // ✅ Form reset (as implemented after success)
        cy.get('input#name').should("have.value", "");
        cy.get('input#phone').should("have.value", "");
        cy.get('input#email').should("have.value", "");
        cy.get('textarea#message').should("have.value", "");
        cy.get("button.ms-trigger").should("contain.text", "Select services");
    });
    });
