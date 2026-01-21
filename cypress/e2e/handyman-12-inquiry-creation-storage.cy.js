    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-INQ-1 — Inquiry Creation & Storage
     *
     * Fix:
     * - Assert "stored" ONLY after cy.wait("@postInquiry") resolves
     *   (otherwise assertion runs too early)
     */

    describe("FE-E2E-HM-INQ-1 — Inquiry Creation & Storage", () => {
    const templateId = "hm-inq-1";

    const template = {
        _id: templateId,
        userId: "owner-123",
        hero: { title: "Inquiry Test", subtitle: "Live Portfolio", phoneNumber: "(111) 111-1111" },
        servicesSectionTitle: "Services",
        servicesSectionIntro: "Intro",
        services: [
        { icon: "🔧", title: "General Repairs", description: "desc" },
        { icon: "💧", title: "Plumbing", description: "desc" },
        { icon: "⚡", title: "Electrical", description: "desc" },
        ],
        portfolioTitle: "Work",
        portfolioSubtitle: "sub",
        portfolioAllLabel: "All",
        processSteps: [{ number: 1, title: "Step", description: "desc" }],
        testimonials: [],
        contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
    };

    let stored = [];

    const fillValidInquiry = () => {
        cy.get("input#name").clear().type("E2E User");
        cy.get("input#phone").clear().type("(408) 555-1212");
        cy.get("input#email").clear().type(`inq_${Date.now()}@example.com`);
        cy.get("textarea#message").clear().type("Need help with a repair.");
    };

    beforeEach(() => {
        stored = [];

        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: [],
        }).as("getProjects");

        cy.intercept("POST", "**/api/handyman/inquiries", (req) => {
        const id = `inq_${stored.length + 1}`;
        const record = { _id: id, ...req.body };
        stored.push(record);

        req.reply({ statusCode: 201, body: record });
        }).as("postInquiry");
    });

    it("stores inquiry and associates it with correct templateId", () => {
        cy.visit(`/portfolios/handyman/${templateId}`, {
        onBeforeLoad(win) {
            win.localStorage.removeItem("token");
        },
        });

        cy.wait("@getTemplate");
        cy.wait("@getProjects");

        cy.get("section#contact").scrollIntoView().should("be.visible");

        fillValidInquiry();
        cy.get("button.contact-submit").should("be.enabled").click();

        cy.wait("@postInquiry").then((interception) => {
        const body = interception.request.body || {};
        const resp = interception.response && interception.response.body;

        // ✅ request association
        expect(body.templateId, "templateId in request").to.eq(templateId);

        // sanity checks
        expect(body.name || body.fullName || body.username, "name field present").to.exist;
        expect(body.email, "email present").to.match(/@/);
        expect(body.message, "message present").to.be.a("string").and.not.be.empty;

        // ✅ response association
        expect(resp, "response body exists").to.exist;
        expect(resp.templateId, "templateId in response").to.eq(templateId);
        expect(resp._id, "created id exists").to.exist;

        // ✅ "storage" verification AFTER request actually happened
        expect(stored, "stored inquiries").to.have.length(1);
        expect(stored[0].templateId).to.eq(templateId);
        });
    });
    });
