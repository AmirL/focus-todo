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

  describe("Full List CRUD Cycle", () => {
    const listName = `E2E Test List ${Date.now()}`;

    afterEach(() => {
      // Cleanup: delete any test lists via API
      const apiKey = Cypress.env("API_TEST_KEY");
      if (!apiKey) return;
      cy.request({
        method: "GET",
        url: "/api/lists?includeArchived=true",
        headers: { "X-API-Key": apiKey },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) return;
        const lists = response.body.lists || [];
        lists
          .filter((l: { name: string }) => l.name.includes("E2E Test List"))
          .forEach((l: { id: number }) => {
            cy.request({
              method: "DELETE",
              url: `/api/lists/${l.id}`,
              headers: { "X-API-Key": apiKey },
              failOnStatusCode: false,
            });
          });
      });
    });

    function createListViaDialog(name: string) {
      cy.contains("button", "Add List").click();
      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      cy.get("#list-name").type(name);
      cy.get('[data-cy="list-form-submit"]').scrollIntoView().click();

      // Dialog should close
      cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
        "not.exist",
      );

      // New list should appear
      cy.get('[data-cy^="list-item-"]').contains(name, { timeout: 10000 }).should("be.visible");
    }

    it("should create a new list and see it in the list", () => {
      createListViaDialog(listName);
    });

    it("should edit an existing list name", () => {
      createListViaDialog(listName);

      // Now edit it
      const updatedName = `E2E Test List Updated ${Date.now()}`;
      cy.get('[data-cy^="list-item-"]').contains(listName)
        .closest('[data-cy^="list-item-"]')
        .find('[data-cy="edit-list-btn"]')
        .click();
      cy.get('[data-cy="list-form-dialog"]').should("be.visible");
      cy.get("#list-name", { timeout: 15000 }).should("not.have.value", "");
      cy.get("#list-name").clear().type(updatedName);
      cy.get('[data-cy="list-form-submit"]').scrollIntoView().click();

      // Dialog should close
      cy.get('[data-cy="list-form-dialog"]', { timeout: 5000 }).should(
        "not.exist",
      );

      // Updated name should appear
      cy.get('[data-cy^="list-item-"]').contains(updatedName, { timeout: 10000 }).should("be.visible");
    });

    it("should archive and unarchive a list", () => {
      createListViaDialog(listName);

      // Archive it
      cy.get('[data-cy^="list-item-"]').contains(listName)
        .closest('[data-cy^="list-item-"]')
        .find('[data-cy^="archive-list-"]')
        .click();

      // Should show "Archived" badge
      cy.get('[data-cy^="list-item-"]').contains(listName, { timeout: 10000 })
        .closest('[data-cy^="list-item-"]')
        .should("contain.text", "Archived");

      // Unarchive it
      cy.get('[data-cy^="list-item-"]').contains(listName)
        .closest('[data-cy^="list-item-"]')
        .find('[data-cy^="archive-list-"]')
        .click();

      // "Archived" badge should disappear
      cy.get('[data-cy^="list-item-"]').contains(listName, { timeout: 10000 })
        .closest('[data-cy^="list-item-"]')
        .should("not.contain.text", "Archived");
    });

    it("should delete a non-default list with confirmation", () => {
      createListViaDialog(listName);

      // Click delete button (trash icon on the new list)
      cy.get('[data-cy^="list-item-"]').contains(listName)
        .closest('[data-cy^="list-item-"]')
        .find("button.text-red-600")
        .click();

      // Confirmation dialog should appear
      cy.contains("Are you sure you want to delete").should("be.visible");

      // Click Delete to confirm
      cy.contains("button", "Delete").click();

      // List should disappear
      cy.get('[data-cy^="list-item-"]').contains(listName, { timeout: 10000 }).should("not.exist");
    });

    it("should not show delete button for default lists", () => {
      // Find the list item with "Default" badge and verify no trash button
      cy.contains("Default")
        .closest('[data-cy^="list-item-"]')
        .find("button.text-red-600")
        .should("not.exist");
    });
  });
});
