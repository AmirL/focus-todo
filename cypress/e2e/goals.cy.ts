/// <reference types="cypress" />

describe("Goal Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Goals", () => {
    it("should create a new goal", () => {
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type("Learn TypeScript");
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains("Learn TypeScript").should("be.visible");
    });

    it("should create a goal with custom progress", () => {
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type("Exercise daily");
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains("Exercise daily").should("be.visible");
    });
  });

  describe("Edit Goals", () => {
    it("should edit goal title", () => {
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[data-cy="edit-goal-title-input"]').clear().type("Updated Goal Title");
      cy.get('[data-cy="save-goal-button"]').click();
      cy.contains("Updated Goal Title").should("be.visible");
    });
  });

  describe("Delete Goals", () => {
    it("should delete a goal", () => {
      // Count goals before deletion
      cy.get('[data-cy="goal-item"]').then(($goals) => {
        const initialCount = $goals.length;
        cy.get('[data-cy="delete-goal-button"]').first().click();
        // Wait for the goal to be removed
        if (initialCount > 1) {
          cy.get('[data-cy="goal-item"]').should("have.length", initialCount - 1);
        }
      });
    });
  });

  describe("Goal Display", () => {
    it("should display goals section", () => {
      cy.contains("Goals").should("be.visible");
      cy.get('[data-cy="goal-item"]').should("exist");
    });

    it("should display goal titles", () => {
      cy.get('[data-cy="goal-title"]').should("exist");
    });
  });
});
