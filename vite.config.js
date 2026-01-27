import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

   server: {
    host: true,        // allows access from local network / custom hosts
    port: 5173,
    strictPort: true,
    fs: {
      allow: ["."],    // allow serving files from project root
    },
    allowedHosts: [
      "mytestdomain.local",
    ],
  },

  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.js"],
    globals: true,
    css: true,
    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
  },
});
