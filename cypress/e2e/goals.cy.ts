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
        "Type 'Learn TypeScript' in the title input field",
        "Click the 'Create' button",
        "Verify 'Learn TypeScript' appears in the goals list",
      ]);
    });

    it("should create a goal with progress", () => {
      cy.prompt([
        "Click the 'Add Goal' button",
        "Type 'Complete project' in the title input",
        "Drag the progress slider to 25%",
        "Click 'Create' button",
        "Verify the goal shows 25% progress",
      ]);
    });
  });

  describe("Edit Goals", () => {
    it("should edit goal title", () => {
      cy.prompt([
        "Click the pencil icon button on the first goal",
        "Clear the title input and type 'Updated Goal Title'",
        "Click the 'Save' or 'Update' button",
        "Verify the goal shows 'Updated Goal Title'",
      ]);
    });

    it("should update goal progress", () => {
      cy.prompt([
        "Click the pencil icon button on the first goal",
        "Drag the progress slider to around 50%",
        "Click the 'Save' or 'Update' button",
        "Verify the progress bar shows approximately 50%",
      ]);
    });
  });

  describe("Delete Goals", () => {
    it("should delete a goal", () => {
      cy.prompt([
        "Click the trash icon button on the first goal",
        "Verify the goal is removed from the list",
      ]);
    });
  });

  describe("Goal Display", () => {
    it("should display goals section", () => {
      cy.prompt([
        "Verify the goals section is visible above the tasks",
        "Verify goals have a progress bar element",
      ]);
    });
  });
});
