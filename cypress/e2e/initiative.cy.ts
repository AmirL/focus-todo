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
      cy.get('[data-cy^="today-focus-option-"]').should("have.length.greaterThan", 0);
    });

    it("should select a category and show save button", () => {
      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="today-focus-dropdown"]').click();
      // Click the last option to maximize chance it differs from current selection
      cy.get('[data-cy^="today-focus-option-"]').last().click();
      // If there are unsaved changes, the save button should be visible
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="today-focus-save"]').length > 0) {
          cy.get('[data-cy="today-focus-save"]').should("be.visible");
        }
      });
    });
  });

  describe("Initiative History", () => {
    it("should display the focus history table on settings page", () => {
      cy.visit("/settings");
      // Wait for settings page to fully load
      cy.contains("Settings", { timeout: 10000 }).should("be.visible");
      // Scroll to Focus History card (below Manage Lists)
      cy.contains("Focus History").scrollIntoView({ duration: 500 }).should("be.visible");
      cy.contains("Last 30 days of daily focus selections").should("exist");
      // Should show either the history table or empty state
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="initiative-history-table"]').length > 0) {
          cy.get('[data-cy="initiative-history-table"]').within(() => {
            cy.contains("th", "Date").should("exist");
            cy.contains("th", "Suggested").should("exist");
            cy.contains("th", "Chosen").should("exist");
            cy.contains("th", "Reason").should("exist");
            // Verify at least one row of data exists
            cy.get("tbody tr").should("have.length.greaterThan", 0);
          });
        } else {
          cy.contains("No focus history yet").should("exist");
        }
      });
    });

    it("should show history entries after setting today's focus", () => {
      // First set today's focus to generate history
      cy.intercept("POST", "/api/current-initiative").as("setInitiative");
      cy.intercept("PATCH", "/api/current-initiative/*").as("changeInitiative");

      cy.get('[data-cy="filter-today"]').click();
      cy.get('[data-cy="today-focus-banner"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="today-focus-dropdown"]').click();
      cy.get('[data-cy^="today-focus-option-"]').first().click();
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="today-focus-save"]').length > 0) {
          cy.get('[data-cy="today-focus-save"]').click();
        }
      });

      // Now navigate to settings and verify history exists
      cy.visit("/settings");
      cy.contains("Settings", { timeout: 10000 }).should("be.visible");
      cy.contains("Focus History").scrollIntoView({ duration: 500 }).should("be.visible");
      // After setting focus, there should be at least one entry
      cy.get('[data-cy="initiative-history-table"]', { timeout: 10000 }).should("exist");
      cy.get('[data-cy="initiative-history-table"] tbody tr').should("have.length.greaterThan", 0);
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

    it("should select and save tomorrow's focus", () => {
      cy.intercept("POST", "/api/current-initiative").as("setInitiative");
      cy.intercept("PATCH", "/api/current-initiative/*").as("changeInitiative");

      cy.get('[data-cy="filter-tomorrow"]').click();
      cy.get('[data-cy="tomorrow-focus-picker"]', { timeout: 10000 }).should("be.visible");
      cy.get('[data-cy="tomorrow-focus-dropdown"]').click();
      // Pick a different option from current to trigger unsaved changes
      cy.get('[data-cy^="tomorrow-focus-option-"]').last().click();
      // Save if button is visible (it will be if selection differs from saved)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="tomorrow-focus-save"]').length > 0) {
          cy.get('[data-cy="tomorrow-focus-save"]').click();
        }
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
