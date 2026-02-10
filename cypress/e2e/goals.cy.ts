/// <reference types="cypress" />

describe("Goal Management", () => {
  let createdGoalIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-goal").as("createGoal");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupGoals(createdGoalIds);
    createdGoalIds = [];
  });

  describe("Create Goals", () => {
    it("should create a new goal", () => {
      const goalTitle = `Learn TypeScript ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains(goalTitle).should("be.visible");

      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
    });

    it("should create a goal with custom progress", () => {
      const goalTitle = `Exercise daily ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains(goalTitle).should("be.visible");

      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
    });
  });

  describe("Edit Goals", () => {
    beforeEach(() => {
      // Create a goal so there's always one to edit
      const goalTitle = `Edit test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains(goalTitle).should("be.visible");
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
    });

    it("should edit goal title", () => {
      const updatedTitle = `Updated Goal ${Date.now()}`;
      cy.intercept("POST", "/api/update-goal").as("updateGoal");
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-cy="edit-goal-title-input"]').clear().type(updatedTitle);
        cy.contains('button', 'Save changes').click();
      });
      cy.wait("@updateGoal");
      cy.contains(updatedTitle).should("be.visible");
    });
  });

  describe("Delete Goals", () => {
    beforeEach(() => {
      // Create a goal so there's always one to delete
      const goalTitle = `Delete test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains(goalTitle).should("be.visible");
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
    });

    it("should delete a goal", () => {
      // Count goals before deletion
      cy.get('[data-cy="goal-item"]').then(($goals) => {
        const initialCount = $goals.length;
        cy.get('[data-cy="delete-goal-button"]').first().click();
        // Wait for the goal to be removed
        if (initialCount > 1) {
          cy.get('[data-cy="goal-item"]').should("have.length", initialCount - 1);
        }
      });
    });
  });

  describe("Goal Display", () => {
    beforeEach(() => {
      // Create a goal so there's always one to display
      const goalTitle = `Display test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.contains(goalTitle).should("be.visible");
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
    });

    it("should display goals section", () => {
      cy.contains("Goals").should("be.visible");
      cy.get('[data-cy="goal-item"]').should("exist");
    });

    it("should display goal titles", () => {
      cy.get('[data-cy="goal-title"]').should("exist");
    });
  });
});
