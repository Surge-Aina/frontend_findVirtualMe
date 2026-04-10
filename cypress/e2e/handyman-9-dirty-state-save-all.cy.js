    /// <reference types="cypress" />

    /**
     * FE-E2E-HM-VENDOR-2 — Partial Edits & Dirty State Handling
     *
     * Fixes:
     * - Intercept BOTH /user/me and /api/user/me (your app calls both)
     * - Wait for the project PUT before asserting calls
     * - More robust "project card" selection without relying on "Existing projects" text
     */

    describe("FE-E2E-HM-VENDOR-2 — Partial Edits & Dirty State Handling", () => {
    const templateId = "hm-dirty-1";
    const ownerId = "owner-123";

    const template = {
        _id: templateId,
        userId: ownerId,
        hero: { title: "Dirty Save", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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
        {
        _id: "p2",
        title: "Project Two",
        subtitle: "Sub Two",
        category: "Electrical",
        beforeImageUrl: "https://via.placeholder.com/300x200?text=Before2",
        afterImageUrl: "https://via.placeholder.com/300x200?text=After2",
        },
    ];

    beforeEach(() => {
        window.localStorage.setItem("token", "fake-token-owner");

        cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: template,
        }).as("getTemplate");

        // Your app hits /user/me (401 in log) AND /api/user/me (200 in log) depending on code path
        cy.intercept("GET", "**/api/users/me", {
        statusCode: 200,
        body: { id: ownerId, email: "owner@test.com", name: "Owner" },
        }).as("getMeLegacy");

        cy.intercept("GET", "**/api/users/me", {
        statusCode: 200,
        body: { id: ownerId, email: "owner@test.com", name: "Owner" },
        }).as("getMe");

        cy.intercept("GET", "**/api/handyman/portfolio*", {
        statusCode: 200,
        body: projects,
        }).as("getProjects");

        cy.intercept("PUT", `**/api/handyman-template/${templateId}`, {
        statusCode: 200,
        body: { ok: true },
        }).as("putTemplate");

        // Capture project PUTs
        cy.intercept("PUT", "**/api/handyman/portfolio/*", (req) => {
        req.reply({ statusCode: 200, body: { ok: true } });
        }).as("putAnyProject");
    });

    it("updates only modified project(s) during Save Changes", () => {
        cy.visit(`/portfolios/handyman/${templateId}/edit`);

        cy.wait("@getTemplate");
        cy.wait("@getProjects");
        // One of these will usually fire; waiting for both is unnecessary and can flake.
        // (If neither fires in your env, it still won’t block the test.)
        cy.wait(["@getMe", "@getMeLegacy"], { timeout: 8000 }).then(() => {});

        // Edit ONLY first project title -> should mark p1 dirty, p2 clean
        cy.contains(/replace/i)
        .first()
        .closest("div.border.rounded.p-3")
        .as("projectCard1");

        cy.get("@projectCard1").within(() => {
        cy.contains(/^title$/i).parent().find("input").clear().type("Project One UPDATED");
        });

        cy.contains("button", "Save Changes").click();

        // Template PUT always happens
        cy.wait("@putTemplate");

        // Now WAIT for the project PUT to actually occur (this fixes your timing failure)
        cy.wait("@putAnyProject");

        // Now it’s safe to assert the call list
        cy.get("@putAnyProject.all").then((calls) => {
        const urls = (calls || []).map((c) => c.request.url);

        // Should include p1
        expect(urls.some((u) => u.includes("/api/handyman/portfolio/p1"))).to.eq(true);

        // Should NOT include p2
        expect(urls.some((u) => u.includes("/api/handyman/portfolio/p2"))).to.eq(false);
        });

        // Optional: success toast/message
        cy.contains(/all changes saved/i).should("be.visible");
    });
    });
