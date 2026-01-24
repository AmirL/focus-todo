/// <reference types="cypress" />

describe("Task Categories", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Filter by Category", () => {
    it("should show category buttons in sidebar", () => {
      // Verify category buttons exist in sidebar
      cy.get('aside').within(() => {
        cy.get('button').should("have.length.greaterThan", 5); // More than just filter buttons
      });
    });
  });

  describe("Assign Tasks to Categories", () => {
    it("should create a task", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type("Categorized task");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Categorized task").should("be.visible");
    });

    it("should edit a task", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.contains("Save changes").click();
    });
  });
});
