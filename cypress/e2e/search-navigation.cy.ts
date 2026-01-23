/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search with keyboard shortcut", () => {
      cy.prompt([
        "Press Cmd+K or Ctrl+K to open the search spotlight",
        "Verify the search modal or dialog appears",
      ]);
    });

    it("should search for tasks by name", () => {
      cy.prompt([
        "Open the search modal",
        "Type a task name in the search input",
        "Verify matching tasks appear in the search results",
      ]);
    });

    it("should navigate search results with keyboard", () => {
      cy.prompt([
        "Open the search modal and search for a term",
        "Press the down arrow key to navigate to a result",
        "Press Enter to select the highlighted result",
        "Verify the selected task is highlighted or opened",
      ]);
    });

    it("should close search with Escape key", () => {
      cy.prompt([
        "Open the search modal",
        "Press the Escape key",
        "Verify the search modal is closed",
      ]);
    });

    it("should select task from search results", () => {
      cy.prompt([
        "Open the search modal",
        "Search for a specific task",
        "Click on a task in the search results",
        "Verify the task becomes selected or highlighted in the main view",
      ]);
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.prompt([
        "Click on the Backlog filter in the sidebar",
        "Verify the Backlog view is displayed",
        "Click on the Today filter",
        "Verify the Today view is displayed",
        "Click on the Tomorrow filter",
        "Verify the Tomorrow view is displayed",
      ]);
    });

    it("should show task counts on filters", () => {
      cy.prompt([
        "Look at the sidebar navigation filters",
        "Verify each filter shows the count of tasks",
      ]);
    });

    it("should show estimated time for Today filter", () => {
      cy.prompt([
        "Look at the Today filter in the sidebar",
        "Verify it displays the total estimated time for today's tasks",
      ]);
    });

    it("should navigate to settings", () => {
      cy.prompt([
        "Click on the settings link or icon in the sidebar",
        "Verify the settings page or modal is displayed",
      ]);
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.prompt([
        "Click on the hamburger menu or mobile menu toggle button",
        "Verify the mobile sidebar menu opens",
        "Click outside or on the close button to close the menu",
        "Verify the menu is closed",
      ]);
    });

    it("should navigate on mobile", () => {
      cy.prompt([
        "Open the mobile menu",
        "Click on a filter option like Today",
        "Verify the view changes and the menu closes",
      ]);
    });
  });

  describe("List/Category Navigation", () => {
    it("should filter by Work list", () => {
      cy.prompt([
        "Click on the Work category in the sidebar or filter area",
        "Verify only Work tasks and goals are displayed",
      ]);
    });

    it("should filter by Personal list", () => {
      cy.prompt([
        "Click on the Personal category in the sidebar or filter area",
        "Verify only Personal tasks and goals are displayed",
      ]);
    });

    it("should show all items when no category filter is selected", () => {
      cy.prompt([
        "Clear any category filter if active",
        "Verify all tasks and goals are displayed regardless of list",
      ]);
    });
  });
});
