/// <reference types="cypress" />

describe("Handyman save flows", () => {
  const templateId = "hm-save-flows-1";
  const ownerId = "owner-123";

  const template = {
    _id: templateId,
    userId: ownerId,
    hero: { title: "Save Flows", subtitle: "Demo", phoneNumber: "(111) 111-1111" },
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

  const projects = [
    {
      _id: "p1",
      title: "Project One",
      subtitle: "Sub One",
      category: "Plumbing",
      beforeImageUrl: "https://via.placeholder.com/300x200?text=Before1",
      afterImageUrl: "https://via.placeholder.com/300x200?text=After1",
    },
    {
      _id: "p2",
      title: "Project Two",
      subtitle: "Sub Two",
      category: "Electrical",
      beforeImageUrl: "https://via.placeholder.com/300x200?text=Before2",
      afterImageUrl: "https://via.placeholder.com/300x200?text=After2",
    },
  ];

  function stubBaseRequests() {
    cy.intercept("GET", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: template,
    }).as("getTemplate");

    cy.intercept("GET", "**/api/users/me", {
      statusCode: 200,
      body: {
        user: { _id: ownerId, id: ownerId, email: "owner@test.com", name: "Owner" },
        id: ownerId,
        email: "owner@test.com",
        name: "Owner",
      },
    }).as("getMe");

    cy.intercept("GET", "**/api/handyman/portfolio*", {
      statusCode: 200,
      body: projects,
    }).as("getProjects");
  }

  function visitEditor() {
    cy.visit(`/portfolios/handyman/${templateId}/edit`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token-owner");
      },
    });

    cy.wait("@getTemplate");
    cy.wait("@getProjects");
    cy.wait("@getMe", { timeout: 8000 });
  }

  function editFirstProjectTitle(value) {
    cy.contains(/replace/i).first().closest("div.border.rounded.p-3").as("projectCard1");
    cy.get("@projectCard1").within(() => {
      cy.contains(/^title$/i).parent().find("input").clear().type(value);
    });
  }

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("updates only modified projects during save", () => {
    stubBaseRequests();

    cy.intercept("PUT", `**/api/handyman-template/${templateId}`, {
      statusCode: 200,
      body: { ok: true },
    }).as("putTemplate");

    cy.intercept("PUT", "**/api/handyman/portfolio/*", (req) => {
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as("putAnyProject");

    visitEditor();
    editFirstProjectTitle("Project One UPDATED");
    cy.contains("button", "Save Changes").scrollIntoView().click({ force: true });

    cy.wait("@putTemplate");
    cy.wait("@putAnyProject");

    cy.get("@putAnyProject.all").then((calls) => {
      const urls = (calls || []).map((call) => call.request.url);
      expect(urls.some((url) => url.includes("/api/handyman/portfolio/p1"))).to.eq(true);
      expect(urls.some((url) => url.includes("/api/handyman/portfolio/p2"))).to.eq(false);
    });

    cy.contains(/all changes saved/i).should("be.visible");
  });

  it("keeps edits after a failed save and succeeds on retry", () => {
    stubBaseRequests();

    let templatePutCount = 0;
    cy.intercept("PUT", `**/api/handyman-template/${templateId}`, (req) => {
      templatePutCount += 1;
      if (templatePutCount === 1) {
        req.reply({ statusCode: 500, body: { message: "Template save failed" } });
      } else {
        req.reply({ statusCode: 200, body: { ok: true } });
      }
    }).as("putTemplateMaybeFail");

    cy.intercept("PUT", "**/api/handyman/portfolio/*", {
      statusCode: 200,
      body: { ok: true },
    }).as("putProject");

    visitEditor();
    editFirstProjectTitle("Project One UPDATED");
    cy.get("@projectCard1").within(() => {
      cy.contains(/^title$/i).parent().find("input").should("have.value", "Project One UPDATED");
    });

    cy.contains("button", "Save Changes").scrollIntoView().click({ force: true });
    cy.wait("@putTemplateMaybeFail");
    cy.contains(/failed to save changes|template save failed/i).should("be.visible");

    cy.get("@projectCard1").within(() => {
      cy.contains(/^title$/i).parent().find("input").should("have.value", "Project One UPDATED");
    });

    cy.contains("button", "Save Changes").scrollIntoView().click({ force: true });
    cy.wait("@putTemplateMaybeFail");
    cy.wait("@putProject");
    cy.contains("All changes saved!").should("be.visible");
  });
});
