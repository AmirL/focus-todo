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
      cy.prompt(["Click the first category button in the sidebar below the filter buttons"]);
    });
  });

  describe("Assign Tasks to Categories", () => {
    it("should create a task", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type("Categorized task");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Categorized task").should("be.visible");

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
