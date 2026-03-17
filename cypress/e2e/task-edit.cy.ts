/// <reference types="cypress" />

describe("Task Edit Form", () => {
  let createdTaskIds: number[] = [];
  let taskName: string;

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.visit("/");
    cy.waitForAppLoad();

    // Create a task to edit
    taskName = `Edit form test ${Date.now()}`;
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

  function openEditDialog() {
    cy.get('[data-cy^="edit-task-"]').first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-cy="save-task-changes-button"]', { timeout: 5000 }).should("exist");
  }

  it("should open edit dialog and display current task name", () => {
    openEditDialog();
    cy.get('#name').invoke("val").should("include", "Edit form test");
  });

  it("should edit task name and save", () => {
    const newName = `Renamed task ${Date.now()}`;
    openEditDialog();
    cy.get('#name').clear().type(newName);
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.name).to.equal(newName);
    });
    cy.contains(newName).should("be.visible");
  });

  it("should edit task details via markdown editor", () => {
    openEditDialog();
    // The MarkdownAreaField has View/Edit tabs - click the Edit tab within the dialog
    cy.get('[role="dialog"]').find('[role="tablist"]').contains("Edit").click();
    cy.get('[role="dialog"]').find("textarea#details").clear().type("Updated details content");
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.details).to.equal("Updated details content");
    });
  });

  it("should change task category in edit form", () => {
    openEditDialog();
    cy.get('[data-cy="category-selector"]').click();
    cy.get('[role="option"]').last().click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.listId).to.be.a("number");
    });
  });

  it("should change estimated duration in edit form", () => {
    openEditDialog();
    cy.get('[data-cy="duration-selector"]').click({ force: true });
    cy.contains("button", "30 minutes").click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.estimatedDuration).to.equal(30);
    });
  });

  it("should toggle blocker status in edit form", () => {
    openEditDialog();
    cy.get('[data-cy="blocker-toggle"]').click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.isBlocker).to.equal(true);
    });
  });

  it("should toggle starred status in edit form", () => {
    openEditDialog();
    cy.get('[data-cy="starred-toggle"]').click();
    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.selectedAt).to.not.be.null;
    });
  });

  it("should edit multiple fields at once and save", () => {
    const newName = `Multi-edit task ${Date.now()}`;
    openEditDialog();

    cy.get('#name').clear().type(newName);
    cy.get('[data-cy="duration-selector"]').click({ force: true });
    cy.contains("button", "1 hour").click();
    cy.get('[data-cy="blocker-toggle"]').click();

    cy.get('[data-cy="save-task-changes-button"]').click();
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body.task.name).to.equal(newName);
      expect(interception.request.body.task.estimatedDuration).to.equal(60);
      expect(interception.request.body.task.isBlocker).to.equal(true);
    });
    cy.contains(newName).should("be.visible");
  });

  it("should close edit dialog without saving on Escape", () => {
    openEditDialog();
    cy.get('#name').clear().type("Should not be saved");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains(taskName).should("exist");
  });
});
