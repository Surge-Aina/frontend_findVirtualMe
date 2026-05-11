    // cypress/e2e/projectManager-links.cy.js

    const pmPortfolioId = "pm-e2e-portfolio-id";
    const ownerEmail = "vendor@example.com";

    // --- Test data helpers ------------------------------------------------------

    const makeBasePortfolio = (overrides = {}) => ({
    _id: pmPortfolioId,
    id: pmPortfolioId,
    portfolioType: "projectManager",
    name: "Harshal edit name",
    location: "Pune edit location",
    bio: "Doing great edit about",
    summary: "As always edit summary",
    phone: "2222222222",
    email: ownerEmail,
    socialLinks: {
        github: "",
        linkedin: "",
        website: "",
    },
    ...overrides,
    });

    let serverPortfolio;

    const initServerPortfolio = () => {
    serverPortfolio = makeBasePortfolio();
    };

    // --- API stubs --------------------------------------------------------------

    const stubAuthAndPortfolioApi = () => {
    // Stub /users/me so the app thinks the owner is logged in
    cy.intercept("GET", "**/api/users/me", {
        statusCode: 200,
        body: {
        user: {
            _id: "6970124025d8c08c5c136ae0",
            name: "vendor JK",
            email: ownerEmail,
            role: "VENDOR",
            portfolios: [{ portfolioId: pmPortfolioId, portfolioType: "ProjectManager" }],
        },
        },
    }).as("getUser");

    // Stub GET /portfolio/id/:id to return our in-memory portfolio
    cy.intercept("GET", "**/portfolio/id/*", (req) => {
        req.reply({
        statusCode: 200,
        body: serverPortfolio,
        });
    }).as("getPortfolio");

    // Stub PATCH /portfolio/edit to capture socialLinks and update serverPortfolio
    cy.intercept("PATCH", "**/portfolio/edit", (req) => {
        const incoming = req.body?.portfolio || {};

        serverPortfolio = {
        ...serverPortfolio,
        ...incoming,
        socialLinks: {
            ...(serverPortfolio.socialLinks || {}),
            ...(incoming.socialLinks || {}),
        },
        };

        req.reply({
        statusCode: 200,
        body: serverPortfolio,
        });
    }).as("saveSummary");
    };

    // Visit PM portfolio as the logged-in owner
    const visitPmPortfolioAsOwner = () => {
    cy.visit(`/portfolios/ProjectManager/${pmPortfolioId}`, {
        onBeforeLoad(win) {
        // ProtectedRoute checks this token
        win.localStorage.setItem("token", "fake-jwt-token");
        win.localStorage.setItem("email", ownerEmail);
        },
    });

    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    };

    // --- Tests ------------------------------------------------------------------

    describe("Project Manager portfolio - Social links / Connect icons", () => {
    beforeEach(() => {
        initServerPortfolio();
        stubAuthAndPortfolioApi();
    });

    it("allows the owner to update social links and shows GitHub/LinkedIn icons with correct URLs", () => {
        const githubUrl = "https://github.com/pm-e2e-links";
        const linkedinUrl = "https://www.linkedin.com/in/pm-e2e-links";
        const websiteUrl = "https://www.findvirtual.me/";

        visitPmPortfolioAsOwner();

        // Open the summary edit form (pencil icon)
        cy.get('[data-testid="tab-summary"]').click();
        cy.get('button[aria-label="Edit"]', { timeout: 8000 }).click();

        // Update social link fields
        cy.get('input[placeholder="GitHub URL"]').clear().type(githubUrl);
        cy.get('input[placeholder="LinkedIn URL"]').clear().type(linkedinUrl);
        cy.get('input[placeholder="Portfolio URL"]').clear().type(websiteUrl);

        // Save changes
        cy.contains("button", /^Save$/).click();

        // Make sure the PATCH request sends the new links
        cy.wait("@saveSummary")
        .its("request.body.portfolio.socialLinks")
        .should((links) => {
            expect(links.github).to.equal(githubUrl);
            expect(links.linkedin).to.equal(linkedinUrl);
            expect(links.website).to.equal(websiteUrl);
        });

        // After save, the connect / social-links section should show icons
        // that point to the updated URLs and would open in a new tab
        cy.get('a[aria-label="GitHub"]')
        .should("be.visible")
        .and("have.attr", "href", githubUrl)
        .and("have.attr", "target", "_blank");

        cy.get('a[aria-label="LinkedIn"]')
        .should("be.visible")
        .and("have.attr", "href", linkedinUrl)
        .and("have.attr", "target", "_blank");

        // Optional: verify the icons/links persist after a reload
        cy.reload();
        cy.wait("@getUser");
        cy.wait("@getPortfolio");

        cy.get('a[aria-label="GitHub"]')
        .should("be.visible")
        .and("have.attr", "href", githubUrl)
        .and("have.attr", "target", "_blank");

        cy.get('a[aria-label="LinkedIn"]')
        .should("be.visible")
        .and("have.attr", "href", linkedinUrl)
        .and("have.attr", "target", "_blank");
    });
    });