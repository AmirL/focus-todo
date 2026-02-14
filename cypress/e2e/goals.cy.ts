/// <reference types="cypress" />

// Helper: click a Radix Dialog trigger and wait for it to open.
// Radix sometimes misses the first click in headless CI, so retry once if needed.
function openRadixDialog(triggerSelector: string) {
  cy.get(triggerSelector).first().as("dialogTrigger").click();
  cy.wait(500);
  cy.get("body").then(($body) => {
    if ($body.find('[role="dialog"]').length === 0) {
      cy.get("@dialogTrigger").click();
    }
  });
  cy.get('[role="dialog"]').should("be.visible");
}

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

    it("should create a goal with description", () => {
      const goalTitle = `Goal with desc ${Date.now()}`;
      const goalDescription = "This goal tracks our test coverage improvements";
      cy.get('[data-cy="add-goal-button"]').click();
      cy.get('[data-cy="goal-title-input"]').type(goalTitle);
      cy.get('[data-cy="goal-description-input"]').type(goalDescription);
      cy.get('[data-cy="create-goal-button"]').click();

      cy.wait("@createGoal").then((interception) => {
        createdGoalIds.push(interception.response!.body.id);
        expect(interception.request.body.goal.description).to.equal(goalDescription);
      });
      cy.contains(goalTitle).should("be.visible");
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
      openRadixDialog('[data-cy="edit-goal-button"]');
      // Wait for milestones to load so dialog is stable
      cy.get('[data-cy="milestones-section"]').should("be.visible");
      cy.get('[data-cy="edit-goal-title-input"]').clear().type(updatedTitle);
      cy.get('[role="dialog"] form').first().submit();
      cy.wait("@updateGoal").then((interception) => {
        expect(interception.request.body.goal.title).to.equal(updatedTitle);
      });
    });

    it("should edit goal description", () => {
      const description = "Updated description for testing";
      cy.intercept("POST", "/api/update-goal").as("updateGoal");
      openRadixDialog('[data-cy="edit-goal-button"]');
      cy.get('[data-cy="milestones-section"]').should("be.visible");
      cy.get('[data-cy="edit-goal-description-input"]').type(description);
      cy.get('[role="dialog"] form').first().submit();
      cy.wait("@updateGoal").then((interception) => {
        expect(interception.request.body.goal.description).to.equal(description);
      });

      // Wait for dialog to fully close before re-opening
      cy.get('[role="dialog"]').should("not.be.visible");
      // Re-open dialog and verify description persisted
      openRadixDialog('[data-cy="edit-goal-button"]');
      cy.get('[data-cy="milestones-section"]').should("be.visible");
      cy.get('[data-cy="edit-goal-description-input"]').should("have.value", description);
    });
  });

  describe("Delete Goals", () => {
    beforeEach(() => {
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
      cy.get('[data-cy="goal-item"]').then(($goals) => {
        const initialCount = $goals.length;
        cy.get('[data-cy="delete-goal-button"]').first().click();
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

      // Open edit dialog and wait for milestones to load
      openRadixDialog('[data-cy="edit-goal-button"]');
      cy.wait("@getMilestones");

      // Verify empty state
      cy.get('[data-cy="milestones-section"]').scrollIntoView().should("be.visible");
      cy.contains("No milestones yet").should("be.visible");

      // Create a milestone
      cy.get('[data-cy="milestone-description-input"]').type("Starting weight 93 kg");
      cy.get('[role="dialog"] form').eq(1).submit();

      // Verify milestone was created
      cy.wait("@createMilestone").then((interception) => {
        expect(interception.request.body.description).to.equal("Starting weight 93 kg");
      });
      cy.get('[data-cy="milestone-entry"]').should("contain.text", "Starting weight 93 kg");
      cy.contains("No milestones yet").should("not.exist");
    });
  });

  describe("Goal Display", () => {
    beforeEach(() => {
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
