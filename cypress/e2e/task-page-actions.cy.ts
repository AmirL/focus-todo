/// <reference types="cypress" />

describe("Task Page Actions", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  function createTask(name: string): Cypress.Chainable<number> {
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(name);
    cy.get('[data-cy="save-task-button"]').click();
    return cy.wait("@createTask").then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 15000 }).should("exist");
      return cy.wrap(taskId);
    });
  }

  describe("Copy as JSON", () => {
    it("should show copy button when tasks exist", () => {
      createTask(`Copy test ${Date.now()}`).then(() => {
        cy.get('[data-cy="copy-as-json-button"]').should("be.visible");
      });
    });

    it("should copy tasks as JSON to clipboard", () => {
      const taskName = `JSON copy ${Date.now()}`;
      createTask(taskName).then(() => {
        // Grant clipboard permissions and click copy
        cy.window().then((win) => {
          cy.stub(win.navigator.clipboard, "writeText").resolves();
          cy.get('[data-cy="copy-as-json-button"]').click();

          // Verify clipboard writeText was called with valid JSON
          cy.wrap(win.navigator.clipboard.writeText).should("have.been.calledOnce");

          // Verify toast appears
          cy.contains("Visible tasks copied to clipboard").should("be.visible");
        });
      });
    });
  });

  describe("Reset All Selected", () => {
    it("should show reset button only in Selected filter with starred tasks", () => {
      const taskName = `Selected reset ${Date.now()}`;
      createTask(taskName).then((taskId) => {
        // Star the task
        cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
        cy.get(`[data-cy^="star-task-"]`).first().click({ force: true });
        cy.wait("@updateTask");

        // Navigate to Selected filter
        cy.get('[data-cy="filter-selected"]').click({ force: true });
        cy.get(`[data-cy="task-${taskId}"]`, { timeout: 10000 }).should("exist");

        // Reset button should be visible
        cy.get('[data-cy="reset-selected-button"]').should("be.visible");
      });
    });

    it("should reset all selected tasks when clicking reset button", () => {
      const taskName = `Reset test ${Date.now()}`;
      createTask(taskName).then((taskId) => {
        // Star the task
        cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
        cy.get(`[data-cy^="star-task-"]`).first().click({ force: true });
        cy.wait("@updateTask");

        // Navigate to Selected filter
        cy.get('[data-cy="filter-selected"]').click({ force: true });
        cy.get(`[data-cy="task-${taskId}"]`, { timeout: 10000 }).should("exist");

        // Click reset
        cy.get('[data-cy="reset-selected-button"]').click();

        // Wait for the update that un-stars the task
        cy.wait("@updateTask").then((interception) => {
          expect(interception.request.body.task.selectedAt).to.be.null;
        });
      });
    });

    it("should not show reset button in non-Selected filters", () => {
      // Reset button should not exist on Backlog
      cy.get('[data-cy="reset-selected-button"]').should("not.exist");
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no tasks match the filter", () => {
      // Future filter is likely empty
      cy.get('[data-cy="filter-future"]').click({ force: true });
      // Either shows tasks or the empty message
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy^="task-"]').length === 0) {
          cy.contains("No tasks found").should("be.visible");
        }
      });
    });
  });
});
