/// <reference types="cypress" />

describe("Task Categories", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Filter by Category", () => {
    it("should filter tasks by first category", () => {
      cy.prompt([
        "Click the first category button in the sidebar below the Filters section",
        "Verify the task list updates to show tasks",
      ]);
    });

    it("should filter tasks by second category", () => {
      cy.prompt([
        "Click the second category button in the sidebar below the Filters section",
        "Verify the task list updates to show tasks",
      ]);
    });
  });

  describe("Assign Tasks to Categories", () => {
    it("should create a task with a category", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner",
        "Type 'Categorized task' in the textarea",
        "Click the category dropdown in the form",
        "Click on the first category option",
        "Click the 'Add Task' button",
        "Verify 'Categorized task' text appears in the list",
      ]);
    });

    it("should change task category via edit", () => {
      cy.prompt([
        "Click the pencil icon button on the first task",
        "Click the category or list dropdown",
        "Click on a different category option",
        "Click the 'Save changes' button",
      ]);
    });
  });
});
