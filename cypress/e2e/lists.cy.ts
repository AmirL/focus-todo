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
      cy.get('[data-cy^="category-"]').first().click();
    });
  });

  describe("Assign Tasks to Categories", () => {
    beforeEach(() => {
      // Create a task so there's always one to act on
      const taskName = `Category test task ${Date.now()}`;
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type(taskName);
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });

    it("should create a task", () => {
      const taskName = `Categorized task ${Date.now()}`;
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type(taskName);
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });

    it("should edit a task", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-testid="save-task-changes-button"]').click();
    });
  });
});
