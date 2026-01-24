/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.prompt([
        "Click the search button in the header",
      ]);
      cy.get('input[placeholder*="Search"]').should("be.visible");
    });

    it("should search for tasks by name", () => {
      cy.prompt([
        "Click the search button in the header",
        "Type 'task' in the search input",
      ]);
      cy.get('[role="listbox"]').should("be.visible");
    });

    it("should select task from search results", () => {
      cy.prompt([
        "Click the search button in the header",
        "Type 'a' in the search input",
        "Click the first item in the results list",
      ]);
    });

    it("should close search by clicking X button", () => {
      cy.prompt([
        "Click the search button in the header",
      ]);
      cy.get('input[placeholder*="Search"]').should("be.visible");
      cy.prompt([
        "Click the X button to close the search dialog",
      ]);
      cy.get('input[placeholder*="Search"]').should("not.exist");
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.prompt([
        "Click the 'Backlog' button in the sidebar",
      ]);
      cy.url().should("include", "backlog");
      cy.prompt([
        "Click the 'Today' button in the sidebar",
      ]);
      cy.url().should("include", "today");
      cy.prompt([
        "Click the 'Tomorrow' button in the sidebar",
      ]);
      cy.url().should("include", "tomorrow");
    });

    it("should navigate to Selected filter", () => {
      cy.prompt([
        "Click the 'Selected' button in the sidebar",
      ]);
      cy.url().should("include", "selected");
    });

    it("should navigate to Future filter", () => {
      cy.prompt([
        "Click the 'Future' button in the sidebar",
      ]);
      cy.url().should("include", "future");
    });

    it("should navigate to settings", () => {
      cy.prompt([
        "Click the 'Settings' link in the sidebar",
      ]);
      cy.url().should("include", "settings");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.prompt([
        "Click the hamburger menu button in the top left",
      ]);
      cy.get("button").contains("Backlog").should("be.visible");
    });

    it("should navigate on mobile", () => {
      cy.prompt([
        "Click the hamburger menu button",
        "Click the 'Today' button in the menu",
      ]);
      cy.url().should("include", "today");
    });
  });

  describe("List/Category Navigation", () => {
    it("should filter by first category", () => {
      cy.prompt([
        "Click the first category button below the Filters section in the sidebar",
      ]);
    });

    it("should filter by second category", () => {
      cy.prompt([
        "Click the second category button in the sidebar",
      ]);
    });
  });
});
