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

  // Clean up stale tasks (older than 2 hours).
  // Parallel safety: only deletes tasks older than 2 hours, so active test data
  // from concurrent CI runs (which is minutes old) is never touched.
  cy.request({
    method: "GET",
    url: "/api/tasks?includeDeleted=true&limit=500",
    headers: authHeaders,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) return;
    const tasks = response.body.tasks || [];
    const staleTasks = tasks.filter(
      (task: { createdAt: string }) => task.createdAt && task.createdAt < cutoff,
    );
    if (staleTasks.length > 0) {
      cy.task("log", `[cleanup] Deleting ${staleTasks.length} stale tasks (of ${tasks.length} total)`);
    }
    staleTasks.forEach((task: { id: number }) => {
      cy.request({
        method: "DELETE",
        url: `/api/tasks/${task.id}?permanent=true`,
        headers: authHeaders,
        failOnStatusCode: false,
      });
    });
  });

  // Clean up stale goals (older than 2 hours).
  // Parallel safety: same 2-hour threshold as tasks and lists. Goals created by
  // an active concurrent run are minutes old and won't be deleted.
  cy.request({
    method: "GET",
    url: "/api/goals?includeDeleted=true",
    headers: authHeaders,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) return;
    const goals = response.body.goals || [];
    const staleGoals = goals.filter(
      (goal: { createdAt: string }) => goal.createdAt && goal.createdAt < cutoff,
    );
    if (staleGoals.length > 0) {
      cy.task("log", `[cleanup] Deleting ${staleGoals.length} stale goals (of ${goals.length} total)`);
    }
    staleGoals.forEach((goal: { id: number }) => {
      cy.request({
        method: "DELETE",
        url: `/api/goals/${goal.id}?permanent=true`,
        headers: authHeaders,
        failOnStatusCode: false,
      });
    });
  });

  // Clean up non-default lists older than 2 hours.
  // Parallel safety: same 2-hour threshold as tasks. Lists created by an active
  // concurrent run are minutes old and won't be deleted. Items from deleted lists
  // are reassigned to the default list so no data is lost.
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

    const staleLists = lists.filter(
      (list: { isDefault: boolean; createdAt: string }) =>
        !list.isDefault && list.createdAt && list.createdAt < cutoff,
    );
    if (staleLists.length > 0) {
      cy.task("log", `[cleanup] Deleting ${staleLists.length} stale lists (of ${lists.length} total)`);
    }
    staleLists.forEach((list: { id: number }) => {
      cy.request({
        method: "DELETE",
        url: `/api/lists/${list.id}?reassignTo=${defaultList.id}`,
        headers: authHeaders,
        failOnStatusCode: false,
      });
    });
  });
});
