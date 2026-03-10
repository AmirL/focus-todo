/// <reference types="cypress" />

describe("Timer", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/start-timer").as("startTimer");
    cy.intercept("POST", "/api/stop-timer").as("stopTimer");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    // Stop any running timer before cleanup
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
      // Wait for the real task (with server ID) to appear in the DOM
      cy.get(`[data-testid="task-${taskId}"]`, { timeout: 15000 }).should(
        "be.visible",
      );
      return cy.wrap(taskId);
    });
  }

  it("should start a timer, see timer bar, stop timer, and see time spent badge", () => {
    const taskName = `Timer test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Click the start timer button scoped to the created task
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");

      // Timer bar should appear at the bottom
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="timer-bar"]').should("contain.text", taskName);

      // Timer bar should show running state with stop button
      cy.get('[data-cy="timer-stop-button"]').should("be.visible");

      // Stop the timer via the bar stop button
      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // After stopping, the time spent badge should appear on the task
      cy.get('[data-cy="time-spent-badge"]', { timeout: 10000 }).should(
        "be.visible",
      );
    });
  });

  it("should toggle timer on and off via the task button", () => {
    const taskName = `Toggle test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start timer via task button
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      // Stop timer via task button (not the bar stop button)
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@stopTimer");

      // Time spent badge should appear
      cy.get('[data-cy="time-spent-badge"]', { timeout: 10000 }).should(
        "be.visible",
      );
    });
  });
});
