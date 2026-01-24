/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.prompt(["Click the search icon button in the header"]);
      cy.get('input[placeholder*="Search"]').should("be.visible");
    });

    it("should search for tasks by name", () => {
      cy.prompt(["Click the search icon button in the header"]);
      cy.get('input[placeholder*="Search"]').type("task");
      // Verify search results list appears (ul with divide-y class)
      cy.get('ul.divide-y').should("exist");
    });

    it("should close search dialog", () => {
      cy.prompt(["Click the search icon button in the header"]);
      cy.get('input[placeholder*="Search"]').should("be.visible");
      cy.get('body').type('{esc}');
      cy.get('input[placeholder*="Search"]').should("not.exist");
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.prompt(["Click the 'Backlog' button in the sidebar"]);
      cy.contains("backlog").should("exist");
      cy.prompt(["Click the 'Today' button in the sidebar"]);
      cy.contains("today").should("exist");
      cy.prompt(["Click the 'Tomorrow' button in the sidebar"]);
      cy.contains("tomorrow").should("exist");
    });

    it("should navigate to Selected filter", () => {
      cy.prompt(["Click the 'Selected' button in the sidebar"]);
      cy.contains("selected").should("exist");
    });

    it("should navigate to Future filter", () => {
      cy.prompt(["Click the 'Future' button in the sidebar"]);
      cy.contains("future").should("exist");
    });

    it("should navigate to settings", () => {
      cy.prompt(["Click the 'Settings' link in the sidebar"]);
      cy.url().should("include", "settings");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.prompt(["Click the hamburger menu button to open the sidebar"]);
      cy.contains("Backlog").should("be.visible");
    });

    it("should navigate on mobile", () => {
      cy.prompt([
        "Click the hamburger menu button to open the sidebar",
        "Click the 'Today' button",
      ]);
      cy.contains("today").should("exist");
    });
  });

  describe("List/Category Navigation", () => {
    it("should show category buttons in sidebar", () => {
      cy.prompt(["Verify the sidebar shows category filter buttons"]);
    });
  });
});
