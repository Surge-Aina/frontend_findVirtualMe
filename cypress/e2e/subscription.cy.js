import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

describe('signUp and subscription flow', () => {

  beforeEach(() => {
    // Clear local storage before tests to ensure a clean state
    cy.clearLocalStorage();
    //visit home page
    cy.visit('/');
  });

  it('creates a new user', () => {
    cy.contains('Log in / Sign Up', {matchCase: false}).click();
    cy.get('button').contains('Sign Up').click();
    cy.url().should('include', '/onboarding');

    //onboarding flow
    //check that title card is visible and click the "find a job" goal card
    //--goal--
    cy.contains('h1', "What's your main goal?").should('be.visible');
    cy.get('[data-cy="goal-card-find-job"]').click();
    //--industry--
    cy.contains('h1', "What type of work do you do?").should('be.visible');
    cy.get('[data-cy="industry-tech"]').click();
    //--experience--
    cy.contains('h1', "Experience").should('be.visible');
    cy.contains('Student / Entry Level').click();
    //--skills--
    cy.contains('h1', "What are your skills?").should('be.visible');
    cy.get('[data-cy="skill-javascript"]').click();
    cy.get('[data-cy="skills-continue"]').click();
    //--profile--
    cy.contains('h1', "Tell us about yourself").should('be.visible');
    cy.get('#firstName').type("E2E User");
    cy.get('#lastName').type("Test");
    cy.get('#email').type(`e2e_user_${Date.now()}@example.com`);
    cy.get('#password').type("Password123!");
    cy.get('#username').type(`e2euser_${Date.now()}`);
    cy.get('#phone').type("1234567890");
    cy.get('#location').type("New York, NY");
    cy.get('button[type="submit"]').click();

    //wait for onboarding to complete and dashboard to load, then check that user is taken to profile page
    cy.contains('h1', "Welcome to FindVirtual.me!").should('be.visible');
    cy.wait(5000); // wait for dashboard to load
    //check that user is taken to onboarding template selection page after signing up
    cy.url().should('include', '/onboarding_info', {timeout: 10000});
    cy.contains('h1', "Choose a Template").should('be.visible');
    cy.contains('Product Manager').click();

    //user taken to product Manager template page
    cy.url().should('include', '/ProjectManager');

    //take user to profile page
    cy.wait(2000);
    cy.contains('profile', {matchCase: false}).click();
    cy.url().should('include', '/profile');

    //take users to billing page
    cy.contains('Billing').click();
    cy.url().should('include', '/profile?tab=Billing');
  })

  it('handles subscription flow', () => {
  })
})