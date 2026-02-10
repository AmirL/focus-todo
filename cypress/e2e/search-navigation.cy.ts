/// <reference types="cypress" />

describe("Search and Navigation", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  describe("Search/Spotlight", () => {
    it("should open search by clicking search icon", () => {
      cy.get('[data-cy="search-button"]').click();
      cy.get('input[placeholder*="Search"]').should("be.visible");
    });

    it("should search for tasks by name", () => {
      // Create a task so search has results
      const taskName = `Searchable task ${Date.now()}`;
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type(taskName);
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });

      cy.get('[data-cy="search-button"]').click();
      cy.get('input[placeholder*="Search"]').type("Searchable");
      cy.get('[data-cy="search-results"]').should("exist");
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
