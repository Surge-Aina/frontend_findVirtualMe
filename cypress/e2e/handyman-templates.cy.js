    // cypress/e2e/handyman-templates.cy.js
    describe("FE-E2E-HM-TPL-1 — Handyman template list & CRUD", () => {
    const backendUrl = Cypress.env("backendUrl") || "http://localhost:5001";

    const unique = Date.now();
    const user = {
        firstName: "HM",
        lastName: `TPL${unique}`,
        email: `hm_tpl_${unique}@example.com`,
        password: "Password123!",
        username: `hm_tpl_${unique}`,
    };

    let token = null;

    Cypress.on("uncaught:exception", (err) => {
    if (err.message?.includes("Cannot read properties of undefined (reading 'frame')")) {
        return false;
    }
    });

    const acceptCookiesIfShown = () => {
        cy.get("body").then(($body) => {
        if (
            $body.find('button:contains("Accept")').length ||
            $body.find('button:contains("OK")').length ||
            $body.find('button:contains("Ok")').length
        ) {
            cy.contains("button", /accept|ok/i).click({ force: true });
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

    const signupOnly = () => {
        cy.visit("/");
        acceptCookiesIfShown();

        cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 })
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

        cy.window().then((win) => {
        token = win.localStorage.getItem("token");
        expect(token, "auth token should exist after signup+login")
            .to.be.a("string")
            .and.not.be.empty;
        });
    };

    const loginViaUI = () => {
        cy.visit("/");
        acceptCookiesIfShown();

        cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 })
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

        cy.window().then((win) => {
        token = win.localStorage.getItem("token");
        expect(token, "auth token should exist after login")
            .to.be.a("string")
            .and.not.be.empty;
        });
    };

    const listTemplates = () => {
        return cy.request({
        method: "GET",
        url: `${backendUrl}/api/handyman-template`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
        });
    };

    const createTemplate = () => {
        const payload = {
        title: `HM Template ${unique}`,
        heroTitle: `Hero ${unique}`,
        heroText: `Hero text ${unique}`,
        };

        return cy.request({
        method: "POST",
        url: `${backendUrl}/api/handyman-template`,
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
        failOnStatusCode: false,
        })
        .then((res) => {
        expect(res.status, "POST create template").to.be.oneOf([200, 201]);

        const id =
            res.body?._id ||
            res.body?.id ||
            res.body?.template?._id ||
            res.body?.template?.id ||
            res.body?.data?._id ||
            res.body?.data?.id;

        expect(id, "created template id").to.be.a("string").and.not.be.empty;

        // ✅ Store as alias (do NOT return a sync value from this callback)
        cy.wrap(id).as("templateId");
        });
    };

    const updateTemplate = (id) => {
        const updated = {
        title: `HM Template UPDATED ${unique}`,
        heroTitle: `Hero UPDATED ${unique}`,
        heroText: `Hero text UPDATED ${unique}`,
        };

        return cy.request({
        method: "PUT",
        url: `${backendUrl}/api/handyman-template/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        body: updated,
        failOnStatusCode: false,
        })
        .then((res) => {
        expect(res.status, "PUT update template").to.be.oneOf([200, 201]);
        cy.wrap(updated).as("updatedTemplate");
        });
    };

    before(() => {
        signupOnly();
    });

    it("lists templates (GET), creates template (POST auth), edits template (PUT), and verifies in list", () => {
        loginViaUI();

        // Dashboard (UI requirement)
        cy.contains("a, button", /^dashboard$/i, { timeout: 20000 }).click();
        cy.location("pathname", { timeout: 30000 }).should("eq", "/dashboard");
        cy.contains(/my portfolios/i, { timeout: 20000 }).should("be.visible");

        // --- GET ---
        listTemplates().then((res) => {
        expect(res.status, "GET templates list").to.eq(200);
        });

        // --- POST ---
        createTemplate();

        // verify created appears in list
        cy.get("@templateId").then((id) => {
        listTemplates().then((res) => {
            const list = Array.isArray(res.body)
            ? res.body
            : Array.isArray(res.body?.templates)
            ? res.body.templates
            : Array.isArray(res.body?.data)
            ? res.body.data
            : [];

            expect(list.length, "templates list should be array-like").to.be.greaterThan(0);

            const found = list.some((t) => (t?._id || t?.id) === id);
            expect(found, "created template should appear in list").to.eq(true);
        });
        });

        // --- PUT ---
        cy.get("@templateId").then((id) => {
        updateTemplate(id);
        });

        // verify updated appears in list
        cy.get("@templateId").then((id) => {
        cy.get("@updatedTemplate").then((updated) => {
            listTemplates().then((res) => {
            const list = Array.isArray(res.body)
                ? res.body
                : Array.isArray(res.body?.templates)
                ? res.body.templates
                : Array.isArray(res.body?.data)
                ? res.body.data
                : [];

            const item = list.find((t) => (t?._id || t?.id) === id);
            expect(item, "updated template exists in list").to.exist;

            if (item?.title) {
                expect(item.title).to.eq(updated.title);
            }
            });
        });
        });
    });
    });
