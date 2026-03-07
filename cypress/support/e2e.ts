// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands";
import "@cypress/code-coverage/support";

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top;
if (app && !app.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}

// Catch uncaught exceptions to prevent test failures
Cypress.on("uncaught:exception", (err) => {
  // Returning false prevents Cypress from failing the test
  // We log the error for debugging purposes
  console.error("Uncaught exception:", err.message);
  return false;
});

// Login before each test
beforeEach(() => {
  cy.login();
});

// Clean up stale test tasks (older than 2 hours) at the start of each test run.
// This is a safety net for tests that fail mid-execution or don't clean up properly.
// Goals don't have a list API with API key auth, so goal cleanup relies on per-test afterEach hooks.
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

before(() => {
  const apiKey = Cypress.env("API_TEST_KEY");
  if (!apiKey) return;

  const authHeaders = { "X-API-Key": apiKey };
  const cutoff = new Date(Date.now() - TWO_HOURS_MS).toISOString();

  cy.request({
    method: "GET",
    url: "/api/tasks?includeDeleted=true&limit=500",
    headers: authHeaders,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) return;
    const tasks = response.body.tasks || [];
    tasks.forEach((task: { id: number; createdAt: string }) => {
      if (task.createdAt && task.createdAt < cutoff) {
        cy.request({
          method: "DELETE",
          url: `/api/tasks/${task.id}?permanent=true`,
          headers: authHeaders,
          failOnStatusCode: false,
        });
      }
    });
  });
});
