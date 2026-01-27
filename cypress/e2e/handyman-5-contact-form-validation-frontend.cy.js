    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-GUEST-5 — Contact Form Validation (Frontend)
     *
     * IMPORTANT:
     * Your UI uses native HTML5 validation bubbles (tooltips).
     * Those messages are NOT rendered as DOM text, so cy.contains(...) will fail.
     *
     * We validate via:
     * - input.checkValidity() === false
     * - input.validationMessage contains expected text
     * - form does NOT submit (no POST fired)
     */

    describe("FE-E2E-HM-GUEST-5 — Contact Form Validation (Frontend)", () => {
    const templateId = "hm-contact-validate-1";

    const mockTemplate = {
        _id: templateId,
        hero: { title: "Contact Validation", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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

    const clickSubmit = () => {
        cy.get("button.contact-submit").should("be.enabled").click();
    };

    const expectNativeValidation = (selector, msgRegex) => {
        cy.get(selector)
        .should("exist")
        .then(($el) => {
            const el = $el[0];
            expect(el.checkValidity(), `${selector} should be invalid`).to.eq(false);
            expect(el.validationMessage, `${selector} validationMessage`)
            .to.be.a("string")
            .and.match(msgRegex);
        });
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

        // If validation fails, we should never hit this
        cy.intercept("POST", "**/api/handyman/inquiries").as("postInquiry");

        cy.visit(`/portfolios/handyman/${templateId}`);
        cy.wait("@getTemplate");
        cy.wait("@getProjects");

        cy.get("section#contact").scrollIntoView().should("be.visible");
    });

    it("blocks empty submission and shows native required-field validation", () => {
        clickSubmit();

        // Browser focuses the first invalid required field (likely name)
        cy.focused().should("have.attr", "id", "name");

        // Native required message (Chrome): "Please fill out this field."
        // Keep regex tolerant for slight variations.
        expectNativeValidation("input#name", /please\s+fill\s+out\s+this\s+field/i);

        // No API call should be fired
        cy.get("@postInquiry.all").then((calls) => {
        expect(calls, "POST /inquiries calls").to.have.length(0);
        });
    });

    it("rejects invalid email formats with native email validation", () => {
        cy.get("input#name").type("Test User");
        cy.get("input#phone").type("(408) 555-1212");
        cy.get("input#email").type("not-an-email");
        cy.get("textarea#message").type("Need help fixing a door.");

        clickSubmit();

        // Browser should focus email field as invalid
        cy.focused().should("have.attr", "id", "email");

        // Chrome native message example:
        // "Please include an '@' in the email address. 'not-an-email' is missing an '@'."
        expectNativeValidation(
        "input#email",
        /please\s+include\s+an\s+'?@'?/i
        );

        // No API call should be fired
        cy.get("@postInquiry.all").then((calls) => {
        expect(calls, "POST /inquiries calls").to.have.length(0);
        });
    });

    it("multi-select edge cases: none selected then select/unselect (UI stable)", () => {
        cy.get("input#name").type("Test User");
        cy.get("input#phone").type("(408) 555-1212");
        cy.get("input#email").type(`e2e_${Date.now()}@example.com`);
        cy.get("textarea#message").type("Need help.");

        // Submit once with no services selected
        clickSubmit();

        // Select then unselect to ensure component doesn't break
        cy.get("button.ms-trigger").click();
        cy.get(".ms-menu").should("be.visible");
        cy.get('.ms-menu input[type="checkbox"]').first().check({ force: true });
        cy.get("body").click(0, 0);

        cy.get("button.ms-trigger").click();
        cy.get('.ms-menu input[type="checkbox"]').first().uncheck({ force: true });
        cy.get("body").click(0, 0);

        cy.get("button.ms-trigger").should("be.visible");
    });
    });
