/// <reference types="cypress" />

function waitForDialogClosed() {
  cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
    "not.exist"
  );
  cy.wait(500);
}

describe("List Description", () => {
  beforeEach(() => {
    cy.visit("/settings");
    cy.waitForAppLoad();
    cy.contains("Manage Lists").should("be.visible");
    cy.get('[data-cy^="list-item-"]').first().should("be.visible");
  });

  it("should show description field in edit list dialog", () => {
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();

    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="list-description"]').should("exist");
  });

  it("should save and persist a description", () => {
    const testDescription = `E2E test description ${Date.now()}`;

    // Intercept the list update API to wait for save completion
    cy.intercept("POST", "/api/update-list").as("updateList");

    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();
    cy.get('[data-cy="list-form-dialog"]').should("be.visible");

    cy.get('[data-cy="list-description"]').clear().type(testDescription);
    cy.get('[data-cy="list-form-submit"]').click();

    // Wait for the API save to complete before navigating
    cy.wait("@updateList");
    waitForDialogClosed();

    // Reload the page to ensure fresh data from server
    cy.visit("/settings");
    cy.waitForAppLoad();
    cy.get('[data-cy^="list-item-"]').first().should("be.visible");

    // Reopen to verify persistence
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();
    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="list-description"]').should(
      "have.value",
      testDescription
    );
  });

  it("should show description field in create list dialog", () => {
    cy.contains("button", "Add List").click();

    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="list-description"]').should("exist");
    cy.get('[data-cy="list-description"]').should("have.value", "");
    cy.get('[data-cy="list-description"]').should(
      "have.attr",
      "placeholder",
      "Provide context for tasks in this list..."
    );
  });

  it("should clear description when dialog is cancelled", () => {
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();
    cy.get('[data-cy="list-form-dialog"]').should("be.visible");

    cy.get('[data-cy="list-description"]').clear().type("temporary text");
    cy.get('[data-cy="list-form-cancel"]').click();

    waitForDialogClosed();

    // Reopen - should show the saved value, not the cancelled text
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();
    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="list-description"]').should(
      "not.have.value",
      "temporary text"
    );
  });
});
