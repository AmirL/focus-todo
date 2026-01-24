/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should create and complete a task", () => {
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-input"]').type("Smoke test task");
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains("Smoke test task").should("be.visible");

    // Complete the task
    cy.get('[data-testid^="task-"]').contains("Smoke test task").parents('[data-testid^="task-"]').within(() => {
      cy.get('[type="checkbox"]').click({ force: true });
    });
    cy.get(".line-through").should("exist");
  });

  it("should star a task and view in Selected", () => {
    cy.get('[data-testid^="star-task-"]').first().click();
    cy.get('[data-testid^="star-task-"]').first().should("have.class", "text-yellow-500");
    cy.contains("button", "Selected").click();
    cy.url().should("include", "selected");
  });

  it("should create a goal", () => {
    cy.get('[data-cy="add-goal-button"]').click();
    cy.get('[data-cy="goal-title-input"]').type("Test Goal");
    cy.get('[data-cy="create-goal-button"]').click();
    cy.contains("Test Goal").should("be.visible");
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.contains("button", "Backlog").should("be.visible");
    cy.contains("button", "Today").should("be.visible");
    cy.contains("button", "Tomorrow").should("be.visible");
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    // Find and click the mobile menu button (hamburger icon)
    cy.get('button[aria-label*="menu"], button svg.lucide-menu').first().click({ force: true });
    cy.contains("button", "Backlog").should("be.visible");
  });

  it("should search for tasks", () => {
    // Click search button in header
    cy.get('button svg.lucide-search').first().click();
    cy.get('input[placeholder*="Search"]').type("test");
    cy.get('[role="listbox"], [role="option"]').should("exist");
  });

  it("should navigate between filter views", () => {
    cy.contains("button", "Backlog").click();
    cy.url().should("include", "backlog");
    cy.contains("button", "Today").click();
    cy.url().should("include", "today");
    cy.contains("button", "Selected").click();
    cy.url().should("include", "selected");
  });
});
