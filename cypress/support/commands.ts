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

      /**
       * Login to the application
       */
      login(): Chainable<void>;
    }
  }
}

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

// Login command - uses session to preserve login state across tests
Cypress.Commands.add("login", () => {
  cy.session(
    "user-session",
    () => {
      cy.visit("/");
      // Use cy.prompt to handle login flow
      cy.prompt([
        "Look for a login or sign in button and click it",
        "Enter test credentials or use social login if available",
        "Complete the authentication flow",
        "Verify that you are logged in by checking for user profile or dashboard",
      ]);
    },
    {
      validate: () => {
        // Validate session is still valid
        cy.visit("/");
        cy.get("body").should("be.visible");
      },
    }
  );
});

export {};
