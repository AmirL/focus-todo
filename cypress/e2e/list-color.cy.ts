/// <reference types="cypress" />

function waitForDialogClosed() {
  cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
    "not.exist"
  );
  cy.wait(500);
}

describe("List Color Picker", () => {
  beforeEach(() => {
    cy.visit("/settings");
    cy.waitForAppLoad();
    cy.contains("Manage Lists").should("be.visible");
    cy.get('[data-cy^="list-item-"]').first().should("be.visible");
  });

  it("should show color picker in edit list dialog", () => {
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();

    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="color-picker"]').should("exist");
  });

  it("should show color picker in create list dialog", () => {
    cy.contains("button", "Add List").click();

    cy.get('[data-cy="list-form-dialog"]').should("be.visible");
    cy.get('[data-cy="color-picker"]').should("exist");
  });

  it("should select a color when editing a list", () => {
    cy.get('[data-cy^="list-item-"]')
      .first()
      .find('[data-cy="edit-list-btn"]')
      .click();
    cy.get('[data-cy="list-form-dialog"]').should("be.visible");

    // Wait for form to fully load before interacting
    cy.wait(1000);

    // Open color picker and select orange
    cy.get('[data-cy="color-picker"]').click();
    cy.get('[data-cy="color-option-orange"]').click();

    // Verify the picker shows the selected color name
    cy.get('[data-cy="color-picker"]').should("contain.text", "Orange");
  });

  it("should show color swatches next to lists", () => {
    // Lists with a color should show a swatch (the round colored circle)
    // Check that at least one swatch exists across all list items
    cy.get('[data-cy^="list-item-"]').then(($items) => {
      // Find any item with a colored swatch (round circle element)
      cy.wrap($items).find('[data-cy="list-color-swatch"]').should("exist");
    });
  });
});
