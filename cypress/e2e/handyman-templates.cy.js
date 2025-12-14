    // cypress/e2e/handyman-templates.cy.js

    const HANDYMAN_ID = "handyman-fixture-id";
    const OWNER_ID = "vendor-user-id";

    describe("FE-E2E-HM-TPL-1 – Handyman templates — list, create new template, update existing", () => {
    let handymanTemplate;
    let vendorUser;

    beforeEach(() => {
        cy.resetAppState();

        cy.fixture("portfolios.json")
        .then((portfolios) => {
            handymanTemplate = {
            _id: HANDYMAN_ID,
            userId: OWNER_ID,
            ...portfolios.handyman,
            };

            return cy.fixture("vendorUser.json");
        })
        .then((v) => {
            vendorUser = v;

            cy.window().then((win) => {
            win.localStorage.setItem("token", "dummy-token");
            win.localStorage.setItem("userId", OWNER_ID);
            win.localStorage.setItem("email", vendorUser.email);
            });

            cy.intercept("GET", "**/api/handyman-template/*", (req) => {
            req.reply({
                statusCode: 200,
                body: handymanTemplate,
            });
            }).as("getHandymanTemplate");

            cy.intercept("GET", "**/api/user/me", {
            statusCode: 200,
            body: { id: OWNER_ID, email: vendorUser.email },
            }).as("getMe");

            cy.intercept("PUT", "**/api/handyman-template/*", (req) => {
            // Replace template with whatever Studio sends
            handymanTemplate = req.body;
            req.reply({
                statusCode: 200,
                body: handymanTemplate,
            });
            }).as("updateTemplate");
        });
    });

    it("lists a handyman template via public portfolio route /portfolios/handyman/:id", () => {
        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}`);

        cy.wait("@getHandymanTemplate");

        cy.contains(handymanTemplate.hero.title).should("exist");
        cy.contains(handymanTemplate.servicesSectionTitle).should("exist");
        cy.contains(handymanTemplate.portfolioTitle).should("exist");
        cy.contains(handymanTemplate.contact.title).should("exist");

        cy.contains("Click here to edit")
        .should("have.attr", "href")
        .and("include", `/portfolios/handyman/${HANDYMAN_ID}/edit`);
    });

    it("updates template fields in Studio and sees them reflected on public page", () => {
        const newTitle = "Fixture Emergency Handyman Services";

        cy.visit(`/portfolios/handyman/${HANDYMAN_ID}/edit`);

        cy.wait("@getHandymanTemplate");
        cy.wait("@getMe");

        cy.get('input[name="hero.title"]')
        .clear()
        .type(newTitle);

        cy.contains("button", "Save All").click();

        cy.wait("@updateTemplate");

        cy.url().should("include", `/portfolios/handyman/${HANDYMAN_ID}`);

        cy.contains(newTitle).should("exist");
    });
    });
