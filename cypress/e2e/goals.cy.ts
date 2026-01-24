/// <reference types="cypress" />

describe("Goal Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Goals", () => {
    it("should create a new goal", () => {
      cy.prompt([
        "Click the 'Add Goal' button or plus icon in the goals section at the top",
        "Type 'Learn TypeScript' in the title input field",
        "Click the 'Create' or 'Add' button in the dialog",
        "Verify 'Learn TypeScript' text appears in the goals section",
      ]);
    });

    it("should create a personal goal", () => {
      cy.prompt([
        "Click the 'Add Goal' button in the goals section",
        "Type 'Exercise daily' in the title input field",
        "Click on the category or list dropdown",
        "Click on 'Personal' option",
        "Click the 'Create' or 'Add' button",
        "Verify 'Exercise daily' text appears in the goals section",
      ]);
    });
  });

  describe("Edit Goals", () => {
    it("should edit goal title", () => {
      cy.prompt([
        "Click the pencil icon button on the first goal item",
        "Clear the title input field",
        "Type 'Updated Goal Title' in the title input field",
        "Click the 'Save' or 'Update' button",
        "Verify 'Updated Goal Title' text appears in the goals section",
      ]);
    });

    it("should update goal progress using slider", () => {
      cy.prompt([
        "Click the pencil icon button on the first goal item",
        "Click and drag the progress slider to the middle position",
        "Click the 'Save' or 'Update' button",
      ]);
    });
  });

  describe("Delete Goals", () => {
    it("should delete a goal", () => {
      cy.prompt([
        "Click the trash icon button on the first goal item",
        "Verify a goal is deleted by checking the goals section updates",
      ]);
    });
  });

  describe("Goal Display", () => {
    it("should display goals section with goal items", () => {
      cy.prompt([
        "Verify there is a section labeled 'Goals' at the top of the page",
        "Verify goal items are displayed with title text",
      ]);
    });
  });
});
