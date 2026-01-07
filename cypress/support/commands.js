    // cypress/support/commands.js

    const getBackendUrl = () => Cypress.env("backendUrl");

    /**
     * Clears app auth/session state in a safe way
     */
    Cypress.Commands.add("resetAppState", () => {
    cy.window({ log: false }).then((win) => {
        win.localStorage.removeItem("token");
        win.localStorage.removeItem("email");
        win.localStorage.removeItem("userId");
        win.localStorage.removeItem("portfolioId");
        win.localStorage.removeItem("onboardingSessionId");
    });
    });

    /**
     * API login helper (real backend).
     * - Does NOT auto-visit /dashboard (dashboard currently causes 404 Axios errors in your env).
     * - Stores token/email/userId in localStorage in the same browser context as the test.
     */
    Cypress.Commands.add("apiLogin", (email, password = "Password123!") => {
    const backendUrl = getBackendUrl();

    return cy
        .request({
        method: "POST",
        url: `${backendUrl}/user/login`,
        body: { email, password },
        failOnStatusCode: false,
        })
        .then((res) => {
        // Make failures obvious + readable
        expect(
            [200, 201],
            `Login should succeed (POST ${backendUrl}/user/login). Got status=${res.status} body=${JSON.stringify(res.body)}`
        ).to.include(res.status);

        const token = res.body?.token;
        const user = res.body?.user;

        expect(token, "token from login").to.be.a("string").and.not.be.empty;

        return cy.window().then((win) => {
            win.localStorage.setItem("token", token);
            win.localStorage.setItem("email", user?.email || email);
            if (user?._id || user?.id) {
            win.localStorage.setItem("userId", user._id || user.id);
            }
            return res.body;
        });
        });
    });

    /**
     * API signup helper (optional; not used by this sprint test because UI signup happens inside onboarding flow)
     */
    Cypress.Commands.add("apiSignup", (overrides = {}) => {
    const backendUrl = getBackendUrl();
    const unique = Date.now();

    const payload = {
        name: overrides.name || `E2E User ${unique}`,
        username: overrides.username || `e2e_${unique}`,
        email: overrides.email || `e2e_${unique}@example.com`,
        password: overrides.password || "Password123!",
    };

    return cy
        .request({
        method: "POST",
        url: `${backendUrl}/user/signup`,
        body: payload,
        failOnStatusCode: false,
        })
        .then((res) => {
        expect(
            [200, 201],
            `Signup should succeed (POST ${backendUrl}/user/signup). Got status=${res.status} body=${JSON.stringify(res.body)}`
        ).to.include(res.status);

        const token = res.body?.token;
        const email = res.body?.email || payload.email;

        expect(token, "token from signup").to.be.a("string").and.not.be.empty;

        return cy.window().then((win) => {
            win.localStorage.setItem("token", token);
            win.localStorage.setItem("email", email);
            return { payload, token };
        });
        });
    });
