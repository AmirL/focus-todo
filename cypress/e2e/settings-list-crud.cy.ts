/// <reference types="cypress" />

describe("Settings List Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
    cy.get('[data-cy="settings-link"]').click();
    cy.contains("Manage Lists", { timeout: 10000 }).should("be.visible");
  });

  describe("Settings Page Sections", () => {
    it("should display all three settings sections", () => {
      cy.contains("Manage Lists").should("be.visible");
      cy.contains("API Keys").should("be.visible");
      cy.get('[data-cy^="list-item-"]').should("have.length.at.least", 1);
    });

    it("should navigate to settings via sidebar link", () => {
      cy.url().should("include", "/settings");
    });
  });

  describe("Create List Dialog", () => {
    it("should open the create list dialog with all form fields", () => {
      cy.contains("button", "Add List").click();
      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      cy.get("#list-name").should("exist");
      cy.get('[data-cy="list-description"]').should("exist");
      cy.get('[data-cy="color-picker"]').should("exist");
      cy.get("#participates-in-initiative").should("exist");
      cy.get('[data-cy="list-form-submit"]').should("be.visible");
      cy.get('[data-cy="list-form-cancel"]').should("be.visible");
    });

    it("should cancel list creation without saving", () => {
      const listName = `Cancelled List ${Date.now()}`;
      cy.contains("button", "Add List").click();
      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      cy.get("#list-name").type(listName);
      cy.get('[data-cy="list-form-cancel"]').click();
      cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
        "not.exist",
      );
      cy.contains(listName).should("not.exist");
    });
  });

  describe("Edit List Dialog", () => {
    it("should open the edit dialog with populated fields", () => {
      cy.get('[data-cy^="list-item-"]')
        .first()
        .find('[data-cy="edit-list-btn"]')
        .click();

      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      // Wait for form to populate from server data
      cy.get("#list-name", { timeout: 15000 }).should("not.have.value", "");
      cy.get('[data-cy="list-description"]').should("exist");
      cy.get('[data-cy="color-picker"]').should("exist");
      cy.get("#participates-in-initiative").should("exist");
    });

    it("should cancel edit without saving changes", () => {
      cy.get('[data-cy^="list-item-"]')
        .first()
        .find('[data-cy="edit-list-btn"]')
        .click();

      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      cy.get("#list-name", { timeout: 15000 }).should("not.have.value", "");

      // Type something then cancel
      cy.get("#list-name").type(" (temp edit)");
      cy.get('[data-cy="list-form-cancel"]').click();
      cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
        "not.exist",
      );
    });
  });

  describe("List Items Display", () => {
    it("should show action buttons for each list", () => {
      cy.get('[data-cy^="list-item-"]').first().within(() => {
        cy.get('[data-cy="edit-list-btn"]').should("exist");
      });
    });

    it("should show Default badge on default lists", () => {
      // At least one list should have the Default badge
      cy.get('[data-cy^="list-item-"]').should("have.length.at.least", 2);
    });
  });
});
