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
      "Verify 'Smoke test task' text appears in the task list",
      "Click the checkbox on 'Smoke test task'",
      "Verify the task text has strikethrough styling",
    ]);
  });

  it("should star a task and view in Selected", () => {
    cy.prompt([
      "Click the star icon button on the first task item",
      "Verify the star icon turns yellow or filled",
      "Click the 'Selected' button in the sidebar",
      "Verify the header shows 'selected' text",
    ]);
  });

  it("should create a goal", () => {
    cy.prompt([
      "Click the 'Add Goal' button in the goals section at the top",
      "Type 'Test Goal' in the title input field",
      "Click the 'Create' or 'Add' button",
      "Verify 'Test Goal' text appears in the goals section",
    ]);
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.prompt([
      "Verify the sidebar with 'Backlog' button is visible on the left",
      "Verify the 'Today' button is visible in the sidebar",
      "Verify the 'Tomorrow' button is visible in the sidebar",
    ]);
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    cy.prompt([
      "Verify a hamburger menu icon button is visible in the top left corner",
      "Click the hamburger menu icon button",
      "Verify the sidebar with navigation buttons slides in",
    ]);
  });

  it("should search for tasks", () => {
    cy.prompt([
      "Click the search icon button in the header",
      "Type 'test' in the search input field",
      "Verify search results appear below the input",
    ]);
  });

  it("should navigate between filter views", () => {
    cy.prompt([
      "Click the 'Backlog' button in the sidebar",
      "Verify the header shows 'backlog' text",
      "Click the 'Today' button in the sidebar",
      "Verify the header shows 'today' text",
      "Click the 'Selected' button in the sidebar",
      "Verify the header shows 'selected' text",
    ]);
  });
});
