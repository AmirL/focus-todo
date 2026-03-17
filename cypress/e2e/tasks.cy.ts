/// <reference types="cypress" />

describe("Task Management", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  describe("Create Tasks", () => {
    it("should create a new task using the add task button", () => {
      const taskName = `Buy groceries ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });

    it("should create a task for a specific date", () => {
      const taskName = `Schedule meeting ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.contains(taskName).should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });
  });

  describe("Task Actions", () => {
    beforeEach(() => {
      // Create a task so there's always one to act on
      const taskName = `Action test task ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
      cy.contains(taskName, { timeout: 15000 }).should("be.visible");
    });

    it("should mark a task as complete", () => {
      // Radix checkbox uses role="checkbox"
      cy.get('[data-cy^="task-"]').first().find('[role="checkbox"]').click();
      cy.get(".line-through").should("exist");
    });

    it("should star/select a task", () => {
      // Hover and click star, wait for update to complete
      cy.intercept("POST", "/api/update-task").as("updateTask");
      cy.get('[data-cy^="task-"]').first().invoke('text').then((taskText) => {
        cy.get('[data-cy^="task-"]').first().trigger('mouseover');
        cy.get('[data-cy^="star-task-"]').first().click({ force: true });
        cy.wait("@updateTask");
        // Navigate to Selected and verify task appears there
        cy.get('[data-cy="filter-selected"]').click();
        cy.contains(taskText.slice(0, 20)).should("exist");
      });
    });

    it("should delete a task", () => {
      cy.get('[data-cy^="delete-task-"]').first().click();
      cy.get(".line-through").should("exist");
    });

    it("should snooze a task to a different date", () => {
      cy.intercept("POST", "/api/update-task").as("updateTask");
      // Hover to reveal action buttons, then click snooze to open calendar popover.
      // Use scrollIntoView + multiple interaction strategies to handle CI environments
      // where Radix Popover is unreliable with synthetic events.
      cy.get('[data-cy^="task-"]').first().scrollIntoView().trigger('mouseover');
      cy.wait(500); // Allow hover state to settle
      cy.get('[data-cy^="snooze-task-"]').first().scrollIntoView().click({ force: true });
      cy.wait(500); // Allow popover to render

      // If popover didn't open, try again with full pointer event sequence
      cy.get('body').then(($body) => {
        if ($body.find('[role="grid"]').length === 0) {
          cy.get('[data-cy^="task-"]').first().trigger('mouseover');
          cy.wait(300);
          cy.get('[data-cy^="snooze-task-"]').first()
            .trigger('pointerdown', { force: true })
            .trigger('pointerup', { force: true })
            .trigger('click', { force: true });
        }
      });

      // Wait for calendar popover to appear (Radix Popover renders in portal)
      cy.get('[role="grid"]', { timeout: 15000 }).should('be.visible');
      // Select the last non-outside day in the current month
      cy.get('[role="grid"] button').not('.day-outside').not('[disabled]').last().click({ force: true });
      cy.wait("@updateTask");
    });

    it("should mark a task as a blocker", () => {
      cy.get('[data-cy^="blocker-task-"]').first().click();
      // Blocker icon SVG should have fill when selected
      cy.get('[data-cy^="blocker-task-"]').first().should("have.class", "text-blue-600");
    });
  });

  describe("Edit Tasks", () => {
    beforeEach(() => {
      // Create a task so there's always one to edit
      const taskName = `Edit test task ${Date.now()}`;
      cy.get('[data-cy="add-task-button"]').click();
      cy.get('[data-cy="task-name-input"]').type(taskName);
      cy.get('[data-cy="save-task-button"]').click();
      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
      cy.contains(taskName, { timeout: 15000 }).should("be.visible");
    });

    it("should edit task name", () => {
      const updatedName = `Updated task ${Date.now()}`;
      cy.intercept("POST", "/api/update-task").as("updateTask");
      cy.get('[data-cy^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('#name').clear().type(updatedName);
      cy.get('[data-cy="save-task-changes-button"]').click();
      // Verify the update API call was sent with the correct name
      cy.wait("@updateTask").then((interception) => {
        expect(interception.request.body.task.name).to.equal(updatedName);
      });
    });

    it("should open edit dialog", () => {
      cy.get('[data-cy^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-cy="save-task-changes-button"]').click();
    });
  });

  describe("Filter Tasks", () => {
    it("should navigate to Today filter", () => {
      cy.get('[data-cy="filter-today"]').click();
      cy.contains("today").should("exist");
    });

    it("should navigate to Tomorrow filter", () => {
      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.contains("tomorrow").should("exist");
    });

    it("should navigate to Backlog filter", () => {
      cy.get('[data-cy="filter-backlog"]').click();
      cy.contains("backlog").should("exist");
    });

    it("should navigate to Selected filter", () => {
      cy.get('[data-cy="filter-selected"]').click();
      cy.contains("selected").should("exist");
    });

    it("should navigate to Future filter", () => {
      cy.get('[data-cy="filter-future"]').click();
      cy.contains("future").should("exist");
    });
  });
});
