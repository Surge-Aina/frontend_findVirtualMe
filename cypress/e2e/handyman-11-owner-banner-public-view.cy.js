    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-VENDOR-4 — Owner Banner on Public View
     *
     * Fix:
     * - AuthContext likely expects /user/me response as { user: {...} } (common pattern)
     * - We return BOTH shapes: { user: {...}, id, _id } so hydration always works
     * - Set token before app boot using cy.visit({ onBeforeLoad })
     */

    describe("FE-E2E-HM-VENDOR-4 — Owner Banner on Public View", () => {
    const templateId = "hm-owner-banner-1";
    const ownerId = "owner-123";

    const template = {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Owner Banner", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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

    const stubTemplateAndProjects = () => {
        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: [],
        }).as("getProjects");
    };

    const editLinkPath = `/portfolios/handyman/${templateId}/edit`;

    it("guest: does NOT show owner edit link", () => {
        stubTemplateAndProjects();

        cy.visit(`/portfolios/handyman/${templateId}`, {
        onBeforeLoad(win) {
            win.localStorage.removeItem("token");
        },
        });

        cy.wait("@getTemplate");
        cy.wait("@getProjects");

        cy.get(`a[href="${editLinkPath}"]`).should("not.exist");
    });

    it("owner: shows edit link and it navigates to /edit", () => {
        stubTemplateAndProjects();

        // ✅ IMPORTANT: return BOTH shapes to satisfy AuthContext parsing
        const mePayload = {
        user: { id: ownerId, _id: ownerId, email: "owner@test.com", name: "Owner" },
        id: ownerId,
        _id: ownerId,
        email: "owner@test.com",
        name: "Owner",
        };

        cy.intercept("GET", "**/user/me", {
        statusCode: 200,
        body: mePayload,
        }).as("getMeLegacy");

        // Some codepaths might call /api/user/me; we stub but don't wait for it.
        cy.intercept("GET", "**/api/user/me", {
        statusCode: 200,
        body: mePayload,
        }).as("getMeApi");

        cy.visit(`/portfolios/handyman/${templateId}`, {
        onBeforeLoad(win) {
            win.localStorage.setItem("token", "fake-token-owner");
        },
        });

        cy.wait("@getTemplate");
        cy.wait("@getProjects");
        cy.wait("@getMeLegacy");

        // ✅ Owner-only UI: edit link should exist
        cy.get(`a[href="${editLinkPath}"]`, { timeout: 8000 })
        .should("be.visible")
        .click();

        cy.location("pathname", { timeout: 8000 }).should("eq", editLinkPath);
    });
    });
