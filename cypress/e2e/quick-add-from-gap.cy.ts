/// <reference types="cypress" />

describe("Quick-Add from Timeline Gap", () => {
  let createdTaskIds: number[] = [];
  let workListId: number;

  before(() => {
    // Dynamically fetch a valid listId (may differ between local and preview)
    const apiKey = Cypress.env("API_TEST_KEY");
    cy.request({
      method: "GET",
      url: "/api/lists",
      headers: { "x-api-key": apiKey },
    }).then((response) => {
      expect(response.body.lists.length).to.be.greaterThan(0);
      workListId = response.body.lists[0].id;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", "/api/create-completed-task").as(
      "createCompletedTask",
    );
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

  /**
   * Create two tasks with a 1-hour gap, then visit the page so React Query
   * fetches fresh data including the new time entries.
   */
  function setupGapAndVisit(prefix: string) {
    createCompletedTaskViaApi(
      `${prefix} A ${Date.now()}`,
      todayAt(9, 0),
      todayAt(10, 0),
      workListId,
    );
    createCompletedTaskViaApi(
      `${prefix} B ${Date.now()}`,
      todayAt(11, 0),
      todayAt(12, 0),
      workListId,
    );
    // Visit after creating tasks so React Query fetches fresh data
    cy.visit("/");
    cy.waitForAppLoad();
    cy.get('[data-cy="filter-today"]').click();
  }

  it("should open dialog when clicking a timeline gap and create a completed task", () => {
    setupGapAndVisit("Gap test");

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
    setupGapAndVisit("Cancel test");

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
    setupGapAndVisit("Disabled test");

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
