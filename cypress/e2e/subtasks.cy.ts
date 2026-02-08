/// <reference types="cypress" />

const checkboxMarkdown = "- [ ] Buy groceries\n- [ ] Clean house\n- [x] Send email";

function createTaskWithCheckboxes(name: string) {
  cy.get('[data-testid="add-task-button"]').click();
  cy.get('[data-testid="task-name-input"]').type(name);
  cy.contains("button", "Edit").click();
  cy.get("#details").type(checkboxMarkdown);
  cy.get('[data-testid="save-task-button"]').click();
  cy.contains(name).should("be.visible");
}

function expandDescription(name: string) {
  // Wait for the task list to stabilize after creation (React Query refetch)
  cy.wait(1000);

  cy.contains(name)
    .parents('[data-testid^="task-"]')
    .first()
    .find('[data-cy="description-indicator"]')
    .click();

  // Wait for the checkboxes to render after expanding
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
