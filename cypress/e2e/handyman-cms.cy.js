    // cypress/e2e/handyman-cms.cy.js
    describe("FE-E2E-HM-CMS-1 — Handyman before/after portfolio CRUD", () => {
    const unique = Date.now();
    const user = {
        firstName: "HM",
        lastName: `CMS${unique}`,
        email: `hm_cms_${unique}@example.com`,
        password: "Password123!",
        username: `hm_cms_${unique}`,
    };

    let createdHandymanId = null;

    const acceptCookiesIfShown = () => {
        cy.get("body").then(($body) => {
        if ($body.find('button:contains("Accept")').length) {
            cy.contains("button", /^accept$/i).click({ force: true });
        }
        });
    };

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

    const signupAndCreateHandymanPortfolio = () => {
        cy.visit("/");
        acceptCookiesIfShown();

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

        cy.intercept("POST", "**/api/users").as("signup");
        cy.intercept("POST", "**/api/auth/login").as("login");

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

        cy.contains(/choose a template/i, { timeout: 20000 }).should("be.visible");

        cy.intercept("POST", "**/api/handyman-template").as("createHandymanTemplate");
        cy.intercept("PATCH", "**/api/users/portfolio-id").as("addPortfolioId");
        cy.intercept("POST", "**/api/portfolios/edit-log").as("editLog");

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

        cy.location("pathname", { timeout: 60000 }).should("match", /^\/portfolios\/handyman\/[a-f0-9]{24}$/i);

        cy.location("pathname").then((path) => {
        createdHandymanId = path.split("/").pop();
        expect(createdHandymanId).to.match(/^[a-f0-9]{24}$/i);
        });
    };

    const loginViaUI = () => {
        cy.visit("/");
        acceptCookiesIfShown();

        cy.contains("button", /log in\s*\/\s*sign up/i, { timeout: 20000 })
        .should("be.visible")
        .click();

        cy.contains("button, a", /^sign in$/i, { timeout: 20000 }).click();

        cy.intercept("POST", "**/api/auth/login").as("login2");
        fillLoginForm(user.email, user.password);
        cy.contains("button", /^sign in$/i, { timeout: 20000 }).click();

        cy.wait("@login2", { timeout: 30000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        cy.location("pathname", { timeout: 30000 }).should("eq", "/profile");
    };

    const goToDashboard = () => {
        // Avoid brittle nav clicks; dashboard is a normal route in your app.
        cy.visit("/dashboard");
        acceptCookiesIfShown();
        cy.location("pathname", { timeout: 30000 }).should("eq", "/dashboard");
        cy.contains(/my portfolios/i, { timeout: 30000 }).should("be.visible");
    };

    before(() => {
        signupAndCreateHandymanPortfolio();
    });

    it("loads the Before/After section (GET), creates (POST multipart), edits (PUT), deletes (DELETE)", () => {
        // global support clears cookies/localStorage -> login again
        loginViaUI();

        // Dashboard -> open created portfolio
        goToDashboard();

        cy.contains(createdHandymanId, { timeout: 20000 })
        .scrollIntoView()
        .click({ force: true });

        cy.location("pathname", { timeout: 30000 }).should("eq", `/portfolios/handyman/${createdHandymanId}`);

        // Intercepts MUST be set before clicking edit
        cy.intercept("GET", "**/api/handyman-template/**").as("getHandymanTemplate");
        cy.intercept("GET", "**/api/handyman/portfolio?*").as("getHandymanPortfolio");

        // Go to edit page
        cy.contains(/click here to edit/i, { timeout: 20000 }).click();
        cy.location("pathname", { timeout: 30000 }).should("eq", `/portfolios/handyman/${createdHandymanId}/edit`);

        // GET can be 304 sometimes due to caching -> allow 200/304
        cy.wait("@getHandymanTemplate", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);

        cy.wait("@getHandymanPortfolio", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);

        cy.contains(/portfolio projects\s*\(before\/after\)/i, { timeout: 30000 })
        .scrollIntoView()
        .should("be.visible");

        // ---- CREATE (multipart POST) ----
        const title = `kitchen photos ${unique}`;
        const subtitle = "great work";
        const category = "KIT";

        cy.intercept("POST", "**/api/handyman/portfolio").as("createBeforeAfter");
        cy.intercept("PUT", "**/api/handyman/portfolio/**").as("updateBeforeAfter");
        cy.intercept("DELETE", "**/api/handyman/portfolio/**").as("deleteBeforeAfter");

        // Fill create form in Before/After section (assert via input values, not cy.contains(text))
        cy.contains(/portfolio projects\s*\(before\/after\)/i)
        .parentsUntil("body")
        .first()
        .within(() => {
            cy.contains(/^title$/i).parent().find("input").first().clear().type(title);
            cy.contains(/subtitle/i).parent().find("input").first().clear().type(subtitle);
            cy.contains(/^category$/i).parent().find("input").first().clear().type(category);

            cy.contains(/before image/i)
            .parent()
            .find('input[type="file"]')
            .first()
            .selectFile("cypress/fixtures/before.jpg", { force: true });

            cy.contains(/after image/i)
            .parent()
            .find('input[type="file"]')
            .first()
            .selectFile("cypress/fixtures/after.jpg", { force: true });
        });

        cy.contains("button", /^add project$/i, { timeout: 20000 }).click();

        cy.wait("@createBeforeAfter", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        // The UI renders the title as an INPUT value, not plain text. Assert the value exists somewhere.
        cy.get("input", { timeout: 30000 })
        .filter((_, el) => el.value === title)
        .should("have.length.at.least", 1);

        // ---- EDIT (PUT) ----
        const updatedTitle = `kitchen photos UPDATED ${unique}`;

        cy.get("input")
        .filter((_, el) => el.value === title)
        .first()
        .scrollIntoView()
        .clear()
        .type(updatedTitle);

        cy.contains("button", /^save changes$/i).scrollIntoView().click();

        cy.wait("@updateBeforeAfter", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201]);

        // ============================================================
        // ✅ DELETE THE WHOLE PORTFOLIO FROM DASHBOARD (CARD DELETE)
        // ============================================================
        goToDashboard();

        // Set the DELETE intercept BEFORE clicking the delete button
        cy.intercept({ method: "DELETE", url: "**/*" }, (req) => {
        if (createdHandymanId && req.url.includes(createdHandymanId)) {
            req.alias = "deletePortfolio";
        }
        });

        // Click Delete on the portfolio card (scoped)
        cy.contains(createdHandymanId, { timeout: 30000 })
        .scrollIntoView()
        .parentsUntil("body")
        .first()
        .within(() => {
            cy.contains("button", /delete(\s+portfolio)?/i, { timeout: 20000 }).click({ force: true });
        });

        // Confirm modal (if it exists)
        cy.get("body").then(($body) => {
        const confirmBtn =
            $body.find('button:contains("Confirm")').length ||
            $body.find('button:contains("Yes")').length ||
            $body.find('button:contains("Delete")').length;

        if (confirmBtn) {
            cy.contains("button", /confirm|yes|delete/i, { timeout: 10000 }).click({ force: true });
        }
        });

        cy.wait("@deletePortfolio", { timeout: 60000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 201, 204]);

        // Card should be gone
        cy.contains(createdHandymanId, { timeout: 30000 }).should("not.exist");
    });
    });