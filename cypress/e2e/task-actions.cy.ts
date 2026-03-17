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
      cy.contains("30 minutes").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(30);
      });
      cy.get('[data-cy^="estimated-time-task-"]').first().should("contain", "30m");
    });

    it("should change estimated duration to a different value", () => {
      // First set a duration
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.contains("30 minutes").click();
      cy.wait("@updateTask");

      // Now change it
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.contains("1 hour").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(60);
      });
      cy.get('[data-cy^="estimated-time-task-"]').first().should("contain", "1h");
    });

    it("should clear estimated duration via None option", () => {
      // First set a duration
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.contains("30 minutes").click();
      cy.wait("@updateTask");

      // Now clear it by selecting None
      cy.get('[data-cy^="estimated-time-task-"]').first().click();
      cy.contains("None").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.be.null;
      });
      cy.get('[data-cy^="estimated-time-task-"]').first().should("contain", "Set time");
    });
  });

  describe("Mark as Blocker", () => {
    it("should toggle blocker on", () => {
      cy.get('[data-cy^="blocker-task-"]').first().click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.isBlocker).to.equal(true);
      });
    });

    it("should toggle blocker off after enabling", () => {
      // Enable blocker
      cy.get('[data-cy^="blocker-task-"]').first().click();
      cy.wait("@updateTask");

      // Disable blocker
      cy.get('[data-cy^="blocker-task-"]').first().click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.isBlocker).to.equal(false);
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
    it("should open snooze calendar popover", () => {
      cy.get('[data-cy^="task-"]').first().scrollIntoView().trigger("mouseover");
      cy.wait(500);
      cy.get('[data-cy^="snooze-task-"]').first().scrollIntoView().click({ force: true });
      cy.wait(500);

      // If popover didn't open, retry with full pointer event sequence
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
      // Select a day to snooze
      cy.get('[role="grid"] button').not(".day-outside").not("[disabled]").last().click({ force: true });
      cy.wait("@updateTask");
    });
  });
});
