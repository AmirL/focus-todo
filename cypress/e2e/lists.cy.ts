/// <reference types="cypress" />

describe("Task Categories", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Filter by Category", () => {
    it("should filter tasks by first category", () => {
      cy.prompt([
        "Click the first category button in the sidebar (below the Filters section)",
        "Verify the task list updates to show filtered tasks",
      ]);
    });

    it("should filter tasks by second category", () => {
      cy.prompt([
        "Click the second category button in the sidebar (below the Filters section)",
        "Verify the task list updates to show filtered tasks",
      ]);
    });
  });

  describe("Assign Tasks to Categories", () => {
    it("should create a task with a category", () => {
      cy.prompt([
        "Click the plus button to add a new task",
        "Type 'Categorized task' in the task input",
        "Click the category/list dropdown and select the first option",
        "Click 'Add Task' button",
        "Verify the task appears in the list",
      ]);
    });

    it("should change task category via edit", () => {
      cy.prompt([
        "Click the pencil icon on the first task to edit it",
        "Click the category/list dropdown and select a different option",
        "Click 'Save changes' button",
      ]);
    });
  });
});
