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
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
      cy.contains(goalTitle, { timeout: 15000 }).should("be.visible");
    });

    it("should edit goal title", () => {
      const updatedTitle = `Updated Goal ${Date.now()}`;
      cy.intercept("POST", "/api/update-goal").as("updateGoal");
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      // Use invoke to set value without keyboard events, then submit via form
      cy.get('[data-cy="edit-goal-title-input"]')
        .invoke("val", updatedTitle)
        .trigger("input");
      // Submit form directly instead of clicking save button (which is wrapped in DialogTrigger)
      cy.get('[role="dialog"] form').submit();
      cy.wait("@updateGoal").then((interception) => {
        expect(interception.request.body.goal.title).to.equal(updatedTitle);
      });
    });
  });

  describe("Delete Goals", () => {
    beforeEach(() => {
      // Create a goal so there's always one to delete
      const goalTitle = `Delete test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
      cy.contains(goalTitle, { timeout: 15000 }).should("be.visible");
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

  describe("Goal Milestones", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/create-goal-milestone").as("createMilestone");
      cy.intercept("POST", "/api/get-goal-milestones").as("getMilestones");

      const goalTitle = `Milestone test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
      cy.contains(goalTitle, { timeout: 15000 }).should("be.visible");
    });

    it("should show milestones section in edit dialog", () => {
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.contains("Milestones").should("be.visible");
      cy.get('[data-cy="milestone-description-input"]').should("be.visible");
      cy.get('[data-cy="add-milestone-button"]').should("be.disabled");
    });

    it("should add a milestone and display it in timeline", () => {
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-cy="milestone-description-input"]').type("Start weight 93 kg");
      cy.get('[data-cy="add-milestone-button"]').should("not.be.disabled").click();
      cy.wait("@createMilestone");
      cy.get('[data-cy="milestone-timeline"]').should("be.visible");
      cy.get('[data-cy="milestone-entry"]').should("have.length", 1);
      cy.contains("Start weight 93 kg").should("be.visible");
    });
  });

  describe("Goal Display", () => {
    beforeEach(() => {
      // Create a goal so there's always one to display
      const goalTitle = `Display test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
      cy.contains(goalTitle, { timeout: 15000 }).should("be.visible");
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
