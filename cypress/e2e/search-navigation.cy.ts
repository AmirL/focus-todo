/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.prompt([
        "Click the search icon button in the header area",
        "Verify a search input field appears",
      ]);
    });

    it("should search for tasks by name", () => {
      cy.prompt([
        "Click the search icon button in the header",
        "Type 'task' in the search input field",
        "Verify search results appear below the input",
      ]);
    });

    it("should select task from search results", () => {
      cy.prompt([
        "Click the search icon button to open search",
        "Type 'a' in the search input field",
        "Click on the first result item in the search results list",
      ]);
    });

    it("should close search by clicking X button", () => {
      cy.prompt([
        "Click the search icon button to open search",
        "Click the X or close button in the search dialog",
        "Verify the search dialog is closed",
      ]);
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.prompt([
        "Click the 'Backlog' button in the sidebar",
        "Verify the page header contains 'backlog' text",
        "Click the 'Today' button in the sidebar",
        "Verify the page header contains 'today' text",
        "Click the 'Tomorrow' button in the sidebar",
        "Verify the page header contains 'tomorrow' text",
      ]);
    });

    it("should navigate to Selected filter", () => {
      cy.prompt([
        "Click the 'Selected' button in the sidebar",
        "Verify the page header contains 'selected' text",
      ]);
    });

    it("should navigate to Future filter", () => {
      cy.prompt([
        "Click the 'Future' button in the sidebar",
        "Verify the page header contains 'future' text",
      ]);
    });

    it("should navigate to settings", () => {
      cy.prompt([
        "Click the 'Settings' link or button in the sidebar",
        "Verify the page URL contains 'settings'",
      ]);
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.prompt([
        "Click the hamburger menu icon button in the top left",
        "Verify the sidebar navigation panel slides in from the left",
      ]);
    });

    it("should navigate on mobile", () => {
      cy.prompt([
        "Click the hamburger menu icon button",
        "Click the 'Today' button in the sidebar that appears",
        "Verify the header shows 'today' text",
      ]);
    });
  });

  describe("List/Category Navigation", () => {
    it("should filter by first category", () => {
      cy.prompt([
        "Click the first category button in the sidebar below the Filters section",
        "Verify the task list content updates",
      ]);
    });

    it("should filter by second category", () => {
      cy.prompt([
        "Click the second category button in the sidebar below the Filters section",
        "Verify the task list content updates",
      ]);
    });
  });
});
