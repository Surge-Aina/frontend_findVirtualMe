describe("FE-E2E-HM-AUTH-1 — Handyman Studio auth", () => {
  const unique = Date.now();
  const createdHandymanId = "hm-auth-portfolio-1";
  const user = {
    firstName: "HM",
    lastName: `E2E${unique}`,
    email: `hm_e2e_${unique}@example.com`,
    password: "Password123!",
    username: `hm_e2e_${unique}`,
  };

  const meResponse = {
    user: {
      _id: "hm-user-1",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: "USER",
      portfolios: [{ portfolioId: createdHandymanId, portfolioType: "Handyman" }],
    },
    portfolioIds: [{ portfolioId: createdHandymanId, portfolioType: "Handyman" }],
  };

  const fillLoginForm = (email, password) => {
    cy.get("#email").clear().type(email);
    cy.get("#password").clear().type(password, { log: false });
  };

  it("registers through onboarding, creates Handyman portfolio, and reaches the portfolio page", () => {
    cy.intercept("POST", "**/api/users", {
      statusCode: 201,
      body: {
        user: {
          _id: "hm-user-1",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          goal: "find-job",
          industry: "other",
          experienceLevel: null,
          skills: ["Customer Service"],
          portfolios: [],
        },
      },
    }).as("signup");

    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "hm-auth-token",
        ...meResponse,
      },
    }).as("login");

    cy.intercept("POST", "**/api/portfolios", {
      statusCode: 201,
      body: {
        portfolio: {
          _id: createdHandymanId,
          template: "handyman",
          title: `${user.firstName} ${user.lastName}`,
        },
      },
    }).as("createPortfolio");

    cy.intercept("PATCH", "**/api/users/portfolio-id", {
      statusCode: 200,
      body: { ok: true },
    }).as("linkPortfolio");

    cy.intercept("POST", "**/api/portfolios/edit-log", {
      statusCode: 201,
      body: { success: true },
    }).as("editLog");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: meResponse,
    }).as("getMe");

    cy.visit("/");
    cy.contains("button", /log in\s*\/\s*sign up/i).click();
    cy.contains("button", /^sign up$/i).click();

    cy.get("[data-cy=goal-card-find-job]").click();
    cy.get("[data-cy=industry-other]").click();
    cy.contains("button", "Customer Service").click();
    cy.get("[data-cy=skills-continue]").click();

    cy.get("#firstName").type(user.firstName);
    cy.get("#lastName").type(user.lastName);
    cy.get("#email").clear().type(user.email);
    cy.get("#password").type(user.password, { log: false });
    cy.get("#username").type(user.username);

    cy.clock();
    cy.contains("Complete Setup").click();

    cy.wait("@signup");
    cy.wait("@login");
    cy.tick(4000);

    cy.location("pathname", { timeout: 20000 }).should("eq", "/onboarding_info");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.eq("hm-auth-token");
      expect(win.localStorage.getItem("email")).to.eq(user.email);
    });

    cy.contains("Choose a Template").should("be.visible");
    cy.contains("Handyman / Local Repair Services").click();

    cy.wait("@createPortfolio");
    cy.wait("@linkPortfolio");
    cy.wait("@editLog");
    cy.wait("@getMe");

    cy.location("pathname", { timeout: 20000 }).should("eq", `/portfolios/view/${createdHandymanId}/edit`);
  });

  it("logs out, logs back in via UI, navigates to Dashboard, and opens the created Handyman portfolio", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "hm-auth-token",
        ...meResponse,
      },
    }).as("login");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: meResponse,
    }).as("getMe");

    cy.intercept("GET", "**/api/portfolios/mine", {
      statusCode: 200,
      body: {
        portfolios: [
          {
            _id: createdHandymanId,
            template: "handyman",
            title: "Handyman Test Portfolio",
            portfolioType: "Handyman",
            visibility: "private",
          },
        ],
      },
    }).as("getMine");

    cy.intercept("GET", "**/api/portfolios/public/list*", {
      statusCode: 200,
      body: { portfolios: [] },
    }).as("getPublicList");

    cy.visit("/");
    cy.contains("button", /log in\s*\/\s*sign up/i).click();
    fillLoginForm(user.email, user.password);
    cy.contains("button", /^sign in$/i).click();

    cy.wait("@login");
    cy.wait("@getMe");
    cy.location("pathname", { timeout: 20000 }).should("eq", "/profile");

    cy.contains("button, a", /^dashboard$/i).click();
    cy.wait("@getMine");
    cy.wait("@getPublicList");

    cy.location("pathname", { timeout: 20000 }).should("eq", "/dashboard");
    cy.contains(/my portfolios/i).should("be.visible");
    cy.contains("Handyman Test Portfolio").should("be.visible");

    cy.contains("Handyman Test Portfolio")
      .parentsUntil("body")
      .first()
      .within(() => {
        cy.contains("button", /^edit$/i).click();
      });

    cy.location("pathname", { timeout: 20000 }).should("eq", `/portfolios/view/${createdHandymanId}/edit`);
  });
});
