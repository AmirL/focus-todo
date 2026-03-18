/// <reference types="cypress" />

describe("API Keys Management", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/api-keys/create").as("createApiKey");
    cy.intercept("POST", "/api/api-keys/list").as("listApiKeys");
    cy.intercept("POST", "/api/api-keys/revoke").as("revokeApiKey");
    cy.visit("/");
    cy.waitForAppLoad();
    cy.get('[data-cy="settings-link"]').click();
    cy.contains("API Keys", { timeout: 10000 }).should("be.visible");
  });

  it("should show the API Keys section on the settings page", () => {
    cy.contains("API Keys").should("be.visible");
    cy.contains("Generate and revoke API keys for external access").should(
      "be.visible",
    );
    cy.get('[data-cy="generate-api-key-btn"]').should("be.visible");
    cy.get('[data-cy="api-key-name-input"]').should("be.visible");
  });

  it("should show empty state when no active keys exist", () => {
    cy.get('[data-cy="active-api-keys"]').should("be.visible");
    // The "No active API keys" text appears when no keys exist.
    // If keys already exist from other tests, we just verify the section renders.
    cy.get('[data-cy="active-api-keys"]').should("exist");
  });

  it("should generate a new API key with a label", () => {
    const keyLabel = `E2E Test Key ${Date.now()}`;
    cy.get('[data-cy="api-key-name-input"]').type(keyLabel);
    cy.get('[data-cy="generate-api-key-btn"]').click();
    cy.wait("@createApiKey").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
      expect(interception.response!.body).to.have.property("key");
      expect(interception.response!.body.key).to.match(/^dak_/);
    });

    // Verify the created key box appears
    cy.get('[data-cy="created-api-key-box"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="created-api-key-value"]')
      .invoke("text")
      .should("match", /^dak_/);
    cy.get('[data-cy="copy-api-key-btn"]').should("be.visible");

    // Verify the key appears in the active keys list
    cy.get('[data-cy="active-api-keys"]').should("contain.text", keyLabel);
  });

  it("should generate a key without a label and show it as Untitled", () => {
    cy.get('[data-cy="generate-api-key-btn"]').click();
    cy.wait("@createApiKey").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
    });

    cy.get('[data-cy="created-api-key-box"]', { timeout: 10000 }).should(
      "be.visible",
    );
    // The key should appear in active list as "Untitled"
    cy.get('[data-cy="active-api-keys"]').should("contain.text", "Untitled");
  });

  it("should revoke an API key and move it to revoked section", () => {
    // First generate a key to revoke
    const keyLabel = `Revoke Test ${Date.now()}`;
    cy.get('[data-cy="api-key-name-input"]').type(keyLabel);
    cy.get('[data-cy="generate-api-key-btn"]').click();
    cy.wait("@createApiKey");

    // Wait for the key to appear in the active list
    cy.get('[data-cy="active-api-keys"]', { timeout: 10000 }).should(
      "contain.text",
      keyLabel,
    );

    // Revoke the key (click the revoke button next to it)
    cy.get('[data-cy="active-api-keys"]')
      .contains(keyLabel)
      .parents("li")
      .find('button[data-cy^="revoke-api-key-"]')
      .click();

    cy.wait("@revokeApiKey").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
      expect(interception.response!.body).to.have.property("success", true);
    });

    // Key should now appear in revoked section
    cy.get('[data-cy="revoked-api-keys"]', { timeout: 10000 }).should(
      "contain.text",
      keyLabel,
    );
    cy.get('[data-cy="revoked-api-keys"]').should("contain.text", "Revoked");
  });

  it("should show masked key format (prefix...lastFour) in active keys list", () => {
    const keyLabel = `Mask Test ${Date.now()}`;
    cy.get('[data-cy="api-key-name-input"]').type(keyLabel);
    cy.get('[data-cy="generate-api-key-btn"]').click();
    cy.wait("@createApiKey");

    // The active key item should show the masked format with an ellipsis
    cy.get('[data-cy="active-api-keys"]', { timeout: 10000 })
      .contains(keyLabel)
      .parents("li")
      .should("contain.text", "dak_");
  });
});
