const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    env: {
      // 👇 keep this in sync with your .env/.env.local
      backendUrl: process.env.VITE_BACKEND_API || "http://localhost:5001",
    },
  },
});
