    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-INQ-3 — Spam / Duplicate Inquiry Handling
     *
     * Simulates rapid duplicate submissions.
     * Pass criteria (either is acceptable depending on your implementation):
     * A) Frontend prevents duplicates => only 1 POST fired and submit disables
     * OR
     * B) Backend throttles => 2nd POST returns 429 and UI shows an error (toast/message)
     */

    describe("FE-E2E-HM-INQ-3 — Spam / Duplicate Inquiry Handling", () => {
    const templateId = "hm-inq-3";

    const template = {
        _id: templateId,
        userId: "owner-123",
        hero: { title: "Duplicate", subtitle: "Live Portfolio", phoneNumber: "(111) 111-1111" },
        servicesSectionTitle: "Services",
        servicesSectionIntro: "Intro",
        services: [{ icon: "🔧", title: "General Repairs", description: "desc" }],
        portfolioTitle: "Work",
        portfolioSubtitle: "sub",
        portfolioAllLabel: "All",
        processSteps: [{ number: 1, title: "Step", description: "desc" }],
        testimonials: [],
        contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
    };

    beforeEach(() => {
        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: [],
        }).as("getProjects");

        let count = 0;
        cy.intercept("POST", "**/api/handyman/inquiries", (req) => {
        count += 1;
        if (count === 1) {
            req.reply({ statusCode: 201, body: { _id: "inq_1", ...req.body } });
        } else {
            // simulate throttle/duplicate handling
            req.reply({ statusCode: 429, body: { message: "Too many requests" } });
        }
        }).as("postInquiry");

        cy.visit(`/portfolios/handyman/${templateId}`, {
        onBeforeLoad(win) {
            win.localStorage.removeItem("token");
        },
        });

        cy.wait("@getTemplate");
        cy.wait("@getProjects");

        cy.get("section#contact").scrollIntoView().should("be.visible");

        cy.get("input#name").clear().type("E2E User");
        cy.get("input#phone").clear().type("(408) 555-1212");
        cy.get("input#email").clear().type(`inq_${Date.now()}@example.com`);
        cy.get("textarea#message").clear().type("Duplicate submit test.");
    });

    it("handles rapid duplicate submits without creating multiple successful inquiries", () => {
        // Rapid double-click
        cy.get("button.contact-submit").should("be.enabled").dblclick();

        // Wait for at least the first submission
        cy.wait("@postInquiry");

        // Give the app a moment to attempt a second submit if it allows it
        cy.wait(300);

        cy.get("@postInquiry.all").then((calls) => {
        // A) Frontend blocked duplicates => only 1 call
        if (!calls || calls.length === 1) {
            expect(true, "frontend prevented duplicate submission").to.eq(true);
            return;
        }

        // B) Backend throttled => second call exists and must be 429
        expect(calls.length, "number of POST calls").to.be.greaterThan(1);

        const second = calls[1];
        expect(second.response && second.response.statusCode, "second response status").to.eq(429);

        // UI should show some error (keep tolerant)
        cy.contains(/too many|try again|slow down|error/i).should("be.visible");
        });
    });
    });
