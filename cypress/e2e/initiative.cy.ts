/// <reference types="cypress" />

describe("Initiative", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppLoad();
  });

  describe("Today's Focus Banner", () => {
    it("should display the today focus banner on the Today filter", () => {
      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
      cy.contains("Today's Focus").should("be.visible");
    });

    it("should display the today focus banner on the Selected filter", () => {
      cy.get('[data-cy="filter-selected"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
    });

    it("should open dropdown and show category options", () => {
      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="today-focus-dropdown"]').click();
      // Should show at least one option (lists that participate in initiative)
      cy.get('[data-cy^="today-focus-option-"]').should("have.length.greaterThan", 0);
    });

    it("should select a category and save today's focus", () => {
      cy.intercept("POST", "/api/current-initiative/*").as("changeInitiative");
      cy.intercept("POST", "/api/current-initiative").as("setInitiative");

      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="today-focus-dropdown"]').click();
      // Click the first available option
      cy.get('[data-cy^="today-focus-option-"]').first().click();
      // Save button should appear
      cy.get('[data-cy="today-focus-save"]').should("be.visible").click();
      // Wait for either set or change mutation
      cy.wait(["@setInitiative", "@changeInitiative"], { timeout: 10000 }).spread((...responses) => {
        const successResponse = responses.find((r) => r?.response?.statusCode === 200);
        expect(successResponse).to.exist;
      });
    });

    it("should change today's focus to a different category", () => {
      cy.intercept("POST", "/api/current-initiative/*").as("changeInitiative");
      cy.intercept("POST", "/api/current-initiative").as("setInitiative");

      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");

      // First, ensure we have a focus set
      cy.get('[data-cy="today-focus-dropdown"]').click();
      cy.get('[data-cy^="today-focus-option-"]').first().click();

      // Check if save button appears (it won't if already set to this)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="today-focus-save"]').length > 0) {
          cy.get('[data-cy="today-focus-save"]').click();
          cy.wait(["@setInitiative", "@changeInitiative"], { timeout: 10000 });
          cy.wait(1000); // Let state settle
        }
      });

      // Now change to a different category
      cy.get('[data-cy="today-focus-dropdown"]').click();
      cy.get('[data-cy^="today-focus-option-"]').last().click();

      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="today-focus-save"]').length > 0) {
          cy.get('[data-cy="today-focus-save"]').click();
          cy.wait("@changeInitiative", { timeout: 10000 }).then((interception) => {
            expect(interception.response!.statusCode).to.eq(200);
          });
        }
      });
    });
  });

  describe("Tomorrow's Focus Picker", () => {
    it("should display the initiative picker on the Tomorrow filter", () => {
      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.get('[data-cy="tomorrow-focus-picker"]', { timeout: 10000 }).should("be.visible");
      cy.contains("Tomorrow's focus").should("be.visible");
    });

    it("should open dropdown and show category options with balance info", () => {
      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.get('[data-cy="tomorrow-focus-picker"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="tomorrow-focus-dropdown"]').click();
      cy.get('[data-cy^="tomorrow-focus-option-"]').should("have.length.greaterThan", 0);
    });

    it("should select a category and save tomorrow's focus", () => {
      cy.intercept("POST", "/api/current-initiative").as("setInitiative");
      cy.intercept("POST", "/api/current-initiative/*").as("changeInitiative");

      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.get('[data-cy="tomorrow-focus-picker"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="tomorrow-focus-dropdown"]').click();
      cy.get('[data-cy^="tomorrow-focus-option-"]').first().click();
      cy.get('[data-cy="tomorrow-focus-save"]').should("be.visible").click();
      cy.wait(["@setInitiative", "@changeInitiative"], { timeout: 10000 }).spread((...responses) => {
        const successResponse = responses.find((r) => r?.response?.statusCode === 200);
        expect(successResponse).to.exist;
      });
    });

    it("should close dropdown when clicking outside", () => {
      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.get('[data-cy="tomorrow-focus-picker"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="tomorrow-focus-dropdown"]').click();
      cy.get('[data-cy^="tomorrow-focus-option-"]').should("be.visible");
      // Click outside the dropdown (on the fixed overlay)
      cy.get("body").click(0, 0);
      cy.get('[data-cy^="tomorrow-focus-option-"]').should("not.exist");
    });
  });
});
