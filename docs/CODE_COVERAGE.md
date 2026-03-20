# Code Coverage

Combined unit (Vitest) + E2E (Cypress) coverage, run locally.

## Usage

```bash
pnpm run coverage
```

The script auto-starts an instrumented dev server on port 3200, runs tests, merges reports, and prints a summary. Override port: `COVERAGE_PORT=4000 pnpm run coverage`.

## Credentials

E2E coverage needs test user credentials (`NEXT_PUBLIC_TEST_EMAIL`, `NEXT_PUBLIC_TEST_PASSWORD`) in `.env.local`. Cypress loads them automatically via `cypress.config.ts`.

In CI, credentials come from GitHub Actions vars/secrets (`CYPRESS_TEST_EMAIL`, `CYPRESS_TEST_PASSWORD`).

## Output

Reports are saved to `coverage/merged/`:
- `coverage-final.json`, `coverage-summary.json` - raw data
- `lcov-report/index.html` - browseable HTML report

These files are committed to the repo for review.

## CI

Coverage is not collected in CI. CI runs E2E tests against Vercel preview deployments without instrumentation.
