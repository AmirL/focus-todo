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

      /**
       * Permanently delete a task via API (for test cleanup)
       */
      apiCleanupTask(taskId: number): Chainable<void>;

      /**
       * Permanently delete a goal via API (for test cleanup)
       */
      apiCleanupGoal(goalId: number): Chainable<void>;

      /**
       * Permanently delete multiple tasks via API (for test cleanup)
       */
      apiCleanupTasks(taskIds: number[]): Chainable<void>;

      /**
       * Permanently delete multiple goals via API (for test cleanup)
       */
      apiCleanupGoals(goalIds: number[]): Chainable<void>;
    }
  }
}

// Wait for the application to fully load (authenticated and sidebar rendered)
Cypress.Commands.add("waitForAppLoad", () => {
  // Wait for the sidebar filter buttons to appear, which confirms:
  // 1. The page has loaded
  // 2. Authentication session has been restored
  // 3. The main layout with sidebar is rendered
  cy.get('[data-cy="filter-backlog"]', { timeout: 30000 }).should("be.visible");
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

  cy.log(`Attempting login with email: ${email}`);

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
        cy.log(`Sign-in response status: ${response.status}`);
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("user");
      });
    },
  );
});

// Cleanup commands for E2E test data management
const getAuthHeaders = () => ({
  "X-API-Key": Cypress.env("API_TEST_KEY"),
});

Cypress.Commands.add("apiCleanupTask", (taskId: number) => {
  cy.request({
    method: "DELETE",
    url: `/api/tasks/${taskId}?permanent=true`,
    headers: getAuthHeaders(),
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("apiCleanupGoal", (goalId: number) => {
  cy.request({
    method: "DELETE",
    url: `/api/goals/${goalId}?permanent=true`,
    headers: getAuthHeaders(),
    failOnStatusCode: false,
  });
});

Cypress.Commands.add("apiCleanupTasks", (taskIds: number[]) => {
  taskIds.forEach((taskId) => {
    cy.apiCleanupTask(taskId);
  });
});

Cypress.Commands.add("apiCleanupGoals", (goalIds: number[]) => {
  goalIds.forEach((goalId) => {
    cy.apiCleanupGoal(goalId);
  });
});

export {};
