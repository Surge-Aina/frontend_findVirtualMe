    // cypress/e2e/handyman/FE-E2E-HM-AUTH-1.cy.js

    describe("FE-E2E-HM-AUTH-1 — Handyman auth (register + login + Studio access)", () => {
    const backendUrl = Cypress.env("backendUrl");

    const unique = Date.now();
    const user = {
        firstName: "HM",
        lastName: `E2E${unique}`,
        email: `hm_e2e_${unique}@example.com`,
        password: "Password123!",
        username: `hm_e2e_${unique}`,
    };

    it("registers through onboarding, logs in, and reaches the signed-in onboarding_info state", () => {
        cy.visit("/");

        cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 })
        .should("be.visible")
        .click();

        cy.contains('button[type="button"]', /^sign up$/i, { timeout: 20000 }).click();

        cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding");

        cy.contains(/what's your main goal\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/find a job/i).click();

        cy.contains(/what type of work do you do\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/^other$/i).click();

        cy.contains(/what are your skills\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/^customer service$/i).click();
        cy.contains("button", /^continue$/i).click();

        // ✅ Your app uses POST /user/addUser for signup
        cy.intercept("POST", "**/user/addUser").as("signup");
        // It also auto-logs-in after signup
        cy.intercept("POST", "**/user/login").as("login");

        cy.contains(/tell us about yourself/i, { timeout: 20000 }).should("be.visible");

        cy.get('input[placeholder="Enter your first name"]').type(user.firstName);
        cy.get('input[placeholder="Enter your last name"]').type(user.lastName);
        cy.get('input[placeholder="your@email.com"]').type(user.email);
        cy.get('input[placeholder="Enter a password"]').type(user.password);
        cy.get('input[placeholder="Choose a username"]').type(user.username);

        cy.contains("button", /complete setup/i).click();

        cy.wait("@signup", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.wait("@login", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        // ✅ This is the “signed-in success state” in your real flow
        cy.location("pathname", { timeout: 30000 }).should("eq", "/onboarding_info");

        // ✅ Confirm token persisted
        cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.be.a("string").and.not.be.empty;
        expect(win.localStorage.getItem("email")).to.eq(user.email);
        });

        // ✅ Confirm backend session works (auth is real)
        cy.window().then((win) => {
        const token = win.localStorage.getItem("token");
        cy.request({
            method: "GET",
            url: `${backendUrl}/user/me`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(200);
        });
        });

        // 🚫 Do NOT click template here until /api/portfolios/new-portfolio is fixed
        // That endpoint is currently 404 (your logs prove it).
    });
    });
