/// <reference types="cypress" />

// TEMPORARY: This test deliberately fails on the first attempt and passes on retry.
// It exists solely to prove that the flaky-tests PR label is added when a test
// passes via Cypress retry. This file will be removed after the label is verified.

let attemptCount = 0;

describe("Deliberate Flaky Test (temporary)", () => {
  it("should fail first attempt and pass on retry", () => {
    attemptCount++;
    cy.visit("/");
    cy.waitForAppLoad();
    // Fail on first attempt, pass on subsequent attempts
    if (attemptCount === 1) {
      expect(true).to.equal(false, "Deliberate first-attempt failure for flaky label proof");
    }
    cy.get("body").should("exist");
  });
});
