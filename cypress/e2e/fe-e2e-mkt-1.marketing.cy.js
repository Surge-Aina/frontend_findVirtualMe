    // FE-E2E-MKT-1 – Marketing / Landing flow

    describe("FE-E2E-MKT-1 – Marketing / Landing flow", () => {
    const visitHome = () => {
        cy.visit("/");
        cy.contains("h1", "Showcase your work").should("be.visible");
    };

    it("guest: / renders hero + CTA and CTA routes to onboarding", () => {
        visitHome();

        cy.contains("button", "Start creating your portfolio")
        .should("be.visible")
        .click();

        cy.url().should("include", "/onboarding");
    });

    it("logged-in user: CTA routes to /resume when token is present", () => {
        cy.visit("/", {
        onBeforeLoad(win) {
            win.localStorage.setItem("token", "test-token");
            // If your AuthContext needs a user object:
            // win.localStorage.setItem("user", JSON.stringify({ email: "test@example.com" }));
        },
        });

        cy.contains("button", "Start creating your portfolio")
        .should("be.visible")
        .click();

        cy.url().should("include", "/resume");
    });

    it("navigation: Solutions page reachable from landing", () => {
        visitHome();

        cy.contains("button", "Solutions")
        .should("be.visible")
        .click();

        cy.url().should("include", "/solutions");
        cy.contains("For Vendors & Retailers").should("be.visible");
    });

    it("footer: marketing links are present, clickable and not broken", () => {
        visitHome();

        cy.get("footer").should("exist");

        cy.get("footer").within(() => {
        cy.contains("Contact").click({ force: true });

        cy.contains("a", "Pricing")
            .should("have.attr", "href", "/payment")
            .click({ force: true });
        });

        cy.url().should("include", "/payment");
    });
    });
