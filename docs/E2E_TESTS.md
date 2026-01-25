# E2E Tests with Cypress Cloud

This project uses Cypress for end-to-end testing with results recorded to Cypress Cloud.

## Cypress Cloud Access

- **Project ID**: `oufatd`
- **Dashboard URL**: https://cloud.cypress.io/projects/oufatd
- **API Key**: Set in environment variable `CYPRESS_RECORD_KEY`

## Fetching Test Results via API

Use the Cypress Cloud Data Extract API to fetch test results programmatically.

### API Endpoint

```
https://cloud.cypress.io/enterprise-reporting/report?token=API_KEY&report_id=REPORT_TYPE&export_format=FORMAT&start_date=DATE
```

### Available Report Types

| Report ID | Description |
|-----------|-------------|
| `failed-test-details` | Details of failed tests (near real-time) |
| `test-details` | All test details |
| `spec-details` | Spec-level results |
| `status-per-build-summary` | Run status summary |
| `status-per-test-summary` | Test status summary |
| `flaky-test-details` | Flaky test information |
| `top-failures-per-project` | Most common failures |

### Example: Fetch Failed Tests

```bash
curl -s "https://cloud.cypress.io/enterprise-reporting/report?token=$CYPRESS_RECORD_KEY&report_id=failed-test-details&export_format=json&start_date=2026-01-01"
```

### Example: Fetch Spec Results

```bash
curl -s "https://cloud.cypress.io/enterprise-reporting/report?token=$CYPRESS_RECORD_KEY&report_id=spec-details&export_format=json&start_date=2026-01-01"
```

### Response Fields (failed-test-details)

| Field | Description |
|-------|-------------|
| `project_name` | Project name |
| `run_number` | Run number |
| `spec` | Spec file path |
| `test_name` | Full test name (describe /// it) |
| `error_name` | Error type (e.g., `[AssertionError]`) |
| `error_message` | Detailed error message |
| `test_replay_url` | Link to test replay in Cypress Cloud |
| `commit_branch` | Git branch |
| `commit_sha` | Git commit hash |

## Running Tests Locally

```bash
# Run all e2e tests
pnpm cypress run

# Run with Cypress Cloud recording
pnpm cypress run --record --key $CYPRESS_RECORD_KEY

# Open Cypress UI
pnpm cypress open
```

## Test Structure

Tests are located in `cypress/e2e/`:

- `smoke.cy.ts` - Critical user flow tests
- `tasks.cy.ts` - Task management tests
- `goals.cy.ts` - Goal management tests
- `lists.cy.ts` - List/category tests
- `search-navigation.cy.ts` - Search and navigation tests

## Notes

- Tests use `cy.prompt()` for AI-powered element finding (experimental feature)
- The `waitForAppLoad` custom command ensures the app is loaded before tests run
- Start date for API queries cannot be older than 365 days
