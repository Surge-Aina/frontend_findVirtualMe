    // cypress/e2e/handyman/FE-E2E-HM-AUTH-1.cy.js

    describe("FE-E2E-HM-AUTH-1 — Handyman Studio auth", () => {
    const backendUrl = Cypress.env("backendUrl");

    const unique = Date.now();
    const user = {
        firstName: "HM",
        lastName: `E2E${unique}`,
        email: `hm_e2e_${unique}@example.com`,
        password: "Password123!",
        username: `hm_e2e_${unique}`,
    };

    let createdHandymanId = null;

    const fillLoginForm = (email, password) => {
        cy.get('input[name="email"], input[type="email"], input[placeholder*="email" i]')
        .first()
        .clear()
        .type(email);

        cy.get('input[name="password"], input[type="password"], input[placeholder*="password" i]')
        .first()
        .clear()
        .type(password, { log: false });
    };

    it("registers through onboarding, creates Handyman portfolio, and reaches the portfolio page", () => {
        cy.visit("/");

        cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 })
        .should("be.visible")
        .click();

        cy.contains("button", /^sign up$/i, { timeout: 20000 }).click();

        cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding");

        cy.contains(/what's your main goal\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/find a job/i).click();

        cy.contains(/what type of work do you do\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/^other$/i).click();

        cy.contains(/what are your skills\?/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/^customer service$/i).click();
        cy.contains("button", /^continue$/i).click();

        // Intercepts (before submit)
        cy.intercept("POST", "**/api/users").as("signup");
        cy.intercept("POST", "**/api/auth/login").as("login");
        cy.intercept("GET", "**/api/users/me").as("me");

        cy.contains(/tell us about yourself/i, { timeout: 20000 }).should("be.visible");

        cy.get('input[placeholder="Enter your first name"]').type(user.firstName);
        cy.get('input[placeholder="Enter your last name"]').type(user.lastName);
        cy.get('input[placeholder="your@email.com"]').type(user.email);
        cy.get('input[placeholder="Enter a password"]').type(user.password, { log: false });
        cy.get('input[placeholder="Choose a username"]').type(user.username);

        cy.contains("button", /complete setup/i).click();

        cy.wait("@signup", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.wait("@login", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.location("pathname", { timeout: 30000 }).should("eq", "/onboarding_info");

        cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.be.a("string").and.not.be.empty;
        expect(win.localStorage.getItem("email")).to.eq(user.email);
        });

        // Backend session check
        cy.window().then((win) => {
        const token = win.localStorage.getItem("token");
        cy.request({
            method: "GET",
            url: `${backendUrl}/api/users/me`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(200);
        });
        });

        // Create Handyman portfolio
        cy.contains(/choose a template/i, { timeout: 20000 }).should("be.visible");

        cy.intercept("POST", "**/api/handyman-template").as("createHandymanTemplate");
        cy.intercept("PATCH", "**/api/users/portfolio-id").as("addPortfolioId");
        cy.intercept("POST", "**/api/portfolio-edit-log").as("editLog");

        cy.contains(/handyman\s*\/\s*local repair services/i, { timeout: 20000 })
        .scrollIntoView()
        .click();

        cy.wait("@createHandymanTemplate", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.wait("@addPortfolioId", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.wait("@editLog", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        // ✅ FIX: wait for the actual navigation (it can lag behind requests)
        cy.location("pathname", { timeout: 60000 }).should("match", /^\/portfolios\/handyman\/[a-f0-9]{24}$/i);

        cy.location("pathname").then((path) => {
        createdHandymanId = path.split("/").pop();
        expect(createdHandymanId).to.match(/^[a-f0-9]{24}$/i);
        });

        cy.contains(/you are viewing your portfolio/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/click here to edit/i, { timeout: 20000 }).should("be.visible");
    });

    it("logs out, logs back in via UI, navigates to Dashboard, and opens the created Handyman portfolio", () => {
        // We need an id from test 1
        cy.wrap(null).then(() => {
        expect(createdHandymanId, "createdHandymanId should exist from test 1").to.be.a("string").and.not.be.empty;
        });

        cy.visit("/");

        // If logged in, logout (safe)
        cy.get("body").then(($body) => {
        const hasLogout = $body.find('button:contains("Logout"), a:contains("Logout")').length > 0;
        if (hasLogout) cy.contains("button, a", /logout/i).click({ force: true });
        });

        // Open auth modal
        cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 })
        .should("be.visible")
        .click();

        // ✅ FIX: don’t require button[type="button"] — just find the “Log in” action
        cy.contains("button, a", /^sign in$/i, { timeout: 20000 }).click();

        cy.intercept("POST", "**/api/auth/login").as("login");

        fillLoginForm(user.email, user.password);

        // Login submit (robust)
        cy.contains("button", /^sign in$/i, { timeout: 20000 }).click();

        cy.wait("@login", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        // After login it goes to profile
        cy.location("pathname", { timeout: 30000 }).should("eq", "/profile");

        // Go to dashboard
        cy.contains("a, button", /^dashboard$/i, { timeout: 20000 }).click();
        cy.location("pathname", { timeout: 30000 }).should("eq", "/dashboard");
        cy.contains(/my portfolios/i, { timeout: 20000 }).should("be.visible");

        // Open created Handyman portfolio by id text (as shown on cards)
        cy.contains(createdHandymanId, { timeout: 20000 })
        .scrollIntoView()
        .click({ force: true });

        cy.location("pathname", { timeout: 30000 }).should("eq", `/portfolios/handyman/${createdHandymanId}`);

        cy.contains(/you are viewing your portfolio/i, { timeout: 20000 }).should("be.visible");
        cy.contains(/click here to edit/i, { timeout: 20000 }).should("be.visible");
    });
    });
