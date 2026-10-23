/// <reference types="cypress" />

describe("Payment pages", () => {
  it("shows plan options on /payment", () => {
    cy.visit("/payment");
    cy.contains(/choose your plan/i, { timeout: 15000 }).should("be.visible");
    cy.contains(/free/i).should("exist");
  });

  it("shows loading on /success without session", () => {
    cy.visit("/success");
    cy.contains(/loading payment details/i, { timeout: 15000 }).should("be.visible");
  });
});
