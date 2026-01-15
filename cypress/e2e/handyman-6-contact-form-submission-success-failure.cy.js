    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-GUEST-6 — Contact Form Submission (Success + Failure)
     *
     * Validates inquiry submission for a live portfolio (dynamic page):
     * - Success toast on valid submission
     * - Failure handling when backend returns 500
     * - Failure handling when backend returns validation errors (400)
     */

    describe("FE-E2E-HM-GUEST-6 — Contact Form Submission (Success + Failure)", () => {
    const templateId = "hm-contact-submit-1";

    const mockTemplate = {
        _id: templateId,
        hero: { title: "Contact Submit", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
        servicesSectionTitle: "Services",
        servicesSectionIntro: "Intro",
        services: [
        { icon: "🔧", title: "General Repairs", description: "desc" },
        { icon: "💧", title: "Plumbing", description: "desc" },
        ],
        portfolioTitle: "Work",
        portfolioSubtitle: "sub",
        portfolioAllLabel: "All",
        processSteps: [{ number: 1, title: "Step", description: "desc" }],
        testimonials: [],
        contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
    };

    const fillValidForm = () => {
        cy.get("section#contact").scrollIntoView().should("be.visible");
        cy.get("input#name").clear().type("E2E Submit User");
        cy.get("input#phone").clear().type("(408) 555-1212");
        cy.get("input#email").clear().type(`e2e_submit_${Date.now()}@example.com`);
        cy.get("textarea#message").clear().type("Hi! I would like a quote for a repair.");

        // select at least one service (safe)
        cy.get("button.ms-trigger").click();
        cy.get(".ms-menu").should("be.visible");
        cy.get('.ms-menu input[type="checkbox"]').first().check({ force: true });
        cy.get("body").click(0, 0);

        cy.get("button.contact-submit").should("be.enabled").click();
    };

    beforeEach(() => {
        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: mockTemplate,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: [],
        }).as("getProjects");

        cy.visit(`/portfolios/handyman/${templateId}`);
        cy.wait("@getTemplate");
        cy.wait("@getProjects");
    });

    it("success: shows success toast and resets form", () => {
        cy.intercept("POST", "**/api/handyman/inquiries", (req) => {
        expect(req.body).to.include.keys("templateId", "name", "phone", "email", "message");
        req.reply({ statusCode: 201, body: { ok: true } });
        }).as("postInquirySuccess");

        fillValidForm();
        cy.wait("@postInquirySuccess");

        cy.contains(/message sent successfully/i, { timeout: 8000 }).should("be.visible");

        // reset behavior
        cy.get("input#name").should("have.value", "");
        cy.get("input#phone").should("have.value", "");
        cy.get("input#email").should("have.value", "");
        cy.get("textarea#message").should("have.value", "");
    });

    it("failure: backend 500 shows error toast/message and does not crash", () => {
        cy.intercept("POST", "**/api/handyman/inquiries", {
        statusCode: 500,
        body: { message: "Server error" },
        }).as("postInquiryFail500");

        fillValidForm();
        cy.wait("@postInquiryFail500");

        // Tolerant assertion: your UI might show toast or inline error
        cy.contains(/failed|error|try again|server/i).should("be.visible");
    });

    it("failure: backend validation error (400) shows friendly message", () => {
        cy.intercept("POST", "**/api/handyman/inquiries", {
        statusCode: 400,
        body: { message: "Validation error: email invalid" },
        }).as("postInquiryFail400");

        fillValidForm();
        cy.wait("@postInquiryFail400");

        cy.contains(/validation|invalid|email/i).should("be.visible");
    });
    });
