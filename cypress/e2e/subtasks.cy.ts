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

    getTaskCheckboxes(name).should("have.length", 3);
    getTaskCheckboxes(name).eq(0).should("not.be.checked");
    getTaskCheckboxes(name).eq(1).should("not.be.checked");
    getTaskCheckboxes(name).eq(2).should("be.checked");
  });

  it("should toggle a checkbox and persist the change", () => {
    const name = `Toggle test ${Date.now()}`;
    createTaskWithCheckboxes(name);

    // Click the first checkbox to check it
    getTaskCheckboxes(name).eq(0).click();

    // Verify the first checkbox is now checked
    getTaskCheckboxes(name).eq(0).should("be.checked");

    // Wait for the mutation to reach the server
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Reload and verify the state persisted
    cy.reload();
    cy.waitForAppLoad();

    getTaskCheckboxes(name).eq(0).should("be.checked");
  });

  it("should not collapse details when clicking a checkbox", () => {
    const name = `Collapse test ${Date.now()}`;
    createTaskWithCheckboxes(name);

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

    // The third checkbox ("Send email") is already checked
    getTaskCheckboxes(name).eq(2).should("be.checked");

    // Uncheck it
    getTaskCheckboxes(name).eq(2).click();

    // Verify it's now unchecked
    getTaskCheckboxes(name).eq(2).should("not.be.checked");
  });
});
