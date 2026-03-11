    // cypress/e2e/handyman-18-cross-role-access-regression.cy.js

    describe("FE-E2E-HM-ADMIN-4 — Cross-Role Access Regression", () => {

    const unique = Date.now();
    const vendorUser = {
    firstName: "HM",
    lastName: `VENDOR${unique}`,
    email: `hm_vendor_${unique}@example.com`,
    password: "Password123!",
    username: `hm_vendor_${unique}`,
    };

    const loginViaModal = (email, password) => {
        cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 })
        .should("exist")
        .click({ force: true });

        cy.get(
        'input#email, input[placeholder="Email"], input[type="email"], input[name="email"]'
        )
        .first()
        .should("exist")
        .clear()
        .type(email);

        cy.get(
        'input#password, input[placeholder="Password"], input[type="password"], input[name="password"]'
        )
        .first()
        .should("exist")
        .clear()
        .type(password, { log: false });

        cy.contains("button", /^sign in$/i)
        .should("exist")
        .click({ force: true });

        // land on profile
        cy.url({ timeout: 15000 }).should("include", "/profile");
        cy.contains(/personal information/i).should("exist");
    };

    const signupOnly = (user) => {
    cy.visit("/");

    cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 })
        .should("exist")
        .click({ force: true });

    cy.contains("button, a", /^sign up$/i, { timeout: 20000 }).click();
    cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding");

    cy.contains(/what's your main goal\?/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/find a job/i).click();

    cy.contains(/what type of work do you do\?/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/^other$/i).click();

    cy.contains(/what are your skills\?/i, { timeout: 20000 }).should("be.visible");
    cy.contains(/^customer service$/i).click();
    cy.contains("button", /^continue$/i).click();

    cy.intercept("POST", "**/user/addUser").as("signup");
    cy.intercept("POST", "**/user/login").as("login");

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
    };


    it("runs admin, vendor, and guest flows in succession without leaking access", () => {
        // ------- PHASE 1: ADMIN SESSION -------
        cy.visit("/");

        loginViaModal("admin@test.com", "Admin@123");

        // Admin-only navigation visible
        cy.contains("a,button", /^admin$/i).should("exist");

        // Admin can access /admin (admin choice page)
        cy.visit("/admin");
        cy.url({ timeout: 15000 }).should("include", "/admin");

        // confirm admin access without depending on brittle page copy
        cy.contains("button, a", /log in.*sign up/i).should("not.exist");

        // End admin session
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/");

        // ------- PHASE 2: VENDOR SESSION -------
        signupOnly(vendorUser);

        // signup flow already logs the vendor in
        cy.url({ timeout: 15000 }).should("satisfy", (url) => {
        return url.includes("/profile") || url.includes("/onboarding_info");
        });

        // After fresh vendor signup/login, admin nav must NOT be present
        cy.contains("a,button", /^admin$/i).should("not.exist");

        // Vendor can still use normal vendor features like dashboard
        cy.contains("a,button", /^dashboard$/i)
        .should("exist")
        .click();
        cy.url({ timeout: 15000 }).should("include", "/dashboard");

        // End vendor session
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/");

        // ------- PHASE 3: GUEST SESSION (no login) -------
        // Guest hits dashboard: should not see private dashboard UI
        cy.visit("/dashboard");
        cy.url().then(() => {
        cy.contains(/your dashboard|my projects|studio/i, {
            matchCase: false,
        }).should("not.exist");

        // Guest should see login / sign up CTA somewhere
        cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist");
        });

        // Guest hits admin logs directly: must not see admin UI
        cy.visit("/itadmin/logs");
        cy.url().then(() => {
        cy.contains(/portfolio edit logs/i, { matchCase: false }).should(
            "not.exist"
        );
        cy.contains("button, a", /log in.*sign up/i, { timeout: 20000 }).should("exist");
        });
    });
    });
