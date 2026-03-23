/// <reference types="cypress" />

describe("Task Details Interactions", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.intercept("POST", "/api/update-task").as("updateTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  function createTaskWithDetails(name: string, details: string): Cypress.Chainable<number> {
    // Create the task first
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(name);
    cy.get('[data-cy="save-task-button"]').click();

    return cy.wait("@createTask").then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 15000 }).should("exist");

      // Now edit the task to add details via the edit dialog
      cy.get(`[data-cy="task-${taskId}"]`).trigger("mouseover");
      cy.get(`[data-cy="task-${taskId}"]`).find('[data-cy^="edit-task-"]').click({ force: true });
      cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");

      // Switch to edit mode and add details
      cy.get('[role="dialog"]').find('[role="tablist"]').contains("Edit").click();
      cy.get('[role="dialog"]').find("textarea#details").clear().type(details, { parseSpecialCharSequences: false });
      cy.get('[data-cy="save-task-changes-button"]').click();
      cy.wait("@updateTask");

      return cy.wrap(taskId);
    });
  }

  it("should expand and collapse task details", () => {
    const taskName = `Details test ${Date.now()}`;
    createTaskWithDetails(taskName, "This is a test description with some content.").then((taskId) => {
      // Details should not be visible initially
      cy.get('[data-cy="task-details"]').should("not.exist");

      // Click the description indicator to expand
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="description-indicator"]')
        .click();

      // Details should now be visible
      cy.get('[data-cy="task-details"]').should("be.visible");
      cy.get('[data-cy="task-details"]').should("contain.text", "This is a test description");

      // Click on details to collapse
      cy.get('[data-cy="task-details"]').click();
      cy.get('[data-cy="task-details"]').should("not.exist");
    });
  });

  it("should toggle checkbox in task details", () => {
    const taskName = `Checkbox test ${Date.now()}`;
    const checkboxDetails = "- [ ] First item\n- [ ] Second item\n- [x] Already done";

    createTaskWithDetails(taskName, checkboxDetails).then((taskId) => {
      // Expand details
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="description-indicator"]')
        .click();

      cy.get('[data-cy="task-details"]').should("be.visible");

      // Should show checkboxes
      cy.get('[data-cy="subtask-checkbox"]').should("have.length", 3);

      // First checkbox should be unchecked
      cy.get('[data-cy="subtask-checkbox"]').first().should("not.be.checked");

      // Toggle the first checkbox
      cy.get('[data-cy="subtask-checkbox"]').first().click();

      // Verify the update API call was sent
      cy.wait("@updateTask").then((interception) => {
        // The details should have the first checkbox toggled
        expect(interception.request.body.task.details).to.include("[x] First item");
      });
    });
  });

  it("should keep details expanded after toggling a checkbox", () => {
    const taskName = `Expand persist ${Date.now()}`;
    const checkboxDetails = "- [ ] Toggle me\n- [ ] Leave me";

    createTaskWithDetails(taskName, checkboxDetails).then((taskId) => {
      // Expand details
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="description-indicator"]')
        .click();
      cy.get('[data-cy="task-details"]').should("be.visible");

      // Toggle checkbox
      cy.get('[data-cy="subtask-checkbox"]').first().click();
      cy.wait("@updateTask");

      // Details should still be expanded
      cy.get('[data-cy="task-details"]').should("be.visible");
    });
  });

  it("should show strikethrough for checked items", () => {
    const taskName = `Strikethrough test ${Date.now()}`;
    const checkboxDetails = "- [x] Completed item\n- [ ] Pending item";

    createTaskWithDetails(taskName, checkboxDetails).then((taskId) => {
      // Expand details
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="description-indicator"]')
        .click();
      cy.get('[data-cy="task-details"]').should("be.visible");

      // The checked item should have line-through style
      cy.get('[data-cy="task-details"]')
        .find("li.line-through")
        .should("exist")
        .and("contain.text", "Completed item");

      // The unchecked item should not have line-through
      cy.contains("li", "Pending item").should("not.have.class", "line-through");
    });
  });

  it("should render links with target blank", () => {
    const taskName = `Link test ${Date.now()}`;
    const linkDetails = "Check https://example.com for more info";

    createTaskWithDetails(taskName, linkDetails).then((taskId) => {
      // Expand details
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy="description-indicator"]')
        .click();
      cy.get('[data-cy="task-details"]').should("be.visible");

      // Link should have target="_blank"
      cy.get('[data-cy="auto-link"]')
        .should("have.attr", "target", "_blank")
        .and("have.attr", "href", "https://example.com");
    });
  });
});
