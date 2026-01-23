/// <reference types="cypress" />

describe("Task Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Tasks", () => {
    it("should create a new task using the add task button", () => {
      cy.prompt([
        "Click on the add task button or plus icon to open the task creation form",
        "Type 'Buy groceries' in the task name input field",
        "Submit the form to create the task",
        "Verify that a task named 'Buy groceries' appears in the task list",
      ]);
    });

    it("should create a task with estimated duration", () => {
      cy.prompt([
        "Open the task creation form",
        "Enter 'Prepare presentation' as the task name",
        "Set the estimated duration to 1 hour or 60 minutes",
        "Save the task",
        "Verify the task shows the duration badge",
      ]);
    });

    it("should create multiple tasks at once using newline separator", () => {
      cy.prompt([
        "Open the task creation form",
        "Enter multiple tasks separated by new lines: 'Task One', 'Task Two', 'Task Three'",
        "Submit to create all tasks",
        "Verify all three tasks appear in the list",
      ]);
    });

    it("should create a task for a specific date", () => {
      cy.prompt([
        "Open the task creation form",
        "Enter 'Schedule meeting' as the task name",
        "Select tomorrow's date in the date picker",
        "Save the task",
        "Navigate to the Tomorrow filter and verify the task appears there",
      ]);
    });
  });

  describe("Task Actions", () => {
    it("should mark a task as complete", () => {
      cy.prompt([
        "Find a task in the list",
        "Click on the checkbox to mark the task as complete",
        "Verify the task shows as completed with a strikethrough style",
      ]);
    });

    it("should star/select a task", () => {
      cy.prompt([
        "Find a task in the list",
        "Click the star button or selection button to highlight the task",
        "Verify the task is now starred or selected",
        "Navigate to the Selected filter and verify the task appears there",
      ]);
    });

    it("should delete a task", () => {
      cy.prompt([
        "Find a task in the list",
        "Click the delete button to remove the task",
        "Verify the task is removed or shows as deleted",
      ]);
    });

    it("should snooze a task to a different date", () => {
      cy.prompt([
        "Find a task in the list",
        "Click the snooze or calendar button to change the task date",
        "Select a future date from the date picker",
        "Verify the task is moved to the future date",
      ]);
    });

    it("should mark a task as a blocker", () => {
      cy.prompt([
        "Find a task in the list",
        "Click the blocker button to mark the task as blocking",
        "Verify the task shows a blocker indicator or badge",
      ]);
    });

    it("should set estimated time for a task", () => {
      cy.prompt([
        "Find a task in the list",
        "Click on the time/duration button",
        "Select 30 minutes as the estimated duration",
        "Verify the task shows the duration badge",
      ]);
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.prompt([
        "Click on a task to open the edit dialog or form",
        "Change the task name to 'Updated task name'",
        "Save the changes",
        "Verify the task now shows the new name",
      ]);
    });

    it("should edit task details", () => {
      cy.prompt([
        "Click on a task to open the edit dialog",
        "Add details or description text",
        "Save the changes",
        "Verify the task shows the details indicator",
      ]);
    });

    it("should change task list/category", () => {
      cy.prompt([
        "Click on a task to open the edit dialog",
        "Change the list category to Work or Personal",
        "Save the changes",
        "Verify the task appears under the correct category",
      ]);
    });
  });

  describe("Filter Tasks", () => {
    it("should filter tasks by Today", () => {
      cy.prompt([
        "Click on the Today filter button in the sidebar or navigation",
        "Verify only tasks scheduled for today are displayed",
        "Verify the total estimated time is shown if there are tasks",
      ]);
    });

    it("should filter tasks by Tomorrow", () => {
      cy.prompt([
        "Click on the Tomorrow filter button",
        "Verify only tasks scheduled for tomorrow are displayed",
      ]);
    });

    it("should filter tasks by Backlog", () => {
      cy.prompt([
        "Click on the Backlog filter button",
        "Verify tasks without a date are displayed",
      ]);
    });

    it("should filter tasks by Selected", () => {
      cy.prompt([
        "Click on the Selected filter button",
        "Verify only starred/selected tasks are displayed",
      ]);
    });

    it("should filter tasks by Future", () => {
      cy.prompt([
        "Click on the Future filter button",
        "Verify tasks scheduled for future dates are displayed",
      ]);
    });

    it("should filter tasks by list category", () => {
      cy.prompt([
        "Click on the Work category filter",
        "Verify only Work tasks are displayed",
        "Click on the Personal category filter",
        "Verify only Personal tasks are displayed",
      ]);
    });
  });

  describe("Task Reordering", () => {
    it("should reorder tasks via drag and drop", () => {
      cy.prompt([
        "Identify the first task in the list",
        "Drag the first task and drop it below the second task",
        "Verify the task order has changed",
      ]);
    });
  });
});
