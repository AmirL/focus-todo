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
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(name);
    cy.get('[data-cy="save-task-button"]').click();
    return cy.wait("@createTask").then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);
      // Wait for the real task (with server ID) to appear in the DOM
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 15000 }).should(
        "be.visible",
      );
      return cy.wrap(taskId);
    });
  }

  it("should start a timer, see timer bar, stop timer, and see time spent badge", () => {
    const taskName = `Timer test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Click the start timer button scoped to the created task
      cy.get(`[data-cy="task-${taskId}"]`)
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

  it("should keep timer bar visible after stopping so user can edit end time", () => {
    const taskName = `Edit test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start timer
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      // Stop timer via bar
      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Bar should still be visible after stopping (with editable end time)
      cy.get('[data-cy="timer-bar"]').should("be.visible");
      cy.get('[data-cy="timer-end-input"]').should("be.visible");

      // Start time input should also be editable
      cy.get('[data-cy="timer-start-input"]').should("be.visible");

      // Dismiss the bar manually
      cy.get('[data-cy="timer-dismiss-button"]').click();
      cy.get('[data-cy="timer-bar"]').should("not.exist");
    });
  });

  it("should update duration when editing start/end times", () => {
    cy.intercept("POST", "/api/update-time-entry").as("updateEntry");
    const taskName = `Time edit test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start and stop timer to get editable time inputs
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Both time inputs should be visible
      cy.get('[data-cy="timer-start-input"]').should("be.visible");
      cy.get('[data-cy="timer-end-input"]').should("be.visible");

      // Edit end time to 1 hour later and verify the API call succeeds.
      // We edit end time (not start time) to avoid midnight rollover issues
      // where subtracting 1 hour from hour 0 wraps to hour 23 on the same day.
      cy.get('[data-cy="timer-end-input"]').then(($input) => {
        const currentValue = $input.val() as string;
        const [h, m] = currentValue.split(":").map(Number);
        const newHour = String((h + 1) % 24).padStart(2, "0");
        const newTime = `${newHour}:${String(m).padStart(2, "0")}`;

        cy.get('[data-cy="timer-end-input"]').clear().type(newTime).blur();
        cy.wait("@updateEntry").then((interception) => {
          expect(interception.response!.statusCode).to.equal(200);
        });

        // Duration should update (should show ~60m or 1h since we moved end 1 hour later)
        cy.get('[data-cy="timer-duration"]').should("contain.text", "1h");
      });
    });
  });

  it("should show save confirmation after editing time", () => {
    cy.intercept("POST", "/api/update-time-entry").as("updateEntry");
    const taskName = `Save confirm test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start and stop timer to get editable time inputs
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Edit end time and blur to trigger save (using end time to avoid midnight rollover)
      cy.get('[data-cy="timer-end-input"]').then(($input) => {
        const currentValue = $input.val() as string;
        const [h, m] = currentValue.split(":").map(Number);
        const newHour = String((h + 1) % 24).padStart(2, "0");
        const newTime = `${newHour}:${String(m).padStart(2, "0")}`;

        cy.get('[data-cy="timer-end-input"]').clear().type(newTime).blur();
        cy.wait("@updateEntry");

        // Save confirmation should appear
        cy.get('[data-cy="timer-save-status"]')
          .should("contain.text", "Saved")
          .should("be.visible");

        // Confirmation should fade away after ~2 seconds
        cy.get('[data-cy="timer-save-status"]', { timeout: 5000 }).should(
          "not.contain.text",
          "Saved",
        );
      });
    });
  });

  it("should start a new timer for the same task when clicking Start again", () => {
    const taskName = `Start again test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start timer
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      // Stop timer
      cy.get('[data-cy="timer-stop-button"]').click();
      cy.wait("@stopTimer");

      // Timer bar should show stopped state with Start again button
      cy.get('[data-cy="timer-bar"]').should("be.visible");
      cy.get('[data-cy="timer-start-again-button"]').should("be.visible");

      // Click Start again
      cy.get('[data-cy="timer-start-again-button"]').click();
      cy.wait("@startTimer");

      // Timer bar should now be in running state again with the same task
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="timer-bar"]').should("contain.text", taskName);
      cy.get('[data-cy="timer-stop-button"]').should("be.visible");
      cy.get('[data-cy="timer-start-again-button"]').should("not.exist");
    });
  });

  it("should toggle timer on and off via the task button", () => {
    const taskName = `Toggle test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Start timer via task button
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@startTimer");
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");

      // Stop timer via task button (not the bar stop button)
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click();
      cy.wait("@stopTimer");

      // Time spent badge should appear
      cy.get('[data-cy="time-spent-badge"]', { timeout: 10000 }).should(
        "be.visible",
      );
    });
  });

  it("should show start timer button on completed tasks", () => {
    cy.intercept("POST", "/api/update-task").as("updateTask");
    const taskName = `Done timer test ${Date.now()}`;

    // Inline task creation (avoid createTaskAndGetId's visibility assertion
    // which fails when Goals section pushes tasks below the fold)
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').should("be.visible").type(taskName);
    cy.get('[data-cy="save-task-button"]').should("be.visible").click();

    cy.wait("@createTask", { timeout: 15000 }).then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);

      // Wait for React Query to refetch tasks list after creation
      cy.wait(2000);
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 15000 }).should("exist");

      // Mark the task as done
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[role="checkbox"]')
        .click({ force: true });
      cy.wait("@updateTask");

      // The start timer button should still exist on the completed task
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .should("exist");

      // Start a timer on the completed task to prove it works
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="start-timer-button"]')
        .click({ force: true });
      cy.wait("@startTimer");

      // Timer bar should appear, proving the timer works on completed tasks
      cy.get('[data-cy="timer-bar"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="timer-bar"]').should("contain.text", taskName);
    });
  });
});
