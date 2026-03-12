import { defineConfig } from "cypress";
import cypressSplit from "cypress-split";

// E2E flaky test investigation
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    screenshotOnRunFailure: true,
    env: {
      codeCoverage: {
        url: "/api/coverage-data",
      },
    },
    experimentalStudio: true,
    experimentalPromptCommand: true,
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      overwrite: false,
      html: false,
      json: true,
    },
    setupNodeEvents(on, config) {
      cypressSplit(on, config);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@cypress/code-coverage/task")(on, config);
      return config;
    },
  },
});
