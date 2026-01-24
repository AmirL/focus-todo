/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.prompt([
        "Click the search icon button in the top right area of the main content",
        "Verify a search dialog or input appears",
      ]);
    });

    it("should search for tasks by name", () => {
      cy.prompt([
        "Click the search icon button to open search",
        "Type 'task' in the search input field",
        "Verify task results appear below the search input",
      ]);
    });

    it("should select task from search results", () => {
      cy.prompt([
        "Click the search icon button to open search",
        "Type a few characters in the search input",
        "Click on the first task result that appears",
        "Verify the search dialog closes",
      ]);
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.prompt([
        "Click the 'Backlog' button in the sidebar",
        "Verify the page header shows 'backlog'",
        "Click the 'Today' button in the sidebar",
        "Verify the page header shows 'today'",
        "Click the 'Tomorrow' button in the sidebar",
        "Verify the page header shows 'tomorrow'",
      ]);
    });

    it("should navigate to Selected filter", () => {
      cy.prompt([
        "Click the 'Selected' button in the sidebar",
        "Verify the page header shows 'selected'",
      ]);
    });

    it("should navigate to Future filter", () => {
      cy.prompt([
        "Click the 'Future' button in the sidebar",
        "Verify the page header shows 'future'",
      ]);
    });

    it("should navigate to settings", () => {
      cy.prompt([
        "Click the 'Settings' link in the sidebar",
        "Verify the URL changes to include 'settings'",
      ]);
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.prompt([
        "Click the menu icon button in the top left corner",
        "Verify the sidebar navigation becomes visible",
      ]);
    });

    it("should navigate on mobile", () => {
      cy.prompt([
        "Click the menu icon button to open the sidebar",
        "Click the 'Today' button in the sidebar",
        "Verify the page shows today's tasks",
      ]);
    });
  });

  describe("List/Category Navigation", () => {
    it("should filter by Work category", () => {
      cy.prompt([
        "Click the 'Work' button in the sidebar categories section",
        "Verify the task list shows only Work tasks",
      ]);
    });

    it("should filter by Personal category", () => {
      cy.prompt([
        "Click the 'Personal' button in the sidebar categories section",
        "Verify the task list shows only Personal tasks",
      ]);
    });
  });
});
