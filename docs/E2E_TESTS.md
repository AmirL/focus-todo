# E2E Tests with Cypress

This project uses Cypress for end-to-end testing. Tests run in CI via GitHub Actions against Vercel preview deployments.

## Running Tests Locally

```bash
# Run all e2e tests
pnpm cypress run

# Open Cypress UI
pnpm cypress open
```

## Test Structure

Tests are located in `cypress/e2e/`:

- `smoke.cy.ts` - Critical user flow tests
- `tasks.cy.ts` - Task management tests
- `goals.cy.ts` - Goal management tests
- `lists.cy.ts` - List/category tests
- `list-description.cy.ts` - List description field tests
- `search-navigation.cy.ts` - Search and navigation tests

## Flaky Test Detection

Cypress is configured with automatic retries for flaky test detection:

- **CI (runMode)**: Failed tests retry up to 2 times. If a test fails then passes on retry, Cypress marks it as "flaky" in the output.
- **Interactive (openMode)**: No retries, so failures are immediate for faster local debugging.

This configuration is set in `cypress.config.ts` under the `retries` option.

## Notes

- Tests use `cy.prompt()` for AI-powered element finding (experimental feature)
- The `waitForAppLoad` custom command ensures the app is loaded before tests run
