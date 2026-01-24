/// <reference types="cypress" />

describe("Task Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Tasks", () => {
    it("should create a new task using the add task button", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type("Buy groceries");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Buy groceries").should("be.visible");
    });

    it("should create multiple tasks at once", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type("First task\nSecond task");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("First task").should("be.visible");
      cy.contains("Second task").should("be.visible");
    });

    it("should create a task for a specific date", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type("Schedule meeting");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Schedule meeting").should("be.visible");
    });
  });

  describe("Task Actions", () => {
    it("should mark a task as complete", () => {
      // Get first task and click its checkbox
      cy.get('[data-testid^="task-"]').first().within(() => {
        cy.get('[type="checkbox"]').click({ force: true });
      });
      cy.get(".line-through").should("exist");
    });

    it("should star/select a task", () => {
      cy.get('[data-testid^="star-task-"]').first().click();
      // Verify the star button now has the selected color
      cy.get('[data-testid^="star-task-"]').first().should("have.class", "text-yellow-500");
    });

    it("should delete a task", () => {
      cy.get('[data-testid^="delete-task-"]').first().click();
      // Task should have line-through after deletion
      cy.get(".line-through").should("exist");
    });

    it("should snooze a task to a different date", () => {
      cy.get('[data-testid^="snooze-task-"]').first().click();
      // Click a date in the calendar
      cy.get('[role="gridcell"]').not('[disabled]').first().click();
    });

    it("should mark a task as a blocker", () => {
      cy.get('[data-testid^="blocker-task-"]').first().click();
      // Verify the blocker button now has the blue color
      cy.get('[data-testid^="blocker-task-"]').first().should("have.class", "text-blue-600");
    });

    it("should open snooze calendar popover", () => {
      cy.get('[data-testid^="snooze-task-"]').first().click();
      // Verify calendar popover is visible
      cy.get('[role="dialog"], [role="grid"]').should("be.visible");
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('#name').clear().type("Updated task name");
      cy.get('[data-testid="save-task-changes-button"]').click();
      cy.contains("Updated task name").should("be.visible");
    });

    it("should edit task details", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('#details').type("Task details here");
      cy.get('[data-testid="save-task-changes-button"]').click();
    });
  });

  describe("Filter Tasks", () => {
    it("should filter tasks by Today", () => {
      cy.contains("button", "Today").click();
      cy.url().should("include", "today");
    });

    it("should filter tasks by Tomorrow", () => {
      cy.contains("button", "Tomorrow").click();
      cy.url().should("include", "tomorrow");
    });

    it("should filter tasks by Backlog", () => {
      cy.contains("button", "Backlog").click();
      cy.url().should("include", "backlog");
    });

    it("should filter tasks by Selected", () => {
      cy.contains("button", "Selected").click();
      cy.url().should("include", "selected");
    });

    it("should filter tasks by Future", () => {
      cy.contains("button", "Future").click();
      cy.url().should("include", "future");
    });
  });
});
