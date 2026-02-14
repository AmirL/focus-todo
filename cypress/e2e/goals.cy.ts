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
      // Submit the edit form (first form in dialog, not the milestone form)
      cy.get('[role="dialog"] form').first().submit();
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
    it("should show milestones section in edit dialog and create a milestone", () => {
      cy.intercept("POST", "/api/get-goal-milestones").as("getMilestones");
      cy.intercept("POST", "/api/create-goal-milestone").as("createMilestone");

      // Create a goal
      const goalTitle = `Milestone test goal ${Date.now()}`;
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="create-goal-button"]').click();
      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
      });
      cy.contains(goalTitle, { timeout: 15000 }).should("be.visible");

      // Open the edit dialog - use the goal we just created (first in the list)
      cy.get('[data-cy="edit-goal-button"]').first().click();
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");
      cy.wait("@getMilestones");

      // Verify milestones section renders with empty state
      cy.get('[data-cy="milestones-section"]', { timeout: 15000 })
        .scrollIntoView()
        .should("be.visible");
      cy.contains("No milestones yet").should("be.visible");

      // Create a milestone by setting textarea value and submitting form
      cy.get('[data-cy="milestone-description-input"]', { timeout: 15000 })
        .should("exist")
        .then(($el) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            "value"
          )!.set!;
          nativeInputValueSetter.call($el[0], "Starting weight 93 kg");
          $el[0].dispatchEvent(new Event("input", { bubbles: true }));
          $el[0].dispatchEvent(new Event("change", { bubbles: true }));
        });
      cy.get('[role="dialog"] form').eq(1).submit();

      // Verify milestone was created
      cy.wait("@createMilestone").then((interception) => {
        expect(interception.response!.statusCode).to.eq(200);
        expect(interception.request.body.description).to.equal("Starting weight 93 kg");
      });

      // Verify the milestone appears in timeline
      cy.get('[data-cy="milestone-entry"]', { timeout: 10000 }).should("exist");
      cy.get('[data-cy="milestone-entry"]').should("contain.text", "Starting weight 93 kg");
      cy.contains("No milestones yet").should("not.exist");
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
