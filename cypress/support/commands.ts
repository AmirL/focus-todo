/// <reference types="cypress" />

// ***********************************************
// Custom commands for Focus Todo E2E tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Wait for the app to fully load
       */
      waitForAppLoad(): Chainable<void>;

      /**
       * Get element by data-testid attribute
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Navigate to a specific filter view
       */
      navigateToFilter(
        filter: "backlog" | "selected" | "today" | "tomorrow" | "future"
      ): Chainable<void>;
    }
  }
}

// Override cy.visit to add Vercel protection bypass
const originalVisit = Cypress.Commands._commands.visit;
Cypress.Commands.overwrite(
  "visit",
  (originalFn, url: string, options?: Partial<Cypress.VisitOptions>) => {
    const bypassToken = Cypress.env("VERCEL_BYPASS");
    if (bypassToken && typeof url === "string") {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}x-vercel-protection-bypass=${bypassToken}`;
    }
    return originalFn(url, options);
  }
);

// Wait for the application to fully load
Cypress.Commands.add("waitForAppLoad", () => {
  // Wait for the main layout to be visible
  cy.get("body", { timeout: 15000 }).should("be.visible");
  // Wait for any loading states to complete
  cy.get('[data-loading="true"]', { timeout: 10000 }).should("not.exist");
});

// Get element by data-testid
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Navigate to a specific filter view
Cypress.Commands.add("navigateToFilter", (filter) => {
  const filterMap: Record<string, string> = {
    backlog: "Backlog",
    selected: "Selected",
    today: "Today",
    tomorrow: "Tomorrow",
    future: "Future",
  };

  cy.contains("button", filterMap[filter]).click();
});

export {};
