    // cypress/e2e/projectManagerSkills.cy.js

    describe("Project Manager portfolio - Skills section", () => {
    const testPortfolioId = "pm-e2e-portfolio-id";
    let serverSkills;

    const visitPmPortfolioAsOwner = () => {
        serverSkills = ["Existing skill"];

        cy.resetAppState();

        // Pretend the user is logged in & AuthContext knows them
        cy.intercept("GET", "**/api/users/**", {
        statusCode: 200,
        body: {
            user: {
            _id: "e2e-user-1",
            email: "pm-owner@example.com",
            role: "USER",
            },
        },
        }).as("getUser");

        // Mock the Project Manager portfolio load
        cy.intercept("GET", "**/portfolio/id/*", (req) => {
        req.reply({
            statusCode: 200,
            body: {
            _id: testPortfolioId,
            id: testPortfolioId,
            name: "E2E Project Manager Portfolio",
            email: "pm-owner@example.com",
            skills: serverSkills,
            },
        });
        }).as("getPortfolio");

        // Mock saving skills – keep an in-memory "server" list
        cy.intercept("PATCH", "**/portfolio/edit", (req) => {
        const incoming = req.body?.portfolio || {};
        if (Array.isArray(incoming.skills)) {
            serverSkills = incoming.skills;
        }

        req.reply({
            statusCode: 200,
            body: {
            _id: testPortfolioId,
            id: testPortfolioId,
            name: "E2E Project Manager Portfolio",
            email: "pm-owner@example.com",
            skills: serverSkills,
            },
        });
        }).as("saveSkills");

        // Visit the PM portfolio page as if already logged in
        cy.visit(`/portfolios/ProjectManager/${testPortfolioId}`, {
        onBeforeLoad(win) {
            win.localStorage.setItem("token", "e2e-test-token");
            win.localStorage.setItem("email", "pm-owner@example.com");
            win.localStorage.setItem("portfolioId", testPortfolioId);
        },
        });

        cy.wait("@getPortfolio");
    };

    const openSkillsTab = () => {
        // Click on the "Skills" tab in the PM navbar
        cy.contains("button", "Skills").click();

        // Confirm the Skills section rendered
        cy.contains("h2", "Skills").should("be.visible");
    };

    it("allows a logged-in owner to add and delete skills", () => {
        visitPmPortfolioAsOwner();
        openSkillsTab();

        const newSkill = `Cypress Skill ${Date.now()}`;

        // --- ADD SKILL ---

        // 1. Click the blue "+ Add Skill" button so the input appears
        cy.contains("button", "Add Skill").click();

        // 2. Type into the inline input
        cy.get('input[placeholder="Enter a new skill"]').type(newSkill);

        // 3. Click the small "Add" button in the inline row
        cy.contains("button", /^Add$/).click();

        // 4. Backend PATCH should include the new skill
        cy.wait("@saveSkills")
        .its("request.body.portfolio.skills")
        .should("include", newSkill);

        // 5. The new chip is visible in the list
        cy.contains(newSkill).should("be.visible");

        // 6. Reload – skills should still come back from mocked backend
        cy.reload();
        cy.wait("@getPortfolio");
        openSkillsTab();
        cy.contains(newSkill).should("be.visible");

        // --- DELETE SKILL ---

        // Click the red trash icon for just this skill
        cy.contains(newSkill)
        .parent()
        .find('button[aria-label="Delete skill"]')
        .click({ force: true }); // it's hidden until hover, so force the click

        // PATCH should no longer include this skill
        cy.wait("@saveSkills")
        .its("request.body.portfolio.skills")
        .should("not.include", newSkill);

        // Chip disappears from UI
        cy.contains(newSkill).should("not.exist");

        // And still gone after a full reload
        cy.reload();
        cy.wait("@getPortfolio");
        openSkillsTab();
        cy.contains(newSkill).should("not.exist");
    });
    });