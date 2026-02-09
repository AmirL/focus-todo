/// <reference types="cypress" />

const checkboxMarkdown = "- [ ] Buy groceries\n- [ ] Clean house\n- [x] Send email";

let createdTaskIds: number[] = [];

function createTaskWithCheckboxes(name: string) {
  // Intercept the task list refetch that happens after creation
  cy.intercept("POST", "/api/get-tasks").as("getTasks");
  cy.intercept("POST", "/api/create-task").as("createTask");

  cy.get('[data-testid="add-task-button"]').click();
  cy.get('[data-testid="task-name-input"]').type(name);
  cy.contains("button", "Edit").click();
  cy.get("#details").type(checkboxMarkdown);
  cy.get('[data-testid="save-task-button"]').click();
  cy.contains(name).should("be.visible");

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
  // expanded state after the click. If that happens, we click again.
  cy.contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .click();

  cy.contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .should("have.attr", "aria-expanded", "true");

  // Re-check after a moment — if a refetch collapsed it, click again
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);

  cy.contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .then(($btn) => {
      if ($btn.attr("aria-expanded") !== "true") {
        cy.wrap($btn).click();
      }
    });

  cy.contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-testid="subtask-checkbox"]')
    .should("have.length.at.least", 1);
}

function getTaskCheckboxes(name: string) {
  return cy
    .contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-testid="subtask-checkbox"]');
}

describe("Subtask Checkboxes", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
    // Wait for the task list to render (ensures session is restored and main view loaded)
    cy.get('[data-testid="add-task-button"]', { timeout: 15000 }).should("be.visible");
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
