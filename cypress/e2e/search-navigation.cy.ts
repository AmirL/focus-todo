/// <reference types="cypress" />

describe("Search and Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.get('[data-cy="search-button"]').click();
      cy.get('input[placeholder*="Search"]').should("be.visible");
    });

    it("should search for tasks by name", () => {
      cy.get('[data-cy="search-button"]').click();
      cy.get('input[placeholder*="Search"]').type("task");
      // Verify search results list appears (ul with divide-y class)
      cy.get('ul.divide-y').should("exist");
    });

    it("should close search dialog", () => {
      cy.get('[data-cy="search-button"]').click();
      cy.get('input[placeholder*="Search"]').should("be.visible");
      cy.get('body').type('{esc}');
      cy.get('input[placeholder*="Search"]').should("not.exist");
    });
  });

  describe("Sidebar Navigation", () => {
    it("should navigate between filter views", () => {
      cy.get('[data-cy="filter-backlog"]').click();
      cy.contains("backlog").should("exist");
      cy.get('[data-cy="filter-today"]').click();
      cy.contains("today").should("exist");
      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.contains("tomorrow").should("exist");
    });

    it("should navigate to Selected filter", () => {
      cy.get('[data-cy="filter-selected"]').click();
      cy.contains("selected").should("exist");
    });

    it("should navigate to Future filter", () => {
      cy.get('[data-cy="filter-future"]').click();
      cy.contains("future").should("exist");
    });

    it("should navigate to settings", () => {
      cy.get('[data-cy="settings-link"]').click();
      cy.url().should("include", "settings");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport("iphone-x");
    });

    it("should toggle mobile menu", () => {
      cy.get('[data-cy="mobile-menu-button"]').click();
      cy.contains("Backlog").should("be.visible");
    });

    it("should navigate on mobile", () => {
      cy.get('[data-cy="mobile-menu-button"]').click();
      cy.get('[data-cy="filter-today"]').click();
      cy.contains("today").should("exist");
    });
  });

  describe("List/Category Navigation", () => {
    it("should show category buttons in sidebar", () => {
      cy.contains("Categories").should("be.visible");
    });
  });
});
