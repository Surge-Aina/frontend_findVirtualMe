    // cypress/e2e/projectManagerSummary.cy.js

    describe("Project Manager portfolio - Summary section", () => {
    const testPortfolioId = "pm-e2e-summary-id";
    const ownerEmail = "pm-owner@example.com";
    let serverPortfolio;

    /**
     * Initialize the in-memory "server" portfolio used by our intercepts.
     * We keep just the fields that SummaryCard + top card care about.
     */
    const initServerPortfolio = () => {
        serverPortfolio = {
        _id: testPortfolioId,
        id: testPortfolioId,
        portfolioType: "projectManager",
        email: ownerEmail, // MUST match logged-in user so SummaryCard renders
        name: "",
        bio: "",
        summary: "",
        phone: "",
        location: "",
        socialLinks: {
            github: "",
            linkedin: "",
            website: "",
        },
        };
    };

    /**
     * Fake a logged-in owner and stub the portfolio endpoints.
     */
    const visitPmPortfolioAsOwner = () => {
        initServerPortfolio();
        cy.resetAppState();

        // Logged-in user
        cy.intercept("GET", "**/user/**", {
        statusCode: 200,
        body: {
            user: {
            _id: "e2e-user-1",
            email: ownerEmail,
            role: "USER",
            },
        },
        }).as("getUser");

        // GET portfolio by ID
        cy.intercept("GET", "**/portfolio/id/*", (req) => {
        req.reply({
            statusCode: 200,
            body: serverPortfolio,
        });
        }).as("getPortfolio");

        // PATCH portfolio/edit (summary save)
        cy.intercept("PATCH", "**/portfolio/edit", (req) => {
        const updated = req.body?.portfolio || {};

        // Merge into our fake DB object
        serverPortfolio = {
            ...serverPortfolio,
            ...updated,
        };

        req.reply({
            statusCode: 200,
            body: serverPortfolio,
        });
        }).as("saveSummary");

        // Visit PM portfolio as if already authenticated
        cy.visit(`/portfolios/ProjectManager/${testPortfolioId}`, {
        onBeforeLoad(win) {
            win.localStorage.setItem("token", "e2e-summary-token");
            win.localStorage.setItem("email", ownerEmail);
            win.localStorage.setItem("portfolioId", testPortfolioId);
        },
        });

        cy.wait("@getPortfolio");
    };

    /**
     * Ensure we're on the Summary tab and the summary card is visible.
     */
    const openSummaryTab = () => {
        cy.contains("button", "Summary").click();

        // Headings inside the editable Summary card
        cy.contains("h3", "About").should("be.visible");
        cy.contains("h3", "Summary").should("be.visible");
        cy.contains("h3", "Contact").should("be.visible");
    };

    /**
     * Check that the "empty template" placeholders are showing.
     */
    const assertEmptySummaryTemplate = () => {
        cy.contains("Your Name").should("be.visible");
        cy.contains("Location").should("be.visible");
        cy.contains("Professional bio and description").should("be.visible");
        cy.contains("Summary of your professional experience and goals").should(
        "be.visible"
        );
        cy.contains("Phone: Not provided").should("be.visible");
    };

    /**
     * Click the pencil icon to enter edit mode.
     */
    const enterEditMode = () => {
        cy.get('button[aria-label="Edit"]').click();
        cy.get('input[name="name"]').should("be.visible");
        cy.get('textarea[name="bio"]').should("be.visible");
        cy.get('textarea[name="summary"]').should("be.visible");
        cy.get('input[name="phone"]').should("be.visible");
    };

    /**
     * Fill the summary edit form for the five fields we care about.
     */
    const fillSummaryForm = ({ name, location, bio, summary, phone }) => {
        cy.get('input[name="name"]').clear().type(name);
        cy.get('input[name="location"]').clear().type(location);
        cy.get('textarea[name="bio"]').clear().type(bio);
        cy.get('textarea[name="summary"]').clear().type(summary);
        cy.get('input[name="phone"]').clear().type(phone);
    };

    /**
     * Click Save and assert that the backend payload contains the values we expect.
     */
    const saveSummaryAndAssertPayload = (expected) => {
        cy.contains("button", "Save").click();

        cy.wait("@saveSummary")
        .its("request.body.portfolio")
        .should((body) => {
            expect(body.name).to.eq(expected.name);
            expect(body.location).to.eq(expected.location);
            expect(body.bio).to.eq(expected.bio);
            expect(body.summary).to.eq(expected.summary);
            expect(body.phone).to.eq(expected.phone);
        });
    };

    /**
     * Assert that the read-only summary view reflects the given values.
     * This checks the bottom summary card (and indirectly the top card as well).
     */
    const assertSummaryViewMatches = ({
        name,
        location,
        bio,
        summary,
        phone,
    }) => {
        // Name + location
        cy.contains("h2", name).should("be.visible");
        cy.contains(location).should("be.visible");

        // About + Summary text
        cy.contains(bio).should("be.visible");
        cy.contains(summary).should("be.visible");

        // Contact phone
        cy.contains(phone).should("be.visible");

        // Placeholders should disappear once real values are present
        cy.contains("Your Name").should("not.exist");
        cy.contains("Professional bio and description").should("not.exist");
        cy.contains("Summary of your professional experience and goals").should(
        "not.exist"
        );
        cy.contains("Phone: Not provided").should("not.exist");
    };

    it("allows a logged-in owner to add and update summary information", () => {
        visitPmPortfolioAsOwner();
        openSummaryTab();
        assertEmptySummaryTemplate();

        const firstSummary = {
        name: "Harshal",
        location: "Pune",
        bio: "Doing great",
        summary: "As always",
        phone: "1111111111",
        };

        const updatedSummary = {
        name: "Harshal edit name",
        location: "Pune edit location",
        bio: "Doing great edit about",
        summary: "As always edit summary",
        phone: "2222222222",
        };

        // --- ADD initial summary data (from empty template) ---
        enterEditMode();
        fillSummaryForm(firstSummary);
        saveSummaryAndAssertPayload(firstSummary);
        assertSummaryViewMatches(firstSummary);

        // --- UPDATE existing summary data ---
        enterEditMode();
        fillSummaryForm(updatedSummary);
        saveSummaryAndAssertPayload(updatedSummary);
        assertSummaryViewMatches(updatedSummary);

        // Optional: verify it still matches after a reload (persistence via our fake backend)
        cy.reload();
        cy.wait("@getPortfolio");
        openSummaryTab();
        assertSummaryViewMatches(updatedSummary);
    });
    });