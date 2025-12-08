    // cypress/support/commands.js

    // 🔁 Clear app-specific auth state
    Cypress.Commands.add("resetAppState", () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("email");
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("portfolioId");
    });

    // get backend URL from Cypress env (configured in cypress.config.js)
    const getBackendUrl = () => Cypress.env("backendUrl");

    // ✅ Stubbed login helper (no backend) for FE E2E tests
    Cypress.Commands.add("fakeLogin", () => {
    // Set the minimal auth state your app expects
    cy.window().then((win) => {
        win.localStorage.setItem("token", "dummy-token");
        win.localStorage.setItem("email", "vendor@example.com");
        win.localStorage.setItem("userId", "test-user-id");
    });

    // Go straight to dashboard as a "logged-in" user
    cy.visit("/dashboard");
    });

    // 🔐 API-based signup helper (keep for future real E2E / smoke tests)
    Cypress.Commands.add("signup", (overrides = {}) => {
    const backendUrl = getBackendUrl();

    const unique = Date.now();
    const user = {
        name: overrides.name || "Test User",
        username: overrides.username || `testuser_${unique}`,
        email: overrides.email || `test_${unique}@example.com`,
        password: overrides.password || "Password123!",
    };

    return cy
        .request("POST", `${backendUrl}/user/signup`, user)
        .then((res) => {
        // backend returns { token, email } in SignUp.jsx usage
        const { token, email } = res.body;

        window.localStorage.setItem("token", token);
        window.localStorage.setItem("email", email);

        // optional: fetch /user/me or read user id if backend returns it
        if (res.body.user && (res.body.user._id || res.body.user.id)) {
            window.localStorage.setItem(
            "userId",
            res.body.user._id || res.body.user.id
            );
        }

        return { user, token };
        });
    });

    // 🔐 API-based login helper (keep for future real E2E / smoke tests)
    Cypress.Commands.add("login", (email, password = "Password123!") => {
    const backendUrl = getBackendUrl();

    return cy
        .request("POST", `${backendUrl}/user/login`, {
        email,
        password,
        })
        .then((res) => {
        const { token, user } = res.body;

        window.localStorage.setItem("token", token);
        window.localStorage.setItem("email", user.email);
        if (user._id || user.id) {
            window.localStorage.setItem("userId", user._id || user.id);
        }

        // After setting tokens, visit the app (you can override in tests if needed)
        cy.visit("/dashboard");

        return res.body;
        });
    });

    // 🔓 logout helper
    Cypress.Commands.add("logout", () => {
    // mirror AuthContext.logout side-effects: clear token/email/userId
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("email");
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("portfolioId");

    // ensure we're on a public page
    cy.visit("/");
    });
