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
      ]);
      // Verify using standard Cypress after prompt actions
      cy.contains("Buy groceries").should("be.visible");
    });

    it("should create a task with estimated duration", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner",
        "Type 'Prepare presentation' in the textarea",
        "Click the clock icon button in the form",
        "Click the '1h' option",
        "Click the 'Add Task' button",
      ]);
      cy.contains("Prepare presentation").should("be.visible");
    });

    it("should create a task for a specific date", () => {
      cy.prompt([
        "Click the plus button at the bottom right corner",
        "Type 'Schedule meeting' in the textarea",
        "Click the calendar icon button in the form",
        "Click tomorrow in the calendar picker",
        "Click the 'Add Task' button",
      ]);
      cy.prompt([
        "Click the 'Tomorrow' button in the sidebar",
      ]);
      cy.contains("Schedule meeting").should("be.visible");
    });
  });

  describe("Task Actions", () => {
    it("should mark a task as complete", () => {
      cy.prompt([
        "Click the circle checkbox button on the left side of the first task",
      ]);
      // Check that task got line-through class
      cy.get(".line-through").should("exist");
    });

    it("should star/select a task", () => {
      cy.prompt([
        "Click the star button on the first task row",
      ]);
      // Verify star is now filled/selected
      cy.get('[data-selected="true"]').should("exist");
    });

    it("should delete a task", () => {
      cy.prompt([
        "Click the trash button on the first task row",
      ]);
      // Verify task is marked as deleted (has line-through)
      cy.get(".line-through").should("exist");
    });

    it("should snooze a task to a different date", () => {
      cy.prompt([
        "Click the calendar button on the first task row",
        "Click tomorrow in the calendar popup",
      ]);
    });

    it("should mark a task as a blocker", () => {
      cy.prompt([
        "Click the users button on the first task row",
      ]);
    });

    it("should set estimated time for a task", () => {
      cy.prompt([
        "Click the clock button on the first task row",
        "Click '30m' in the dropdown menu",
      ]);
      cy.contains("30m").should("be.visible");
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.prompt([
        "Click the pencil button on the first task row",
        "Clear the name input field",
        "Type 'Updated task name' in the name input",
        "Click the 'Save changes' button",
      ]);
      cy.contains("Updated task name").should("be.visible");
    });

    it("should edit task details", () => {
      cy.prompt([
        "Click the pencil button on the first task row",
        "Type 'Task details here' in the details textarea",
        "Click the 'Save changes' button",
      ]);
    });

    it("should change task list/category", () => {
      cy.prompt([
        "Click the pencil button on the first task row",
        "Click the list dropdown button",
        "Click on a different list option",
        "Click the 'Save changes' button",
      ]);
    });
  });

  describe("Filter Tasks", () => {
    it("should filter tasks by Today", () => {
      cy.prompt([
        "Click the 'Today' button in the sidebar",
      ]);
      cy.url().should("include", "today");
    });

    it("should filter tasks by Tomorrow", () => {
      cy.prompt([
        "Click the 'Tomorrow' button in the sidebar",
      ]);
      cy.url().should("include", "tomorrow");
    });

    it("should filter tasks by Backlog", () => {
      cy.prompt([
        "Click the 'Backlog' button in the sidebar",
      ]);
      cy.url().should("include", "backlog");
    });

    it("should filter tasks by Selected", () => {
      cy.prompt([
        "Click the 'Selected' button in the sidebar",
      ]);
      cy.url().should("include", "selected");
    });

    it("should filter tasks by Future", () => {
      cy.prompt([
        "Click the 'Future' button in the sidebar",
      ]);
      cy.url().should("include", "future");
    });

    it("should filter tasks by list category", () => {
      cy.prompt([
        "Click the first category button below the Filters section in the sidebar",
      ]);
      cy.prompt([
        "Click the second category button in the sidebar",
      ]);
    });
  });
});
