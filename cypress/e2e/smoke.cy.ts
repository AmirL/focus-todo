/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should complete a full task management workflow", () => {
    cy.prompt([
      "Click the plus button at the bottom right to add a task",
      "Type 'Smoke test task' in the task input textarea",
      "Click the 'Add Task' button",
      "Verify 'Smoke test task' appears in the task list",
      "Click the star icon button on 'Smoke test task'",
      "Verify the star icon turns yellow",
      "Click the 'Selected' button in the sidebar",
      "Verify 'Smoke test task' is visible",
      "Click the checkbox on 'Smoke test task'",
      "Verify the task text has strikethrough styling",
    ]);
  });

  it("should complete a goal tracking workflow", () => {
    cy.prompt([
      "Click the 'Add Goal' button in the goals section",
      "Type 'Test Goal' in the title input",
      "Click the 'Create' button",
      "Verify 'Test Goal' appears in the goals section",
      "Click the pencil icon on 'Test Goal' to edit",
      "Drag the progress slider to 50%",
      "Click the save button",
      "Verify the progress bar shows around 50%",
    ]);
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.prompt([
      "Verify the sidebar with 'Backlog', 'Today', 'Tomorrow' buttons is visible",
      "Verify the main content area with tasks is visible",
    ]);
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    cy.prompt([
      "Verify a menu icon button is visible in the top left",
      "Click the menu icon button",
      "Verify the sidebar navigation slides in",
    ]);
  });

  it("should search for tasks", () => {
    cy.prompt([
      "Click the plus button to add a task",
      "Type 'Searchable item' in the task input",
      "Click 'Add Task' button",
      "Click the search icon button to open search",
      "Type 'Searchable' in the search input",
      "Verify 'Searchable item' appears in the results",
    ]);
  });

  it("should navigate between filter views", () => {
    cy.prompt([
      "Click the 'Backlog' button in the sidebar",
      "Verify the header shows 'backlog'",
      "Click the 'Today' button in the sidebar",
      "Verify the header shows 'today'",
      "Click the 'Selected' button in the sidebar",
      "Verify the header shows 'selected'",
    ]);
  });
});
