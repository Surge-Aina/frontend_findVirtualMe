    // FE-E2E-TELE-1 – Telemetry visit flow

    describe("FE-E2E-TELE-1 – Telemetry visit flow", () => {
    const backendUrl = Cypress.env("backendUrl");

    // Small helper to normalize body (string vs object)
    const getBody = (request) => {
        if (!request.body) return {};
        if (typeof request.body === "string") {
        try {
            return JSON.parse(request.body);
        } catch {
            return {};
        }
        }
        return request.body;
    };

    it("does NOT send telemetry when cookie consent is missing", () => {
        cy.intercept("POST", `${backendUrl}/api/telemetry/visit`).as("telemetryVisit");

        cy.visit("/");

        // Cookie banner should be visible, but no consent yet
        cy.contains("We use cookies to improve your experience").should("be.visible");

        // Wait a bit to detect any accidental telemetry calls
        cy.wait(1000);

        cy.get("@telemetryVisit.all").should("have.length", 0);

        // Navigate to another page that counts as a "visit", e.g. /payment
        cy.visit("/payment");
        cy.wait(1000);

        // Still no telemetry as consent is not accepted
        cy.get("@telemetryVisit.all").should("have.length", 0);
    });

    it("sends telemetry with required fields after accepting cookies", () => {
    const backendUrl = Cypress.env("backendUrl");

    cy.intercept("POST", `${backendUrl}/api/telemetry/visit`).as("telemetryVisit");

    cy.visit("/");

    // Accept cookies in CookieConsent banner
    cy.contains("button", "Accept").click({ force: true });

    // First POST should be for the current page "/"
    cy.wait("@telemetryVisit").then(({ request }) => {
        const body =
        typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body || {};
        expect(body).to.have.property("page", "/");
    });

    // Now navigate to a "visit" page; /payment is a good candidate
    cy.visit("/payment");

    // Next POST should be for "/payment"
    cy.wait("@telemetryVisit").then(({ request }) => {
        const body =
        typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body || {};
        expect(body).to.have.property("page", "/payment");
    });
    });

    });
