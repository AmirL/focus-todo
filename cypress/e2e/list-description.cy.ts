/// <reference types="cypress" />

/**
 * Helper: click the edit (pencil) button next to a list item by name.
 * Each list row is a div with class "border rounded-lg" containing the name
 * and action buttons.
 */
function clickEditButton(listName: string) {
  cy.contains("span.font-medium", listName)
    .parents("div.rounded-lg")
    .first()
    .find("button")
    .not('[aria-label="Drag to reorder list"]')
    .first()
    .click();
}

function waitForDialogClosed() {
  // Radix dialogs animate out — wait until no dialog is in the DOM
  cy.get("body").then(($body) => {
    if ($body.find('[role="dialog"]').length > 0) {
      cy.get('[role="dialog"]', { timeout: 5000 }).should("not.exist");
    }
  });
  // Small extra wait for React state to settle
  cy.wait(500);
}

describe("List Description", () => {
  beforeEach(() => {
    cy.visit("/settings");
    cy.waitForAppLoad();
    cy.contains("Manage Lists").should("be.visible");
    // Ensure lists are rendered
    cy.contains("span.font-medium", "Work Tasks").should("be.visible");
  });

  it("should show description field in edit list dialog", () => {
    clickEditButton("Work Tasks");

    cy.get('[role="dialog"]').should("be.visible");
    cy.get("#list-description").should("exist");
    cy.get('[role="dialog"]').contains("Description").should("be.visible");
  });

  it("should save and persist a description", () => {
    const testDescription = `E2E test description ${Date.now()}`;

    clickEditButton("Work Tasks");
    cy.get('[role="dialog"]').should("be.visible");

    cy.get("#list-description").clear().type(testDescription);
    cy.get('[role="dialog"]').contains("button", "Update List").click();

    waitForDialogClosed();

    // Reopen to verify persistence
    clickEditButton("Work Tasks");
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("#list-description").should("have.value", testDescription);
  });

  it("should show description field in create list dialog", () => {
    cy.contains("button", "Add List").click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.get("#list-description").should("exist");
    cy.get("#list-description").should("have.value", "");
    cy.get("#list-description").should(
      "have.attr",
      "placeholder",
      "Provide context for tasks in this list..."
    );
  });

  it("should clear description when dialog is cancelled", () => {
    clickEditButton("Work Tasks");
    cy.get('[role="dialog"]').should("be.visible");

    cy.get("#list-description").clear().type("temporary text");
    cy.get('[role="dialog"]').contains("button", "Cancel").click();

    waitForDialogClosed();

    // Reopen - should show the saved value, not the cancelled text
    clickEditButton("Work Tasks");
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("#list-description").should("not.have.value", "temporary text");
  });
});
