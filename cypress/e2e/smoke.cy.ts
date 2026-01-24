/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should create and complete a task", () => {
    cy.prompt([
      "Click the plus button at the bottom right corner",
      "Type 'Smoke test task' in the textarea",
      "Click the 'Add Task' button",
    ]);
    cy.contains("Smoke test task").should("be.visible");
    cy.prompt([
      "Click the circle checkbox on 'Smoke test task'",
    ]);
    cy.get(".line-through").should("exist");
  });

  it("should star a task and view in Selected", () => {
    cy.prompt([
      "Click the star button on the first task row",
      "Click the 'Selected' button in the sidebar",
    ]);
    cy.url().should("include", "selected");
  });

  it("should create a goal", () => {
    cy.prompt([
      "Click the 'Add Goal' button in the goals section",
      "Type 'Test Goal' in the title input",
      "Click the 'Create' button",
    ]);
    cy.contains("Test Goal").should("be.visible");
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.get("button").contains("Backlog").should("be.visible");
    cy.get("button").contains("Today").should("be.visible");
    cy.get("button").contains("Tomorrow").should("be.visible");
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    cy.prompt([
      "Click the hamburger menu button in the top left",
    ]);
    cy.get("button").contains("Backlog").should("be.visible");
  });

  it("should search for tasks", () => {
    cy.prompt([
      "Click the search button in the header",
      "Type 'test' in the search input",
    ]);
    cy.get('[role="listbox"]').should("be.visible");
  });

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
      "Click the 'Selected' button in the sidebar",
    ]);
    cy.url().should("include", "selected");
  });
});
