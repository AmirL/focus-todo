/// <reference types="cypress" />

describe("Quick-Add from Timeline Gap", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-completed-task").as(
      "createCompletedTask",
    );
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  /**
   * Create a completed task with a time entry via the API.
   * Returns the task ID for cleanup.
   */
  function createCompletedTaskViaApi(
    name: string,
    startedAt: string,
    endedAt: string,
    listId: number,
  ): Cypress.Chainable<number> {
    return cy
      .request({
        method: "POST",
        url: "/api/create-completed-task",
        body: {
          task: { name, listId },
          startedAt,
          endedAt,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        const taskId = response.body.task.id as number;
        createdTaskIds.push(taskId);
        return cy.wrap(taskId);
      });
  }

  /**
   * Build ISO timestamps for today at the given hour:minute.
   */
  function todayAt(hour: number, minute: number): string {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  it("should open dialog when clicking a timeline gap and create a completed task", () => {
    // Create two completed tasks with a 1-hour gap between them:
    //   Task A: 09:00 - 10:00
    //   Gap:    10:00 - 11:00
    //   Task B: 11:00 - 12:00
    createCompletedTaskViaApi(
      `Gap test A ${Date.now()}`,
      todayAt(9, 0),
      todayAt(10, 0),
      1,
    );
    createCompletedTaskViaApi(
      `Gap test B ${Date.now()}`,
      todayAt(11, 0),
      todayAt(12, 0),
      1,
    );

    // Navigate to Today filter to see the timeline
    cy.get('[data-cy="filter-today"]').click();

    // Timeline should appear with blocks and a gap
    cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="timeline-gap"]', { timeout: 10000 }).should(
      "have.length.at.least",
      1,
    );

    // Click the gap
    cy.get('[data-cy="timeline-gap"]').first().click();

    // Dialog should open
    cy.get('[data-cy="quick-add-gap-dialog"]', { timeout: 5000 }).should(
      "be.visible",
    );

    // Start and end time inputs should be pre-filled
    cy.get('[data-cy="gap-start-time"]').should("not.have.value", "");
    cy.get('[data-cy="gap-end-time"]').should("not.have.value", "");

    // Fill in the task name
    const gapTaskName = `Logged gap task ${Date.now()}`;
    cy.get('[data-cy="gap-task-name"]').type(gapTaskName);

    // Category should auto-select the first list, so submit button should be enabled
    cy.get('[data-cy="gap-submit-button"]', { timeout: 5000 }).should(
      "not.be.disabled",
    );

    // Submit the form
    cy.get('[data-cy="gap-submit-button"]').click();

    // Wait for the API call to complete
    cy.wait("@createCompletedTask").then((interception) => {
      const taskId = interception.response!.body.task.id as number;
      createdTaskIds.push(taskId);
    });

    // Dialog should close
    cy.get('[data-cy="quick-add-gap-dialog"]').should("not.exist");

    // The new block should appear in the timeline (gap is now filled)
    cy.get('[data-cy="timeline-block"]', { timeout: 10000 }).should(
      "have.length.at.least",
      3,
    );
  });

  it("should close dialog when clicking Cancel", () => {
    // Create two tasks with a gap
    createCompletedTaskViaApi(
      `Cancel test A ${Date.now()}`,
      todayAt(9, 0),
      todayAt(10, 0),
      1,
    );
    createCompletedTaskViaApi(
      `Cancel test B ${Date.now()}`,
      todayAt(11, 0),
      todayAt(12, 0),
      1,
    );

    cy.get('[data-cy="filter-today"]').click();

    cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="timeline-gap"]', { timeout: 10000 })
      .first()
      .click();

    // Dialog should open
    cy.get('[data-cy="quick-add-gap-dialog"]').should("be.visible");

    // Click Cancel
    cy.get('[data-cy="quick-add-gap-dialog"]')
      .contains("button", "Cancel")
      .click();

    // Dialog should close
    cy.get('[data-cy="quick-add-gap-dialog"]').should("not.exist");
  });

  it("should disable submit button when task name is empty", () => {
    createCompletedTaskViaApi(
      `Disabled test A ${Date.now()}`,
      todayAt(9, 0),
      todayAt(10, 0),
      1,
    );
    createCompletedTaskViaApi(
      `Disabled test B ${Date.now()}`,
      todayAt(11, 0),
      todayAt(12, 0),
      1,
    );

    cy.get('[data-cy="filter-today"]').click();

    cy.get('[data-cy="today-timeline"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="timeline-gap"]', { timeout: 10000 })
      .first()
      .click();

    cy.get('[data-cy="quick-add-gap-dialog"]').should("be.visible");

    // Submit should be disabled when name is empty
    cy.get('[data-cy="gap-submit-button"]').should("be.disabled");

    // Type a name - submit should become enabled
    cy.get('[data-cy="gap-task-name"]').type("Test task");
    cy.get('[data-cy="gap-submit-button"]', { timeout: 5000 }).should(
      "not.be.disabled",
    );
  });
});
