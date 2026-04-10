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
      url: `${backendUrl}/api/auth/login`,
      body: { email, password },
      failOnStatusCode: false,
    })
    .then((res) => {
      // Make failures obvious + readable
      expect(
        [200, 201],
        `Login should succeed (POST ${backendUrl}/api/auth/login). Got status=${res.status} body=${JSON.stringify(res.body)}`,
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
      url: `${backendUrl}/api/auth/signup`,
      body: payload,
      failOnStatusCode: false,
    })
    .then((res) => {
      expect(
        [200, 201],
        `Signup should succeed (POST ${backendUrl}/api/auth/signup). Got status=${res.status} body=${JSON.stringify(res.body)}`,
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

Cypress.Commands.add("ensurePMUserExists", () => {
  const backendUrl = getBackendUrl();

  const user = {
    name: "Allan Walker",
    email: "pm_test_user@example.com",
    password: "StrongPass123",
    username: "pm_test_user",
  };

  cy.request({
    method: "POST",
    url: `${backendUrl}/api/auth/signup`,
    body: user,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("loginPMUser", () => {
  const backendUrl = getBackendUrl();

  cy.request("POST", `${backendUrl}/api/auth/login`, {
    email: "pm_test_user@example.com",
    password: "StrongPass123",
  })
    .then((res) => {
      const token = res.body.token;
      Cypress.env("pmToken", token);

      return cy.request({
        method: "GET",
        url: `${backendUrl}/api/users/me`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    })
    .then((userRes) => {
      Cypress.env("pmUser", userRes.body);
    });
});

Cypress.Commands.add("ensurePMPortfolio", () => {
  const backendUrl = getBackendUrl();

  const token = Cypress.env("pmToken");
  const user = Cypress.env("pmUser").user;

  return cy
    .request({
      method: "POST",
      url: `${backendUrl}/portfolio/add`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        portfolio: user,
      },
    })
    .then((res) => {
      Cypress.env("pmPortfolioId", res.body._id);
    });
});

Cypress.Commands.add("clearAllProjects", () => {
  cy.get("body").then(($body) => {
    if ($body.find('[data-testid="edit-project-btn"]').length > 0) {
      cy.get('[data-testid="edit-project-btn"]').each(() => {
        cy.get('[data-testid="edit-project-btn"]').first().click();
        cy.get('[data-testid="delete-project-btn"]').click();
      });
    }
  });
});
