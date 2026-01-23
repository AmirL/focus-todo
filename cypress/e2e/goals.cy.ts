/// <reference types="cypress" />

describe("Goal Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Goals", () => {
    it("should create a new goal", () => {
      cy.prompt([
        "Click on the add goal button or navigate to goal creation",
        "Enter 'Learn TypeScript' as the goal title",
        "Select the Work list category",
        "Submit to create the goal",
        "Verify that a goal named 'Learn TypeScript' appears in the goals section",
      ]);
    });

    it("should create a personal goal", () => {
      cy.prompt([
        "Open the goal creation form",
        "Enter 'Run a marathon' as the goal title",
        "Select the Personal list category",
        "Save the goal",
        "Verify the goal appears under the Personal category",
      ]);
    });
  });

  describe("Edit Goals", () => {
    it("should edit goal title", () => {
      cy.prompt([
        "Click on an existing goal to open the edit dialog",
        "Change the goal title to 'Master TypeScript'",
        "Save the changes",
        "Verify the goal now shows the updated title",
      ]);
    });

    it("should update goal progress", () => {
      cy.prompt([
        "Click on an existing goal to open the edit dialog",
        "Set the progress value to 50 percent",
        "Save the changes",
        "Verify the goal shows 50% progress in the progress bar",
      ]);
    });

    it("should complete a goal by setting progress to 100%", () => {
      cy.prompt([
        "Click on an existing goal to open the edit dialog",
        "Set the progress value to 100 percent",
        "Save the changes",
        "Verify the goal shows as fully completed",
      ]);
    });
  });

  describe("Delete Goals", () => {
    it("should delete a goal", () => {
      cy.prompt([
        "Find an existing goal in the goals section",
        "Click the delete button for the goal",
        "Confirm the deletion if prompted",
        "Verify the goal is removed from the list",
      ]);
    });
  });

  describe("Goal Display", () => {
    it("should display goals with progress bar", () => {
      cy.prompt([
        "Look for goals in the goals section above the tasks",
        "Verify that each goal displays a progress bar",
        "Verify the progress percentage is visible",
      ]);
    });

    it("should group goals by list category", () => {
      cy.prompt([
        "View the goals section",
        "Verify that Work goals are grouped together",
        "Verify that Personal goals are grouped together",
      ]);
    });
  });
});
