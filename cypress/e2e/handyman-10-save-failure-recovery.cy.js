    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-VENDOR-3 — Save Failure & Recovery
     *
     * Simulate backend failure during save operations:
     * - Show error toast
     * - No silent data loss (edits still present)
     * - Retry save works and shows success toast
     *
     * We'll fail the template PUT on first attempt, then succeed on retry.
     */

    describe("FE-E2E-HM-VENDOR-3 — Save Failure & Recovery", () => {
    const templateId = "hm-save-retry-1";
    const ownerId = "owner-123";

    const template = {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Save Retry", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
        services: [{ icon: "🔧", title: "Repairs", description: "desc" }],
        servicesSectionTitle: "Services",
        servicesSectionIntro: "Intro",
        portfolioTitle: "Work",
        portfolioSubtitle: "sub",
        portfolioAllLabel: "All",
        processSteps: [{ number: 1, title: "Step", description: "desc" }],
        testimonials: [],
        contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
    };

    const projects = [
        {
        _id: "p1",
        title: "Project One",
        subtitle: "Sub One",
        category: "Plumbing",
        beforeImageUrl: "https://via.placeholder.com/300x200?text=Before1",
        afterImageUrl: "https://via.placeholder.com/300x200?text=After1",
        },
    ];

    beforeEach(() => {
        window.localStorage.setItem("token", "fake-token-owner");

        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/user/me", {
        statusCode: 200,
        body: { id: ownerId, email: "owner@test.com", name: "Owner" },
        }).as("getMe");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: projects,
        }).as("getProjects");

        // First save fails, second save succeeds
        let templatePutCount = 0;
        cy.intercept("PUT", `**/api/handyman-template/${templateId}`, (req) => {
        templatePutCount += 1;
        if (templatePutCount === 1) {
            req.reply({ statusCode: 500, body: { message: "Template save failed" } });
        } else {
            req.reply({ statusCode: 200, body: { ok: true } });
        }
        }).as("putTemplateMaybeFail");

        // Project save should only happen if template save succeeds.
        cy.intercept("PUT", "**/api/handyman/portfolio/*", {
        statusCode: 200,
        body: { ok: true },
        }).as("putProject");
    });

    it("shows error toast on failure and allows retry without losing edits", () => {
        cy.visit(`/portfolios/handyman/${templateId}/edit`);
        cy.wait("@getTemplate");
        cy.wait("@getMe");
        cy.wait("@getProjects");

        // Make an edit to ensure there is a dirty change
        cy.contains('Replace “Before” Image (optional)')
        .first()
        .closest("div.border.rounded.p-3")
        .as("projectCard1");

        cy.get("@projectCard1").within(() => {
        cy.contains("Title").parent().find("input").clear().type("Project One UPDATED");
        cy.contains("Title").parent().find("input").should("have.value", "Project One UPDATED");
        });

        // Attempt 1: should fail (template PUT 500)
        cy.contains("button", "Save Changes").click();
        cy.wait("@putTemplateMaybeFail");

        cy.contains(/failed to save changes|template save failed/i).should("be.visible");

        // Ensure edit is still present (no silent loss)
        cy.get("@projectCard1").within(() => {
        cy.contains("Title").parent().find("input").should("have.value", "Project One UPDATED");
        });

        // Attempt 2: should succeed
        cy.contains("button", "Save Changes").click();
        cy.wait("@putTemplateMaybeFail");
        cy.wait("@putProject");

        cy.contains("All changes saved!").should("be.visible");
    });
    });
