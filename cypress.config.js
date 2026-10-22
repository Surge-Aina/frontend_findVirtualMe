const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    env: {
      // CI sets this to a closed local port. Specs stub the network with cy.intercept.
      backendUrl: process.env.VITE_BACKEND_API || "http://127.0.0.1:4010",
    },
  },
});
