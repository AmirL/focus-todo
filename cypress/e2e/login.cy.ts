describe("Login", () => {
  it("should login on first click without needing to click twice", () => {
    const email = Cypress.env("TEST_EMAIL");
    const password = Cypress.env("TEST_PASSWORD");

    // Sign out first to get a clean login state
    cy.request("POST", "/api/auth/sign-out");
    cy.clearAllCookies();
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();

    // Visit the login page
    cy.visit("/login");

    // Fill in the login form
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);

    // Click sign in ONCE
    cy.contains("button", "Sign In").click();

    // Should redirect to home page and show the app (not stay on login)
    // The sidebar filter buttons confirm the app loaded successfully
    cy.get('[data-cy="filter-backlog"]', { timeout: 15000 }).should(
      "be.visible"
    );

    // Should NOT still be on the login page
    cy.url().should("not.include", "/login");
  });
});
