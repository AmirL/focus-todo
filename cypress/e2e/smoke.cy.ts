/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should complete a full task management workflow", () => {
    cy.prompt([
      // Create a task
      "Click the add task button to open the task creation form",
      "Enter 'Complete smoke test' as the task name",
      "Save the task",
      "Verify the task appears in the list",
      // Star the task
      "Find the 'Complete smoke test' task",
      "Click the star or select button to mark it as selected",
      "Verify the task is now starred",
      // Navigate to Selected filter
      "Click on the Selected filter in the navigation",
      "Verify the 'Complete smoke test' task appears in the Selected view",
      // Complete the task
      "Click the checkbox to mark 'Complete smoke test' as done",
      "Verify the task shows as completed",
    ]);
  });

  it("should complete a goal tracking workflow", () => {
    cy.prompt([
      // Create a goal
      "Click the add goal button to create a new goal",
      "Enter 'Finish project' as the goal title",
      "Save the goal",
      "Verify the goal appears in the goals section with 0% progress",
      // Update progress
      "Click on the 'Finish project' goal to edit it",
      "Set the progress to 50 percent",
      "Save the changes",
      "Verify the progress bar shows 50%",
    ]);
  });

  it("should demonstrate responsive design on desktop", () => {
    cy.viewport(1280, 720);
    cy.prompt([
      "Verify the sidebar navigation is visible on desktop",
      "Verify the main content area shows the task list",
    ]);
  });

  it("should demonstrate responsive design on tablet", () => {
    cy.viewport("ipad-2");
    cy.prompt(["Verify the layout adapts to tablet size"]);
  });

  it("should demonstrate responsive design on mobile", () => {
    cy.viewport("iphone-x");
    cy.prompt([
      "Verify the mobile menu toggle is visible",
      "Click the mobile menu toggle",
      "Verify the navigation menu opens",
    ]);
  });

  it("should handle search functionality", () => {
    cy.prompt([
      // First create a task to search for
      "Create a task named 'Searchable task item'",
      // Open search
      "Open the search spotlight using Cmd+K or clicking the search icon",
      "Type 'Searchable' in the search input",
      "Verify 'Searchable task item' appears in the search results",
      "Click on the search result to select it",
      "Verify the task is highlighted or selected in the main view",
    ]);
  });

  it("should navigate between all main views", () => {
    cy.prompt([
      "Click on the Backlog filter and verify the view changes",
      "Click on the Selected filter and verify the view changes",
      "Click on the Today filter and verify the view changes",
      "Click on the Tomorrow filter and verify the view changes",
      "Click on the Future filter and verify the view changes",
      "Verify each navigation successfully loads the corresponding view",
    ]);
  });
});
