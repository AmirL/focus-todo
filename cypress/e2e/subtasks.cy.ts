/// <reference types="cypress" />

const checkboxMarkdown = "- [ ] Buy groceries\n- [ ] Clean house\n- [x] Send email";

let createdTaskIds: number[] = [];

function createTaskWithCheckboxes(name: string) {
  // Intercept the task list refetch that happens after creation
  cy.intercept("POST", "/api/get-tasks").as("getTasks");
  cy.intercept("POST", "/api/create-task").as("createTask");

  cy.get('[data-cy="add-task-button"]').click();
  cy.get('[role="dialog"]').should("be.visible");
  cy.get('[data-cy="task-name-input"]').type(name);
  cy.get('[role="dialog"]').contains("button", "Edit").click();
  cy.get("#details").type(checkboxMarkdown);
  cy.get('[data-cy="save-task-button"]').click();
  cy.contains(name, { timeout: 15000 }).should("be.visible");

  // Capture created task ID for cleanup
  cy.wait("@createTask").then((interception) => {
    createdTaskIds.push(interception.response!.body.id);
  });

  // Wait for the React Query refetch to complete so the component won't remount
  cy.wait("@getTasks");
}

function expandDescription(name: string) {
  // Click the description indicator, then verify checkboxes appear.
  // A background React Query refetch can remount the component and reset the
  // expanded state after the click. If that happens, we retry.

  // Wait for any in-flight refetch to settle before expanding
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(2000);

  cy.contains(name)
    .parents('[data-cy^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .click();

  // A refetch may collapse it again — wait and re-check up to 2 times
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1500);

  cy.contains(name)
    .parents('[data-cy^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .then(($btn) => {
      if ($btn.attr("aria-expanded") !== "true") {
        cy.wrap($btn).click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1500);
        cy.contains(name)
          .parents('[data-cy^="task-"]')
          .first()
          .find('[data-cy="description-indicator"]')
          .then(($btn2) => {
            if ($btn2.attr("aria-expanded") !== "true") {
              cy.wrap($btn2).click();
            }
          });
      }
    });

  cy.contains(name)
    .parents('[data-cy^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .should("have.attr", "aria-expanded", "true");

  cy.contains(name)
    .parents('[data-cy^="task-"]')
    .first()
    .find('[data-cy="subtask-checkbox"]')
    .should("have.length.at.least", 1);
}

function getTaskCheckboxes(name: string) {
  return cy
    .contains(name)
    .parents('[data-cy^="task-"]')
    .first()
    .find('[data-cy="subtask-checkbox"]');
}

describe("Subtask Checkboxes", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
    // Wait for the task list to render (ensures session is restored and main view loaded)
    cy.get('[data-cy="add-task-button"]', { timeout: 15000 }).should("be.visible");
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  it("should create a task with checkboxes and render them", () => {
    const name = `Render test ${Date.now()}`;
    createTaskWithCheckboxes(name);
    expandDescription(name);

    getTaskCheckboxes(name).should("have.length", 3);
    getTaskCheckboxes(name).eq(0).should("not.be.checked");
    getTaskCheckboxes(name).eq(1).should("not.be.checked");
    getTaskCheckboxes(name).eq(2).should("be.checked");
  });

  it("should toggle a checkbox and verify the server update", () => {
    const name = `Toggle test ${Date.now()}`;
    createTaskWithCheckboxes(name);
    expandDescription(name);

    // Intercept the update-task API call
    cy.intercept("POST", "/api/update-task").as("updateTask");

    // Click the first checkbox to check it
    getTaskCheckboxes(name).eq(0).click();

    // Verify the first checkbox is now checked (optimistic update)
    getTaskCheckboxes(name).eq(0).should("be.checked");

    // Verify the update was sent to the server with the correct data
    cy.wait("@updateTask").then((interception) => {
      const body = interception.request.body;
      expect(body.task.details).to.include("- [x] Buy groceries");
    });
  });

  it("should not collapse details when clicking a checkbox", () => {
    const name = `Collapse test ${Date.now()}`;
    createTaskWithCheckboxes(name);
    expandDescription(name);

    // Verify all 3 checkboxes are visible (details expanded)
    getTaskCheckboxes(name).should("have.length", 3);

    // Click a checkbox
    getTaskCheckboxes(name).eq(1).click();

    // Verify all 3 checkboxes are still visible (not collapsed)
    getTaskCheckboxes(name).should("have.length", 3);
  });

  it("should uncheck a previously checked checkbox", () => {
    const name = `Uncheck test ${Date.now()}`;
    createTaskWithCheckboxes(name);
    expandDescription(name);

    // The third checkbox ("Send email") is already checked
    getTaskCheckboxes(name).eq(2).should("be.checked");

    // Uncheck it
    getTaskCheckboxes(name).eq(2).click();

    // Verify it's now unchecked
    getTaskCheckboxes(name).eq(2).should("not.be.checked");
  });
});
