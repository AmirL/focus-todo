/// <reference types="cypress" />

describe("Task Actions", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.visit("/");
    cy.waitForAppLoad();

    // Create a task to act on
    const taskName = `Actions test ${Date.now()}`;
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(taskName);
    cy.get('[data-cy="save-task-button"]').click();
    cy.wait("@createTask").then((interception) => {
      createdTaskIds.push(interception.response!.body.id);
    });
    cy.contains(taskName, { timeout: 15000 }).should("be.visible");
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  describe("Estimated Duration", () => {
    it("should set estimated duration via inline button", () => {
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      // Radix DropdownMenu renders in a portal - use role selector
      cy.get('[role="menuitem"]').contains("30 minutes").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(30);
      });
    });

    it("should change estimated duration to a different value", () => {
      // First set 30 minutes
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.get('[role="menuitem"]').contains("30 minutes").click();
      cy.wait("@updateTask");

      // Now change to 1 hour
      cy.wait(1000); // Let React Query refetch settle
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.get('[role="menuitem"]').contains("1 hour").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(60);
      });
    });

    it("should clear estimated duration", () => {
      // First set a duration
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.get('[role="menuitem"]').contains("30 minutes").click();
      cy.wait("@updateTask");

      // Clear it
      cy.wait(1000);
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.get('[role="menuitem"]').contains("None").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.be.null;
      });
    });
  });

  describe("Mark as Blocker", () => {
    it("should toggle blocker on via API", () => {
      cy.get('[data-cy^="blocker-task-"]').first().click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.isBlocker).to.equal(true);
      });
    });
  });

  describe("Star/Select Task", () => {
    it("should star a task and verify it appears in Selected filter", () => {
      cy.get('[data-cy^="task-"]')
        .first()
        .invoke("text")
        .then((taskText) => {
          cy.get('[data-cy^="task-"]').first().trigger("mouseover");
          cy.get('[data-cy^="star-task-"]').first().click({ force: true });
          cy.wait("@updateTask");
          cy.get('[data-cy="filter-selected"]').click();
          cy.contains(taskText.slice(0, 20)).should("exist");
        });
    });
  });

  describe("Delete Task", () => {
    it("should soft-delete a task", () => {
      cy.get('[data-cy^="delete-task-"]').first().click();
      cy.get(".line-through").should("exist");
    });
  });

  describe("Snooze Task", () => {
    it("should open snooze calendar and select a date", () => {
      cy.get('[data-cy^="task-"]').first().scrollIntoView().trigger("mouseover");
      cy.wait(500);
      cy.get('[data-cy^="snooze-task-"]').first().scrollIntoView().click({ force: true });
      cy.wait(500);

      // If popover didn't open, retry
      cy.get("body").then(($body) => {
        if ($body.find('[role="grid"]').length === 0) {
          cy.get('[data-cy^="task-"]').first().trigger("mouseover");
          cy.wait(300);
          cy.get('[data-cy^="snooze-task-"]')
            .first()
            .trigger("pointerdown", { force: true })
            .trigger("pointerup", { force: true })
            .trigger("click", { force: true });
        }
      });

      cy.get('[role="grid"]', { timeout: 15000 }).should("be.visible");
      cy.get('[role="grid"] button').not(".day-outside").not("[disabled]").last().click({ force: true });
      cy.wait("@updateTask");
    });
  });
});
