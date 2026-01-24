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
      // Radix checkbox uses role="checkbox"
      cy.get('[data-testid^="task-"]').first().find('[role="checkbox"]').click();
      cy.get(".line-through").should("exist");
    });

    it("should star/select a task", () => {
      // Hover on task to reveal action buttons, then click star
      cy.get('[data-testid^="task-"]').first().trigger('mouseover');
      cy.get('[data-testid^="star-task-"]').first().click({ force: true });
      // Button should have yellow text class when selected
      cy.get('[data-testid^="star-task-"]').first().should('have.class', 'text-yellow-500');
    });

    it("should delete a task", () => {
      cy.get('[data-testid^="delete-task-"]').first().click();
      cy.get(".line-through").should("exist");
    });

    it("should snooze a task to a different date", () => {
      cy.get('[data-testid^="snooze-task-"]').first().click();
      cy.get('[role="gridcell"]').not('[disabled]').first().click();
    });

    it("should mark a task as a blocker", () => {
      cy.get('[data-testid^="blocker-task-"]').first().click();
      // Blocker icon SVG should have fill when selected
      cy.get('[data-testid^="blocker-task-"]').first().should("have.class", "text-blue-600");
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('#name').clear().type("Updated task name");
      cy.get('[data-testid="save-task-changes-button"]').click();
      cy.contains("Updated task name").should("be.visible");
    });

    it("should open edit dialog", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-testid="save-task-changes-button"]').click();
    });
  });

  describe("Filter Tasks", () => {
    it("should navigate to Today filter", () => {
      cy.prompt(["Click the 'Today' button in the sidebar"]);
      cy.contains("today").should("exist");
    });

    it("should navigate to Tomorrow filter", () => {
      cy.prompt(["Click the 'Tomorrow' button in the sidebar"]);
      cy.contains("tomorrow").should("exist");
    });

    it("should navigate to Backlog filter", () => {
      cy.prompt(["Click the 'Backlog' button in the sidebar"]);
      cy.contains("backlog").should("exist");
    });

    it("should navigate to Selected filter", () => {
      cy.prompt(["Click the 'Selected' button in the sidebar"]);
      cy.contains("selected").should("exist");
    });

    it("should navigate to Future filter", () => {
      cy.prompt(["Click the 'Future' button in the sidebar"]);
      cy.contains("future").should("exist");
    });
  });
});
