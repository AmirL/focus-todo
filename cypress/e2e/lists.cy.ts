/// <reference types="cypress" />

describe("List Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Create Lists", () => {
    it("should create a new custom list", () => {
      cy.prompt([
        "Navigate to list management or settings where lists can be created",
        "Click on the add list or create list button",
        "Enter 'Side Projects' as the new list name",
        "Save the new list",
        "Verify the new list 'Side Projects' appears in the list options",
      ]);
    });
  });

  describe("Edit Lists", () => {
    it("should rename an existing list", () => {
      cy.prompt([
        "Navigate to list management or settings",
        "Click on edit for an existing custom list",
        "Change the list name to a new name",
        "Save the changes",
        "Verify the list shows the updated name",
      ]);
    });
  });

  describe("Delete Lists", () => {
    it("should delete a custom list", () => {
      cy.prompt([
        "Navigate to list management or settings",
        "Find a custom list that can be deleted",
        "Click the delete button for the list",
        "Confirm the deletion if prompted",
        "Verify the list is removed from the list options",
      ]);
    });
  });

  describe("Assign Tasks to Lists", () => {
    it("should assign a task to a specific list", () => {
      cy.prompt([
        "Create a new task or edit an existing task",
        "Select the Work list from the list dropdown",
        "Save the task",
        "Verify the task shows the Work list badge or is grouped under Work",
      ]);
    });

    it("should change task list assignment", () => {
      cy.prompt([
        "Click on a task to edit it",
        "Change the list from Work to Personal",
        "Save the changes",
        "Verify the task now appears under Personal category",
      ]);
    });
  });
});
