/// <reference types="cypress" />

describe("Task Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Tasks", () => {
    it("should create a new task using the add task button", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner of the page",
        "Type 'Buy groceries' in the textarea that appears",
        "Click the 'Add Task' button",
        "Verify that 'Buy groceries' text appears in the task list",
      ]);
    });

    it("should create a task with estimated duration", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner",
        "Type 'Prepare presentation' in the textarea",
        "Click the clock icon or time dropdown in the form",
        "Click '1 hour' or '60 minutes' option",
        "Click the 'Add Task' button",
      ]);
    });

    it("should create a task for a specific date", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner",
        "Type 'Schedule meeting' in the textarea",
        "Click the calendar icon or date picker in the form",
        "Click on tomorrow's date in the calendar",
        "Click the 'Add Task' button",
        "Click the 'Tomorrow' button in the sidebar",
        "Verify 'Schedule meeting' text is visible",
      ]);
    });
  });

  describe("Task Actions", () => {
    it("should mark a task as complete", () => {
      cy.prompt([
        "Click the checkbox button on the first task item in the list",
        "Verify the task text now has strikethrough styling",
      ]);
    });

    it("should star/select a task", () => {
      cy.prompt([
        "Click the star icon button on the first task item in the list",
        "Verify the star icon changes to yellow or filled state",
      ]);
    });

    it("should delete a task", () => {
      cy.prompt([
        "Click the trash icon button on the first task item in the list",
        "Verify the task now shows with reduced opacity or strikethrough",
      ]);
    });

    it("should snooze a task to a different date", () => {
      cy.prompt([
        "Click the calendar icon button on the first task item",
        "Click on any date in the calendar popover that appears",
      ]);
    });

    it("should mark a task as a blocker", () => {
      cy.prompt([
        "Click the users icon button on the first task item in the list",
        "Verify the users icon changes to blue or highlighted state",
      ]);
    });

    it("should set estimated time for a task", () => {
      cy.prompt([
        "Click the clock icon button on the first task item in the list",
        "Click '30 minutes' or '30m' option in the dropdown",
        "Verify the task now shows a time badge",
      ]);
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item",
        "Clear the name input field",
        "Type 'Updated task name' in the name input field",
        "Click the 'Save changes' button",
        "Verify 'Updated task name' text appears in the task list",
      ]);
    });

    it("should edit task details", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item",
        "Type 'Task details here' in the details textarea field",
        "Click the 'Save changes' button",
      ]);
    });

    it("should change task list/category", () => {
      cy.prompt([
        "Click the pencil icon button on the first task item",
        "Click on the category or list dropdown button",
        "Click on a different category option",
        "Click the 'Save changes' button",
      ]);
    });
  });

  describe("Filter Tasks", () => {
    it("should filter tasks by Today", () => {
      cy.prompt([
        "Click the 'Today' button in the sidebar",
        "Verify the page header shows 'today'",
      ]);
    });

    it("should filter tasks by Tomorrow", () => {
      cy.prompt([
        "Click the 'Tomorrow' button in the sidebar",
        "Verify the page header shows 'tomorrow'",
      ]);
    });

    it("should filter tasks by Backlog", () => {
      cy.prompt([
        "Click the 'Backlog' button in the sidebar",
        "Verify the page header shows 'backlog'",
      ]);
    });

    it("should filter tasks by Selected", () => {
      cy.prompt([
        "Click the 'Selected' button in the sidebar",
        "Verify the page header shows 'selected'",
      ]);
    });

    it("should filter tasks by Future", () => {
      cy.prompt([
        "Click the 'Future' button in the sidebar",
        "Verify the page header shows 'future'",
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
});
