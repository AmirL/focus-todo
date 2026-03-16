/// <reference types="cypress" />

/**
 * TEMPORARY: Deliberately flaky test to prove the flaky-tests label workflow.
 * This test fails on the first attempt and passes on retry.
 * It will be removed after proving the label is added and then removed on a clean run.
 */
describe("Flaky Label Proof", () => {
  let attemptCount = 0;

  it("deliberately flaky test - fails first, passes on retry", () => {
    attemptCount++;
    if (attemptCount === 1) {
      expect(true, "Deliberate first-attempt failure to trigger flaky detection").to.be.false;
    }
    cy.visit("/");
    cy.waitForAppLoad();
    cy.contains("Backlog").should("be.visible");
  });
});
