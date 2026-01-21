    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-VENDOR-1 — Portfolio Ownership Enforcement
     *
     * Ensures only the owner can access /portfolios/handyman/:id/edit.
     * Non-owner should see toast error and be redirected to public view.
     *
     * Implementation detail (from EditHandymanPortfolio.jsx):
     * - Fetches template
     * - Gets current user from AuthContext OR /api/user/me if token exists
     * - If non-owner: toast.error + navigate(/portfolios/handyman/:id)
     */

    describe("FE-E2E-HM-VENDOR-1 — Portfolio Ownership Enforcement", () => {
    const templateId = "hm-owner-guard-1";
    const ownerId = "owner-123";
    const nonOwnerId = "nonowner-999";

    const template = {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Owner Guard", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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

    beforeEach(() => {
        // Ensure edit page will try /api/user/me fallback by having a token
        window.localStorage.setItem("token", "fake-token-nonowner");

        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        // Edit page calls /api/user/me only if context user isn't present AND token exists
        cy.intercept("GET", "**/api/user/me", {
        statusCode: 200,
        body: { id: nonOwnerId, email: "nonowner@test.com", name: "Non Owner" },
        }).as("getMe");

        // It will also load projects in the editor
        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: [],
        }).as("getProjects");
    });

    it("redirects non-owner away from edit page with an error message", () => {
        cy.visit(`/portfolios/handyman/${templateId}/edit`);

        cy.wait("@getTemplate");
        cy.wait("@getMe");

        // Toast error from component
        cy.contains("You do not have permission to edit this portfolio.").should("be.visible");

        // Redirect to public view
        cy.location("pathname").should("eq", `/portfolios/handyman/${templateId}`);
    });
    });
