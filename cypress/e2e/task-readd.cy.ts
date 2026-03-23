/// <reference types="cypress" />

describe("Re-add Task", () => {
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

  function createTaskAndGetId(name: string): Cypress.Chainable<number> {
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

  it("should open re-add dialog and mark original task as completed", () => {
    const taskName = `Re-add test ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Hover to reveal action buttons and click re-add
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="readd-task-${taskId}"]`).click({ force: true });

      // Re-add dialog should open
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");
      cy.contains("Re-add Task").should("be.visible");

      // The form should be pre-filled with the original task name
      cy.get('[data-cy="task-name-input"]').should("have.value", taskName);

      // The original task should be marked as completed via API
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.completedAt).to.not.be.null;
      });
    });
  });

  it("should re-add a task with modified name", () => {
    const originalName = `Original task ${Date.now()}`;
    const newName = `Re-added task ${Date.now()}`;

    createTaskAndGetId(originalName).then((taskId) => {
      // Open re-add dialog
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="readd-task-${taskId}"]`).click({ force: true });
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");

      // Wait for the update that marks original as completed
      cy.wait("@updateTask");

      // Modify the name
      cy.get('[data-cy="task-name-input"]').clear().type(newName);

      // Click Re-add button
      cy.contains("button", "Re-add").click();

      // Wait for the new task to be created
      cy.wait("@createTask").then((interception) => {
        const newTaskId = interception.response!.body.id as number;
        createdTaskIds.push(newTaskId);
        expect(interception.request.body.task.name).to.equal(newName);
      });

      // Dialog should close
      cy.get('[role="dialog"]').should("not.exist");
    });
  });

  it("should cancel re-add dialog without creating a new task", () => {
    const taskName = `Cancel re-add ${Date.now()}`;
    createTaskAndGetId(taskName).then((taskId) => {
      // Open re-add dialog
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="readd-task-${taskId}"]`).click({ force: true });
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");

      // Wait for the original to be marked completed
      cy.wait("@updateTask");

      // Cancel
      cy.contains("button", "Cancel").click();
      cy.get('[role="dialog"]').should("not.exist");
    });
  });
});
