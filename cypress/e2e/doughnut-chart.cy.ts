/// <reference types="cypress" />

describe("Doughnut Chart", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/start-timer").as("startTimer");
    cy.intercept("POST", "/api/stop-timer").as("stopTimer");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.request({
      method: "POST",
      url: "/api/stop-timer",
      failOnStatusCode: false,
    });
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  function createTaskAndGetId(name: string): Cypress.Chainable<number> {
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(name);
    cy.get('[data-testid="save-task-button"]').click();
    return cy.wait("@createTask").then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);
      cy.get(`[data-testid="task-${taskId}"]`, { timeout: 15000 }).should(
        "be.visible",
      );
      return cy.wrap(taskId);
    });
  }

  it("shows doughnut chart on Today page after tracking time", () => {
    cy.get('[data-cy="filter-today"]').click();

    const taskName = `Chart test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start and stop timer to create time entry
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");
      cy.get('[data-cy="timer-dismiss-button"]').click();

      // Doughnut chart should appear
      cy.get('[data-cy="doughnut-chart"]', { timeout: 10000 }).should(
        "be.visible",
      );

      // Legend should be visible with at least one entry
      cy.get('[data-cy="doughnut-chart-legend"]').should("be.visible");
    });
  });

  it("shows empty state when no time entries on Today page", () => {
    cy.get('[data-cy="filter-today"]').click();

    cy.get('[data-cy="doughnut-chart-empty"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="doughnut-chart-empty"]').should(
      "contain.text",
      "No tracked time to display",
    );
  });

  it("shows doughnut chart on Calendar day page", () => {
    cy.get('[data-cy="filter-today"]').click();

    const taskName = `Calendar chart ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Create a time entry
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");
      cy.get('[data-cy="timer-dismiss-button"]').click();

      // Navigate to calendar page
      cy.visit("/calendar");
      cy.get('[data-cy="calendar-day-page"]', { timeout: 15000 }).should(
        "be.visible",
      );

      // Doughnut chart should show on calendar page
      cy.get('[data-cy="doughnut-chart"]', { timeout: 10000 }).should(
        "be.visible",
      );
      cy.get('[data-cy="doughnut-chart-legend"]').should("be.visible");
    });
  });
});
