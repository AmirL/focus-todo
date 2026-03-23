/// <reference types="cypress" />

describe("Task Creation with Filter Defaults", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  it("should pre-fill today's date when creating from Today filter", () => {
    cy.get('[data-cy="filter-today"]').click({ force: true });
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(`Today task ${Date.now()}`);

    // The date picker should show today's date (not empty)
    cy.get('[data-cy="date-picker-button"]').should("not.contain.text", "Set Date");

    cy.get('[data-cy="save-task-button"]').click();
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
      // The task should have today's date set
      const taskDate = interception.request.body.task.date;
      expect(taskDate).to.not.be.null;
      const today = new Date().toISOString().slice(0, 10);
      expect(taskDate.slice(0, 10)).to.equal(today);
    });
  });

  it("should pre-fill tomorrow's date when creating from Tomorrow filter", () => {
    cy.get('[data-cy="filter-tomorrow"]').click({ force: true });
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(`Tomorrow task ${Date.now()}`);

    // The date picker should show tomorrow's date (not empty)
    cy.get('[data-cy="date-picker-button"]').should("not.contain.text", "Set Date");

    cy.get('[data-cy="save-task-button"]').click();
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
      const taskDate = interception.request.body.task.date;
      expect(taskDate).to.not.be.null;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(taskDate.slice(0, 10)).to.equal(tomorrow.toISOString().slice(0, 10));
    });
  });

  it("should pre-fill starred when creating from Selected filter", () => {
    cy.get('[data-cy="filter-selected"]').click({ force: true });
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(`Selected task ${Date.now()}`);

    // The starred toggle should be checked
    cy.get('[data-cy="starred-toggle"]').should("have.attr", "data-state", "on");

    cy.get('[data-cy="save-task-button"]').click();
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
      // The task should have selectedAt set
      expect(interception.request.body.task.selectedAt).to.not.be.null;
    });
  });

  it("should show success toast after creating a task", () => {
    const taskName = `Toast test ${Date.now()}`;
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(taskName);
    cy.get('[data-cy="save-task-button"]').click();

    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    // Toast should appear with the task name and Edit button
    cy.contains("Task created").should("be.visible");
    cy.contains("Edit").should("be.visible");
  });

  it("should reset form fields when dialog is reopened", () => {
    // First, create a task to populate the form
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type("Temporary name");
    // Close without saving
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");

    // Reopen and verify form is empty
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').should("have.value", "");
  });

  it("should not allow creating task with empty name", () => {
    cy.get('[data-cy="add-task-button"]').click();
    // Save button should be disabled when name is empty
    cy.get('[data-cy="save-task-button"]').should("be.disabled");
    // Type something
    cy.get('[data-cy="task-name-input"]').type("Some name");
    cy.get('[data-cy="save-task-button"]').should("not.be.disabled");
    // Clear it
    cy.get('[data-cy="task-name-input"]').clear();
    cy.get('[data-cy="save-task-button"]').should("be.disabled");
  });
});
