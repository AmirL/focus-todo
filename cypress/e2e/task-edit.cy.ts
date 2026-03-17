/// <reference types="cypress" />

describe("Task Edit Form", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.visit("/");
    cy.waitForAppLoad();

    // Create a task to edit
    const taskName = `Edit form test ${Date.now()}`;
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

  it("should open edit dialog and display task name", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-cy="task-name-input"]').should("have.value", /Edit form test/);
    // Close dialog
    cy.get('[role="dialog"]').find('button[type="submit"]').should("exist");
  });

  it("should edit task name and save", () => {
    const newName = `Renamed task ${Date.now()}`;
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('#name').clear().type(newName);
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.name).to.equal(newName);
    });
    cy.contains(newName).should("be.visible");
  });

  it("should edit task details via markdown editor", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    // Switch to edit tab for details
    cy.get('[role="dialog"]').contains("Edit").click();
    cy.get('[role="dialog"]').find("textarea#details").clear().type("Updated details content");
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.details).to.equal("Updated details content");
    });
  });

  it("should change task category in edit form", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    // Click the category selector
    cy.get('[data-cy="category-selector"]').click();
    // Select a different category from the dropdown
    cy.get('[role="option"]').last().click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.listId).to.be.a("number");
    });
  });

  it("should change estimated duration in edit form", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    // Click the duration selector
    cy.get('[data-cy="duration-selector"]').click({ force: true });
    // Select 30 minutes from the popover
    cy.contains("button", "30 minutes").click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.estimatedDuration).to.equal(30);
    });
  });

  it("should toggle blocker status in edit form", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    // Click the blocker toggle
    cy.get('[data-cy="blocker-toggle"]').click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.isBlocker).to.equal(true);
    });
  });

  it("should toggle starred status in edit form", () => {
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    // Click the starred toggle
    cy.get('[data-cy="starred-toggle"]').click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.selectedAt).to.not.be.null;
    });
  });

  it("should edit multiple fields at once and save", () => {
    const newName = `Multi-edit task ${Date.now()}`;
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");

    // Change name
    cy.get('#name').clear().type(newName);

    // Change duration
    cy.get('[data-cy="duration-selector"]').click({ force: true });
    cy.contains("button", "1 hour").click();

    // Toggle blocker
    cy.get('[data-cy="blocker-toggle"]').click();

    // Save all changes
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.name).to.equal(newName);
      expect(interception.request.body.task.estimatedDuration).to.equal(60);
      expect(interception.request.body.task.isBlocker).to.equal(true);
    });
    cy.contains(newName).should("be.visible");
  });

  it("should close edit dialog without saving on Escape", () => {
    const originalName = `Edit form test`;
    cy.get('[data-cy^="edit-task-"]').first().click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('#name').clear().type("Should not be saved");
    // Press Escape to close
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    // Original name should still be visible
    cy.contains(originalName).should("exist");
  });
});
