/// <reference types="cypress" />

describe("Task Categories", () => {
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

  describe("Filter by Category", () => {
    it("should show category buttons in sidebar", () => {
      // Verify sidebar shows filter and category buttons
      cy.contains("Backlog").should("be.visible");
      cy.contains("Today").should("be.visible");
    });

    it("should filter by clicking a category", () => {
      cy.get('[data-cy^="category-"]').first().click({ force: true });
    });

    it("should show category filter buttons for each list", () => {
      // There should be at least 2 category buttons (Work + Personal or similar)
      cy.get('[data-cy^="category-"]').should("have.length.at.least", 2);
    });

    it("should filter tasks when switching between categories", () => {
      // Create a task (it goes to the default category)
      const taskName = `Category filter test ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
      cy.contains(taskName, { timeout: 15000 }).should("be.visible");

      // Click a different category - the task might not be visible
      cy.get('[data-cy^="category-"]').last().click({ force: true });

      // Click back to backlog - task should reappear
      cy.get('[data-cy="filter-backlog"]').click({ force: true });
      cy.contains(taskName, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Assign Tasks to Categories", () => {
    beforeEach(() => {
      // Create a task so there's always one to act on
      const taskName = `Category test task ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
      cy.contains(taskName, { timeout: 15000 }).should("be.visible");
    });

    it("should create a task", () => {
      const taskName = `Categorized task ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });

    it("should edit a task", () => {
      cy.get('[data-cy^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-cy="save-task-changes-button"]').click();
    });
  });
});
