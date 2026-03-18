// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands";

// Only load code coverage support when CYPRESS_COVERAGE=true (local coverage runs).
// In CI, coverage is not needed and produces nyc warnings about missing instrumentation.
if (Cypress.env("COVERAGE")) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@cypress/code-coverage/support");
}

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

// Clean up stale test data at the start of each test run.
// This is a safety net for tests that fail mid-execution or don't clean up properly.
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

before(() => {
  const apiKey = Cypress.env("API_TEST_KEY");
  if (!apiKey) return;

  const authHeaders = { "X-API-Key": apiKey };
  const cutoff = new Date(Date.now() - TWO_HOURS_MS).toISOString();

  // Clean up stale tasks (older than 2 hours)
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

  // Clean up all goals (test account should be empty between runs)
  cy.request({
    method: "GET",
    url: "/api/goals?includeDeleted=true",
    headers: authHeaders,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) return;
    const goals = response.body.goals || [];
    goals.forEach((goal: { id: number }) => {
      cy.request({
        method: "DELETE",
        url: `/api/goals/${goal.id}?permanent=true`,
        headers: authHeaders,
        failOnStatusCode: false,
      });
    });
  });

  // Clean up non-default lists older than 2 hours
  cy.request({
    method: "GET",
    url: "/api/lists?includeArchived=true",
    headers: authHeaders,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) return;
    const lists = response.body.lists || [];
    const defaultList = lists.find((l: { isDefault: boolean }) => l.isDefault);
    if (!defaultList) return;

    lists.forEach((list: { id: number; isDefault: boolean; createdAt: string }) => {
      if (!list.isDefault && list.createdAt && list.createdAt < cutoff) {
        cy.request({
          method: "DELETE",
          url: `/api/lists/${list.id}?reassignTo=${defaultList.id}`,
          headers: authHeaders,
          failOnStatusCode: false,
        });
      }
    });
  });
});
