/// <reference types="cypress" />

describe("AI portfolio creator", () => {
  it("requires login when no token", () => {
    cy.visit("/portfolios/create/ai", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("token");
      },
    });
    cy.get("textarea", { timeout: 15000 }).type("A test portfolio for a designer.");
    cy.contains("button", /create portfolio/i).click();
    cy.url({ timeout: 10000 }).should("include", "/login");
  });
});
