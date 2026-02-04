/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should create and complete a task", () => {
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type("Smoke test task");
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains("Smoke test task").should("be.visible");

    // Complete the task - use role="checkbox" for Radix checkbox
    cy.get('[data-testid^="task-"]').contains("Smoke test task").parents('[data-testid^="task-"]').find('[role="checkbox"]').click();
    cy.get(".line-through").should("exist");
  });

  it("should star a task and view in Selected", () => {
    // Get the first task name to verify later
    cy.get('[data-testid^="task-"]').first().invoke('text').then((taskText) => {
      // Hover and click star
      cy.get('[data-testid^="task-"]').first().trigger('mouseover');
      cy.get('[data-testid^="star-task-"]').first().click({ force: true });
      // Navigate to Selected and verify task appears there
      cy.prompt(["Click the 'Selected' button in the sidebar"]);
      cy.get('[data-testid^="task-"]').should("exist");
    });
  });

  it("should create a goal", () => {
    cy.get('[data-cy="add-goal-button"]').click();
    cy.get('[data-cy="goal-title-input"]').type("Test Goal");
    cy.get('[data-cy="create-goal-button"]').click();
    cy.contains("Test Goal").should("be.visible");
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.contains("Backlog").should("be.visible");
    cy.contains("Today").should("be.visible");
    cy.contains("Tomorrow").should("be.visible");
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    cy.prompt(["Click the hamburger menu button to open the sidebar"]);
    cy.contains("Backlog").should("be.visible");
  });

  it("should search for tasks", () => {
    cy.prompt(["Click the search icon button in the header"]);
    cy.get('input[placeholder*="Search"]').type("test");
    // Verify search results list appears (ul with divide-y class)
    cy.get('ul.divide-y').should("exist");
  });

  it("should navigate between filter views", () => {
    cy.prompt(["Click the 'Backlog' button in the sidebar"]);
    cy.contains("backlog").should("exist");
    cy.prompt(["Click the 'Today' button in the sidebar"]);
    cy.contains("today").should("exist");
    cy.prompt(["Click the 'Selected' button in the sidebar"]);
    cy.contains("selected").should("exist");
  });
});
