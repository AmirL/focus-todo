import { defineConfig } from "cypress";
import cypressSplit from "cypress-split";
import * as fs from "fs";
import * as path from "path";

const coverageEnabled = process.env.CYPRESS_COVERAGE === "true";

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
      ...(coverageEnabled && {
        codeCoverage: {
          url: "/api/coverage-data",
        },
      }),
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
      if (coverageEnabled) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@cypress/code-coverage/task")(on, config);
      }
      // Track flaky tests (passed after retry) for CI labeling.
      // Mochawesome doesn't record retry attempts, so we use after:spec
      // which has access to the full Cypress test results including attempts.
      const flakyResultsPath = path.join("cypress", "results", "flaky-from-retries.json");
      on("after:spec", (_spec, results) => {
        const flakyTests = (results.tests || [])
          .filter((test) => {
            if (test.attempts.length <= 1) return false;
            const lastAttempt = test.attempts[test.attempts.length - 1];
            const finalPassed = lastAttempt.state === "passed";
            const hadFailure = test.attempts.some(
              (a) => a.state === "failed",
            );
            return finalPassed && hadFailure;
          })
          .map((test) => test.title.join(" "));

        if (flakyTests.length > 0) {
          let existing: string[] = [];
          try {
            existing = JSON.parse(fs.readFileSync(flakyResultsPath, "utf8"));
          } catch {
            // File doesn't exist yet
          }
          existing.push(...flakyTests);
          fs.mkdirSync(path.dirname(flakyResultsPath), { recursive: true });
          fs.writeFileSync(flakyResultsPath, JSON.stringify(existing));
        }
      });

      cypressSplit(on, config);
      return config;
    },
  },
});
