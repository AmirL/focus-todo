/// <reference types="cypress" />

describe("Timeline", () => {
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
      cy.get(`[data-testid="task-${taskId}"]`, { timeout: 15000 }).should(
        "be.visible",
      );
      return cy.wrap(taskId);
    });
  }

  it("should show timeline on Today page with time blocks", () => {
    const taskName = `Timeline test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start and stop a timer to create a time entry
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Dismiss the timer bar
      cy.get('[data-cy="timer-dismiss-button"]').click();

      // Navigate to Today filter
      cy.get('[data-cy="filter-today"]').click();

      // Timeline container should appear
      cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
        "be.visible",
      );

      // Timeline bar should have at least one block
      cy.get('[data-cy="timeline-block"]', { timeout: 10000 }).should(
        "have.length.at.least",
        1,
      );

      // The block should contain the task name
      cy.get('[data-cy="timeline-block"]').first().should("contain.text", taskName);
    });
  });

  it("should scroll to task when clicking a timeline block", () => {
    const taskName = `Scroll test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Create a time entry
      cy.get(`[data-testid="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Dismiss the timer bar
      cy.get('[data-cy="timer-dismiss-button"]').click();

      // Navigate to Today filter
      cy.get('[data-cy="filter-today"]').click();

      // Wait for timeline to appear
      cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
        "be.visible",
      );

      // Click the timeline block
      cy.get('[data-cy="timeline-block"]').first().click();

      // The task should get highlighted (ring class added)
      cy.get(`[data-task-id="${taskId}"]`, { timeout: 5000 }).should(
        "have.class",
        "ring-2",
      );
    });
  });

  it("should show empty state when no time entries exist", () => {
    // Navigate to Today filter without creating any time entries
    cy.get('[data-cy="filter-today"]').click();

    // Timeline should show the empty state (timeline-bar with empty message)
    cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="timeline-bar"]').should(
      "contain.text",
      "No time entries for today",
    );
  });
});
