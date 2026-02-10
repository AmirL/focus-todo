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
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");

    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    // Complete the task - use role="checkbox" for Radix checkbox
    cy.get('[data-testid^="task-"]').contains(taskName).parents('[data-testid^="task-"]').find('[role="checkbox"]').click();
    cy.get(".line-through").should("exist");
  });

  it("should star a task and view in Selected", () => {
    // Create a task first so there's one to star
    const taskName = `Star test task ${Date.now()}`;
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    // Hover and click star
    cy.get('[data-testid^="task-"]').first().trigger('mouseover');
    cy.get('[data-testid^="star-task-"]').first().click({ force: true });
    // Navigate to Selected and verify task appears there
    cy.prompt(["Click the 'Selected' button in the sidebar"]);
    cy.get('[data-testid^="task-"]').should("exist");
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
    cy.prompt(["Click the hamburger menu button to open the sidebar"]);
    cy.contains("Backlog").should("be.visible");
  });

  it("should search for tasks", () => {
    // Create a task first so there's something to find
    const taskName = `Searchable smoke task ${Date.now()}`;
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });

    cy.prompt(["Click the search icon button in the header"]);
    cy.get('input[placeholder*="Search"]').type("Searchable smoke");
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
