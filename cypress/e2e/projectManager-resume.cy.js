    // cypress/e2e/projectManager-resume.cy.js

    const pmPortfolioId = "pm-e2e-portfolio-id";
    const ownerEmail = "vendor@example.com";

    // We'll pretend the backend stores this as the resumeUrl
    // (conceptually tied to cypress/fixtures/sample-resume.pdf)
    const testResumeUrl = "sample-resume.pdf";

    // ---------- Test data helpers --------------------------------------------------

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
    resumeUrl: "",
    ...overrides,
    });

    let serverPortfolio;

    const initServerPortfolio = () => {
    serverPortfolio = makeBasePortfolio();
    };

    // ---------- API stubs ----------------------------------------------------------

    const stubAuthAndPortfolioApi = () => {
    // Logged-in owner
    cy.intercept("GET", "**/user/me", {
        statusCode: 200,
        body: {
        user: {
            _id: "6970124025d8c08c5c136ae0",
            name: "vendor JK",
            email: ownerEmail,
            role: "VENDOR",
        },
        },
    }).as("getUser");

    // Portfolio fetch
    cy.intercept("GET", "**/portfolio/id/*", (req) => {
        req.reply({
        statusCode: 200,
        body: serverPortfolio,
        });
    }).as("getPortfolio");

    // Resume upload – just set resumeUrl to our test value
    cy.intercept("POST", "**/portfolio/resume/*", (req) => {
        serverPortfolio = {
        ...serverPortfolio,
        resumeUrl: testResumeUrl,
        };

        req.reply({
        statusCode: 200,
        body: { portfolio: serverPortfolio },
        });
    }).as("uploadResume");

    // Save summary (persists resumeUrl)
    cy.intercept("PATCH", "**/portfolio/edit", (req) => {
        const incoming = req.body?.portfolio || {};

        serverPortfolio = {
        ...serverPortfolio,
        ...incoming,
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
        win.localStorage.setItem("token", "fake-jwt-token");
        win.localStorage.setItem("email", ownerEmail);
        },
    });

    cy.wait("@getUser");
    cy.wait("@getPortfolio");
    };

    // ---------- Test ---------------------------------------------------------------

    describe("Project Manager portfolio - Resume upload", () => {
    beforeEach(() => {
        initServerPortfolio();
        stubAuthAndPortfolioApi();
    });

    it("allows the owner to upload a resume and makes the Resume tab clickable", () => {
        visitPmPortfolioAsOwner();

        // Open the summary edit form
        cy.get('button[aria-label="Edit"]').click();

        // Upload sample-resume from fixtures
        cy.get('input[type="file"][accept=".pdf"]')
        .should("exist")
        .selectFile("cypress/fixtures/sample-resume.pdf", { force: true });

        // Upload endpoint should respond with our testResumeUrl
        cy.wait("@uploadResume")
        .its("response.body.portfolio.resumeUrl")
        .should("eq", testResumeUrl);

        // Save the summary (persists resumeUrl)
        cy.contains("button", /^Save$/).click();
        cy.wait("@saveSummary");

        // Stub window.open so NO real tab is opened
        cy.window().then((win) => {
        cy.stub(win, "open").as("windowOpen");
        });

        // Click the Resume tab in the PM nav
        cy.contains("button", /^Resume$/)
        .scrollIntoView()
        .click({ force: true });

        // Just verify that clicking tried to open the right URL
        cy.get("@windowOpen").should("have.been.calledWith", testResumeUrl);
    });
    });