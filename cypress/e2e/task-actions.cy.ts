/// <reference types="cypress" />

describe("Task Actions", () => {
  let createdTaskIds: number[] = [];
  let taskId: number;

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
      taskId = interception.response!.body.id;
      createdTaskIds.push(taskId);
    });
    cy.contains(taskName, { timeout: 15000 }).should("be.visible");
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  // Helper to get a data-cy element scoped to the created task row
  function taskEl(dataCyPrefix: string) {
    return cy.get(`[data-cy="task-${taskId}"]`).find(`[data-cy^="${dataCyPrefix}"]`);
  }

  describe("Estimated Duration", () => {
    it("should set estimated duration via inline button", () => {
      taskEl("estimated-time-task-").click();
      cy.get('[role="menuitem"]', { timeout: 10000 }).contains("30 minutes").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(30);
      });
    });

    it("should change estimated duration to a different value", () => {
      // First set 30 minutes
      taskEl("estimated-time-task-").click();
      cy.get('[role="menuitem"]', { timeout: 10000 }).contains("30 minutes").click();
      cy.wait("@updateTask");

      // Wait for dropdown to close and DOM to settle after React Query refetch
      cy.get('[role="menuitem"]').should("not.exist");
      taskEl("estimated-time-task-").should("be.visible").click();
      cy.get('[role="menuitem"]', { timeout: 10000 }).contains("1 hour").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.equal(60);
      });
    });

    it("should clear estimated duration", () => {
      // First set a duration
      taskEl("estimated-time-task-").click();
      cy.get('[role="menuitem"]', { timeout: 10000 }).contains("30 minutes").click();
      cy.wait("@updateTask");

      // Wait for dropdown to close and DOM to settle after React Query refetch
      cy.get('[role="menuitem"]').should("not.exist");
      taskEl("estimated-time-task-").should("be.visible").click();
      cy.get('[role="menuitem"]', { timeout: 10000 }).contains("None").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.estimatedDuration).to.be.null;
      });
    });
  });

  describe("Mark as Blocker", () => {
    it("should toggle blocker on via API", () => {
      taskEl("blocker-task-").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.isBlocker).to.equal(true);
      });
    });
  });

  describe("Star/Select Task", () => {
    it("should star a task and verify it appears in Selected filter", () => {
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      taskEl("star-task-").click({ force: true });
      cy.wait("@updateTask");
      cy.get('[data-cy="filter-selected"]').click();
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 10000 }).should("exist");
    });
  });

  describe("Delete Task", () => {
    it("should soft-delete a task", () => {
      taskEl("delete-task-").click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.deletedAt).to.not.be.null;
      });
      // Verify deleted state appears or task is removed from active list
      cy.get(`[data-cy="task-${taskId}"]`).should(($el) => {
        // Either the task shows deleted state or has been removed
        if ($el.length > 0) {
          expect($el.attr("data-state")).to.equal("deleted");
        }
      });
    });
  });

  describe("Drag Reorder", () => {
    it("should show drag handles on task hover", () => {
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="drag-handle-${taskId}"]`).should("exist");
    });

    it("should have drag handle with correct cursor style", () => {
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="drag-handle-${taskId}"]`)
        .should("have.css", "cursor", "grab");
    });
  });

  describe("Move Between Lists", () => {
    it("should move a task to a different list via edit form", () => {
      // Open edit dialog - hover first to reveal the button
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      taskEl("edit-task-").click({ force: true });
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");

      // Get current category, then switch to a different one
      cy.get('[data-cy="category-selector"]').click();
      cy.get('[role="option"]').last().click();

      cy.get('[data-cy="save-task-changes-button"]').click();
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.listId).to.be.a("number");
      });
    });
  });

  describe("Bulk Selection", () => {
    it("should temporarily select a task in the Selected filter", () => {
      // First star the task so it appears in the Selected filter
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      taskEl("star-task-").click({ force: true });
      cy.wait("@updateTask");

      // Navigate to Selected filter
      cy.get('[data-cy="filter-selected"]').click();
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 10000 }).should("exist");

      // Click the task row (not a button) to temporarily select it
      cy.get(`[data-cy="task-${taskId}"]`).find('.font-medium').first().click();

      // Verify the task shows selection highlight (bg-blue-50)
      cy.get(`[data-cy="task-${taskId}"]`).should("have.class", "bg-blue-50");
    });

    it("should deselect a temporarily selected task by clicking again", () => {
      // Star the task
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      taskEl("star-task-").click({ force: true });
      cy.wait("@updateTask");

      // Go to Selected filter
      cy.get('[data-cy="filter-selected"]').click();
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 10000 }).should("exist");

      // Click to select
      cy.get(`[data-cy="task-${taskId}"]`).find('.font-medium').first().click();
      cy.get(`[data-cy="task-${taskId}"]`).should("have.class", "bg-blue-50");

      // Click again to deselect
      cy.get(`[data-cy="task-${taskId}"]`).find('.font-medium').first().click();
      cy.get(`[data-cy="task-${taskId}"]`).should("not.have.class", "bg-blue-50");
    });
  });

  describe("Snooze Task", () => {
    it("should open snooze calendar and select a date", () => {
      cy.get(`[data-cy="task-${taskId}"]`).scrollIntoView().trigger("mouseover");
      cy.wait(500);
      taskEl("snooze-task-").scrollIntoView().click({ force: true });
      cy.wait(500);

      // If popover didn't open, retry
      cy.get("body").then(($body) => {
        if ($body.find('[role="grid"]').length === 0) {
          cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
          cy.wait(300);
          taskEl("snooze-task-")
            .trigger("pointerdown", { force: true })
            .trigger("pointerup", { force: true })
            .trigger("click", { force: true });
        }
      });

      cy.get('[role="grid"]', { timeout: 15000 }).should("be.visible");
      cy.get('[role="grid"] button').not("[disabled]").not('[aria-disabled="true"]').last().click({ force: true });
      cy.wait("@updateTask");
    });
  });
});
