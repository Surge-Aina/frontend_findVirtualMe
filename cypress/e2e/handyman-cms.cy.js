describe("FE-E2E-HM-CMS-1 — Handyman before/after portfolio CRUD", () => {
  const templateId = "hm-cms-template-1";
  const ownerId = "hm-cms-owner-1";
  const ownerEmail = "hm-cms-owner@example.com";
  const unique = Date.now();
  let serverTemplate;
  let serverProjects;

  const createTitle = `kitchen photos ${unique}`;
  const updatedTitle = `kitchen photos UPDATED ${unique}`;
  const subtitle = "great work";
  const category = "KIT";

  const resetServerState = () => {
    serverTemplate = {
      _id: templateId,
      userId: ownerId,
      hero: { title: "Trusted Handyman", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
      services: [{ icon: "repair", title: "Repairs", description: "desc" }],
      servicesSectionTitle: "Services",
      servicesSectionIntro: "Intro",
      portfolioTitle: "Work",
      portfolioSubtitle: "sub",
      portfolioAllLabel: "All",
      processSteps: [{ number: 1, title: "Step", description: "desc" }],
      testimonials: [],
      contact: { title: "Contact", subtitle: "sub", formTitle: "form" },
    };
    serverProjects = [];
  };

  const stubApi = () => {
    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        _id: ownerId,
        id: ownerId,
        user: {
          _id: ownerId,
          id: ownerId,
          email: ownerEmail,
          name: "CMS Owner",
          portfolios: [{ portfolioId: templateId, portfolioType: "Handyman" }],
        },
      },
    }).as("getMe");

    cy.intercept("GET", `**/api/handyman-template/${templateId}`, (req) => {
      req.reply({ statusCode: 200, body: serverTemplate });
    }).as("getHandymanTemplate");

    cy.intercept("PUT", `**/api/handyman-template/${templateId}`, (req) => {
      serverTemplate = { ...serverTemplate, ...req.body };
      req.reply({ statusCode: 200, body: serverTemplate });
    }).as("saveTemplate");

    cy.intercept("GET", "**/api/handyman/portfolio*", (req) => {
      req.reply({ statusCode: 200, body: serverProjects });
    }).as("getHandymanPortfolio");

    cy.intercept("POST", "**/api/handyman/portfolio", (req) => {
      serverProjects = [
        {
          _id: "proj-1",
          templateId,
          title: createTitle,
          subtitle,
          category,
          beforeImageUrl: "/before.jpg",
          afterImageUrl: "/after.jpg",
        },
      ];
      req.reply({ statusCode: 201, body: serverProjects[0] });
    }).as("createBeforeAfter");

    cy.intercept("PUT", "**/api/handyman/portfolio/*", (req) => {
      serverProjects = serverProjects.map((project) =>
        project._id === "proj-1"
          ? {
              ...project,
              title: updatedTitle,
              subtitle,
              category,
            }
          : project
      );
      req.reply({ statusCode: 200, body: serverProjects[0] });
    }).as("updateBeforeAfter");

    cy.intercept("DELETE", "**/api/handyman/portfolio/*", (req) => {
      serverProjects = [];
      req.reply({ statusCode: 204, body: {} });
    }).as("deleteBeforeAfter");

    cy.intercept("POST", "**/api/portfolios/edit-log", {
      statusCode: 201,
      body: { success: true },
    }).as("editLog");
  };

  beforeEach(() => {
    resetServerState();
    stubApi();
    cy.visit(`/portfolios/handyman/${templateId}/edit`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "hm-cms-token");
        win.localStorage.setItem("email", ownerEmail);
      },
    });
    cy.wait("@getHandymanTemplate");
    cy.wait("@getMe");
    cy.wait("@getHandymanPortfolio");
  });

  it("loads the Before/After section (GET), creates (POST multipart), edits (PUT), deletes (DELETE)", () => {
    cy.contains(/portfolio projects\s*\(before\/after\)/i).should("be.visible");

    cy.contains(/^title$/i).parent().find("input").first().type(createTitle);
    cy.contains(/subtitle/i).parent().find("input").first().type(subtitle);
    cy.contains(/^category$/i).parent().find("input").first().type(category);

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

    cy.get('form[enctype="multipart/form-data"]').then(($form) => {
      $form[0].dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    cy.wait("@createBeforeAfter");
    cy.wait("@getHandymanPortfolio");

    cy.get("input")
      .filter((_, el) => el.value === createTitle)
      .should("have.length.at.least", 1);

    cy.get("input")
      .filter((_, el) => el.value === createTitle)
      .first()
      .clear()
      .type(updatedTitle);

    cy.contains("button", /^save changes$/i).scrollIntoView().click({ force: true });
    cy.wait("@saveTemplate");
    cy.wait("@updateBeforeAfter");
    cy.wait("@editLog");
    cy.wait("@getHandymanPortfolio");
    cy.location("pathname", { timeout: 10000 }).should("eq", `/portfolios/handyman/${templateId}`);

    cy.visit(`/portfolios/handyman/${templateId}/edit`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "hm-cms-token");
        win.localStorage.setItem("email", ownerEmail);
        win.confirm = () => true;
      },
    });
    cy.wait("@getHandymanTemplate");
    cy.wait("@getMe");
    cy.wait("@getHandymanPortfolio");
    cy.get("input")
      .filter((_, el) => el.value === updatedTitle)
      .should("have.length.at.least", 1);

    cy.contains("button", /^delete$/i).click();
    cy.wait("@deleteBeforeAfter");
    cy.wait("@getHandymanPortfolio");
    cy.contains("No projects yet.").should("be.visible");
  });
});