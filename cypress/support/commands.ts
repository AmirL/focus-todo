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

// Login command - uses API and session caching
Cypress.Commands.add("login", () => {
  const email = Cypress.env("TEST_EMAIL");
  const password = Cypress.env("TEST_PASSWORD");

  cy.session(
    [email],
    () => {
      // Login via Better Auth API
      cy.request({
        method: "POST",
        url: "/api/auth/sign-in/email",
        body: {
          email,
          password,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    },
    {
      validate: () => {
        // Validate session by checking the session endpoint
        cy.request({
          url: "/api/auth/get-session",
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("user");
        });
      },
    }
  );
});

export {};
