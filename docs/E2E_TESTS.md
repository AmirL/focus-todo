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

## Notes

- Tests use `cy.prompt()` for AI-powered element finding (experimental feature)
- The `waitForAppLoad` custom command ensures the app is loaded before tests run
