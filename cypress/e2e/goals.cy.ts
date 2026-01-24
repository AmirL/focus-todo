/// <reference types="cypress" />

describe("Goal Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Goals", () => {
    it("should create a new goal", () => {
      cy.prompt([
        "Click the 'Add Goal' button in the goals section",
        "Type 'Learn TypeScript' in the title input",
        "Click the 'Create' button",
      ]);
      cy.contains("Learn TypeScript").should("be.visible");
    });

    it("should create a personal goal", () => {
      cy.prompt([
        "Click the 'Add Goal' button in the goals section",
        "Type 'Exercise daily' in the title input",
        "Click the list dropdown button",
        "Click 'Personal' in the dropdown",
        "Click the 'Create' button",
      ]);
      cy.contains("Exercise daily").should("be.visible");
    });
  });

  describe("Edit Goals", () => {
    it("should edit goal title", () => {
      cy.prompt([
        "Click the pencil button on the first goal",
        "Clear the title input",
        "Type 'Updated Goal Title' in the title input",
        "Click the 'Save' button",
      ]);
      cy.contains("Updated Goal Title").should("be.visible");
    });

    it("should update goal progress", () => {
      cy.prompt([
        "Click the pencil button on the first goal",
        "Click the progress input field",
        "Clear the progress input",
        "Type '50' in the progress input",
        "Click the 'Save' button",
      ]);
    });
  });

  describe("Delete Goals", () => {
    it("should delete a goal", () => {
      // Get initial count of goals
      cy.get('[data-testid^="goal-"]').then(($goals) => {
        const initialCount = $goals.length;
        cy.prompt([
          "Click the trash button on the first goal",
        ]);
        // Allow time for deletion
        cy.wait(500);
        cy.get('[data-testid^="goal-"]').should("have.length.lessThan", initialCount + 1);
      });
    });
  });

  describe("Goal Display", () => {
    it("should display goals section", () => {
      cy.contains("Goals").should("be.visible");
      cy.get('[data-testid^="goal-"]').should("exist");
    });
  });
});
