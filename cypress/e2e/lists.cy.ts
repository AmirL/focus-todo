/// <reference types="cypress" />

describe("Task Categories", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Filter by Category", () => {
    it("should filter tasks by Work category", () => {
      cy.prompt([
        "Click the 'Work' button in the sidebar categories",
        "Verify the task list updates to show Work tasks",
      ]);
    });

    it("should filter tasks by Personal category", () => {
      cy.prompt([
        "Click the 'Personal' button in the sidebar categories",
        "Verify the task list updates to show Personal tasks",
      ]);
    });
  });

  describe("Assign Tasks to Categories", () => {
    it("should create a task with Work category", () => {
      cy.prompt([
        "Click the plus button to add a new task",
        "Type 'Work task' in the task input",
        "Click the category dropdown and select 'Work'",
        "Click 'Add Task' button",
        "Verify the task appears in the list",
      ]);
    });

    it("should change task category via edit", () => {
      cy.prompt([
        "Click the pencil icon on the first task to edit it",
        "Click the category dropdown and select 'Personal'",
        "Click 'Save changes' button",
      ]);
    });
  });
});
