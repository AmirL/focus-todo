// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands";

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
