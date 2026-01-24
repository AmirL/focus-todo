/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.get('button svg.lucide-search').first().click();
      cy.get('input[placeholder*="Search"]').should("be.visible");
    });

    it("should search for tasks by name", () => {
      cy.get('button svg.lucide-search').first().click();
      cy.get('input[placeholder*="Search"]').type("task");
      cy.get('[role="listbox"], [cmdk-list]').should("exist");
    });

    it("should close search dialog", () => {
      cy.get('button svg.lucide-search').first().click();
      cy.get('input[placeholder*="Search"]').should("be.visible");
      // Press Escape or click outside to close
      cy.get('body').type('{esc}');
      cy.get('input[placeholder*="Search"]').should("not.exist");
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.contains("button", "Backlog").click();
      cy.url().should("include", "backlog");
      cy.contains("button", "Today").click();
      cy.url().should("include", "today");
      cy.contains("button", "Tomorrow").click();
      cy.url().should("include", "tomorrow");
    });

    it("should navigate to Selected filter", () => {
      cy.contains("button", "Selected").click();
      cy.url().should("include", "selected");
    });

    it("should navigate to Future filter", () => {
      cy.contains("button", "Future").click();
      cy.url().should("include", "future");
    });

    it("should navigate to settings", () => {
      cy.contains("a", "Settings").click();
      cy.url().should("include", "settings");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.get('button svg.lucide-menu').first().click({ force: true });
      cy.contains("button", "Backlog").should("be.visible");
    });

    it("should navigate on mobile", () => {
      cy.get('button svg.lucide-menu').first().click({ force: true });
      cy.contains("button", "Today").click();
      cy.url().should("include", "today");
    });
  });

  describe("List/Category Navigation", () => {
    it("should filter by category buttons in sidebar", () => {
      // Categories are below the filter buttons - look for buttons that aren't the main filters
      cy.get('aside button').not(':contains("Backlog")').not(':contains("Today")').not(':contains("Tomorrow")').not(':contains("Selected")').not(':contains("Future")').first().click();
    });
  });
});
