/// <reference types="cypress" />

describe("Smoke Tests - Critical User Flows", () => {
  let createdTaskIds: number[] = [];
  let createdGoalIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/create-goal").as("createGoal");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    cy.apiCleanupGoals(createdGoalIds);
    createdTaskIds = [];
    createdGoalIds = [];
  });

  it("should create and complete a task", () => {
    const taskName = `Smoke test task ${Date.now()}`;
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(taskName);
    cy.get('[data-cy="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");

    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    // Complete the task - use role="checkbox" for Radix checkbox
    cy.get('[data-cy^="task-"]').contains(taskName).parents('[data-cy^="task-"]').find('[role="checkbox"]').click();
    cy.get(".line-through").should("exist");
  });

  it("should star a task and view in Selected", () => {
    // Create a task first so there's one to star
    const taskName = `Star test task ${Date.now()}`;
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(taskName);
    cy.get('[data-cy="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    // Hover and click star, wait for update to complete
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.get('[data-cy^="task-"]').first().trigger('mouseover');
    cy.get('[data-cy^="star-task-"]').first().click({ force: true });
    cy.wait("@updateTask");
    // Navigate to Selected and verify task appears there
    cy.get('[data-cy="filter-selected"]').click();
    cy.contains(taskName).should("be.visible");
  });

  it("should create a goal", () => {
    const goalTitle = `Test Goal ${Date.now()}`;
    cy.get('[data-cy="add-goal-button"]').click();
    cy.get('[data-cy="goal-title-input"]').type(goalTitle);
    cy.get('[data-cy="create-goal-button"]').click();
    cy.contains(goalTitle).should("be.visible");

    cy.wait("@createGoal").then((interception) => {
      createdGoalIds.push(interception.response!.body.id);
    });
  });

  it("should show sidebar on desktop", () => {
    cy.viewport(1280, 720);
    cy.contains("Backlog").should("be.visible");
    cy.contains("Today").should("be.visible");
    cy.contains("Tomorrow").should("be.visible");
  });

  it("should show menu button on mobile", () => {
    cy.viewport("iphone-x");
    cy.get('[data-cy="mobile-menu-button"]').click();
    cy.contains("Backlog").should("be.visible");
  });

  it("should search for tasks", () => {
    // Create a task first so there's something to find
    const taskName = `Searchable smoke task ${Date.now()}`;
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(taskName);
    cy.get('[data-cy="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    cy.get('[data-cy="search-button"]').click();
    cy.get('input[placeholder*="Search"]').type("Searchable smoke");
    // Verify search results list appears (ul with divide-y class)
    cy.get('ul.divide-y').should("exist");
  });

  it("should navigate between filter views", () => {
    cy.get('[data-cy="filter-backlog"]').click();
    cy.contains("backlog").should("exist");
    cy.get('[data-cy="filter-today"]').click();
    cy.contains("today").should("exist");
    cy.get('[data-cy="filter-selected"]').click();
    cy.contains("selected").should("exist");
  });
});
