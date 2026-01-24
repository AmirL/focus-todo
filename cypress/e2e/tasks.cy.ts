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
        "Click the checkbox on the first task item in the task list",
        "Verify the task text has a strikethrough style",
      ]);
    });

    it("should star/select a task", () => {
      cy.prompt([
        "Click the star icon button on the first task item",
        "Verify the star icon is now yellow or filled",
        "Click the 'Selected' button in the sidebar",
        "Verify the starred task appears in the list",
      ]);
    });

    it("should delete a task", () => {
      cy.prompt([
        "Click the trash icon button on the first task item",
        "Verify the task shows with reduced opacity or strikethrough",
      ]);
    });

    it("should snooze a task to a different date", () => {
      cy.prompt([
        "Click the clock icon button on the first task item to open the snooze popover",
        "Click on a date in the calendar that appears",
        "Verify the task now shows a date badge",
      ]);
    });

    it("should mark a task as a blocker", () => {
      cy.prompt([
        "Click the users icon button on the first task item",
        "Verify the users icon is now blue or highlighted",
      ]);
    });

    it("should set estimated time for a task", () => {
      cy.prompt([
        "Click the 'Set time' button or time badge on the first task item",
        "Click '30 minutes' from the dropdown menu",
        "Verify the task shows '30 minutes' or '30m' badge",
      ]);
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item to open the edit dialog",
        "Clear the name input field and type 'Updated task name'",
        "Click the 'Save changes' button",
        "Verify the task list shows 'Updated task name'",
      ]);
    });

    it("should edit task details", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item to open the edit dialog",
        "Type 'Task details here' in the details textarea",
        "Click the 'Save changes' button",
      ]);
    });

    it("should change task list/category", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item to open the edit dialog",
        "Click the list/category dropdown and select 'Personal'",
        "Click the 'Save changes' button",
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
        "Click the first category button in the sidebar (below Filters section)",
        "Verify the task list updates to show filtered tasks",
        "Click the second category button in the sidebar",
        "Verify the task list updates to show different filtered tasks",
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
