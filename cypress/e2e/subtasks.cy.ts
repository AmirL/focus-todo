/// <reference types="cypress" />

describe("Subtask Checkboxes", () => {
  const taskName = `Subtask E2E ${Date.now()}`;
  const checkboxMarkdown = "- [ ] Buy groceries\n- [ ] Clean house\n- [x] Send email";

  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  it("should create a task with checkboxes and render them", () => {
    // Create a task
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);

    // Switch to Edit tab and type checkbox markdown in details
    cy.contains("button", "Edit").click();
    cy.get("#details").type(checkboxMarkdown);

    // Save the task
    cy.get('[data-testid="save-task-button"]').click();

    // Verify the task appears
    cy.contains(taskName).should("be.visible");

    // Verify subtask checkboxes are rendered
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .should("have.length", 3);

    // Verify first two are unchecked, third is checked
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(0)
      .should("not.be.checked");

    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(1)
      .should("not.be.checked");

    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(2)
      .should("be.checked");
  });

  it("should toggle a checkbox and persist the change", () => {
    // Create a task with checkboxes
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.contains("button", "Edit").click();
    cy.get("#details").type(checkboxMarkdown);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");

    // Click the first checkbox to check it
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(0)
      .click();

    // Verify the first checkbox is now checked
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(0)
      .should("be.checked");

    // Reload and verify the state persisted
    cy.reload();
    cy.waitForAppLoad();

    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(0)
      .should("be.checked");
  });

  it("should not collapse details when clicking a checkbox", () => {
    // Create a task with checkboxes
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.contains("button", "Edit").click();
    cy.get("#details").type(checkboxMarkdown);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");

    // Verify all 3 checkboxes are visible (details expanded)
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .should("have.length", 3);

    // Click a checkbox
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(1)
      .click();

    // Verify all 3 checkboxes are still visible (not collapsed)
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .should("have.length", 3);
  });

  it("should uncheck a previously checked checkbox", () => {
    // Create a task with checkboxes
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-name-input"]').type(taskName);
    cy.contains("button", "Edit").click();
    cy.get("#details").type(checkboxMarkdown);
    cy.get('[data-testid="save-task-button"]').click();
    cy.contains(taskName).should("be.visible");

    // The third checkbox ("Send email") is already checked
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(2)
      .should("be.checked");

    // Uncheck it
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(2)
      .click();

    // Verify it's now unchecked
    cy.contains(taskName)
      .parents('[data-testid^="task-"]')
      .find('[data-testid="subtask-checkbox"]')
      .eq(2)
      .should("not.be.checked");
  });
});
