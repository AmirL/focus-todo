# Code Coverage

This project supports combined code coverage from unit tests (Vitest) and E2E tests (Cypress).

## Quick Start

```bash
# Full coverage: unit + e2e (starts instrumented dev server automatically)
pnpm run coverage

# Unit tests only (faster, no dev server needed)
pnpm run coverage --unit-only
```

The script handles everything automatically: runs unit tests, starts an instrumented dev server, runs Cypress E2E tests with coverage collection, merges the reports, and prints a summary.

## How It Works

### Unit Test Coverage

- **Tool**: Vitest with Istanbul provider
- **Config**: `vite.config.ts` (coverage section)
- **Output**: `coverage/unit/coverage-final.json`

### E2E Test Coverage

- **Tool**: Cypress with `@cypress/code-coverage` plugin
- **Instrumentation**: `babel-plugin-istanbul` added via webpack in `next.config.mjs` when `CYPRESS_COVERAGE=true`
- **Server-side collection**: The `/api/coverage-data` endpoint exposes server-side coverage from `globalThis.__coverage__`
- **Config**: `cypress.config.ts` (conditionally loads coverage plugin), `cypress/support/e2e.ts`
- **Output**: `coverage/coverage-final.json`

The dev server **must** be started with `CYPRESS_COVERAGE=true` so that Next.js instruments the source code. The `pnpm run coverage` script does this automatically.

### Merging

NYC merges all available coverage JSON files into a single report:

- **Merged output**: `coverage/merged/coverage-final.json`
- **HTML report**: `coverage/merged/lcov-report/index.html`
- **Summary**: `coverage/merged/coverage-summary.json`

## Manual E2E Coverage

If you prefer to run the dev server yourself (e.g., for debugging):

```bash
# Terminal 1: start instrumented dev server
CYPRESS_COVERAGE=true pnpm dev

# Terminal 2: run Cypress with coverage
CYPRESS_COVERAGE=true pnpm cypress run
```

Then run the merge step manually:

```bash
mkdir -p coverage/to-merge coverage/merged
cp coverage/unit/coverage-final.json coverage/to-merge/coverage-0.json
cp coverage/coverage-final.json coverage/to-merge/coverage-1.json
pnpm exec nyc merge coverage/to-merge coverage/merged/coverage-final.json
pnpm exec nyc report --temp-dir coverage/merged --reporter=text-summary --reporter=lcov --report-dir coverage/merged
```

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Unit test coverage settings (Istanbul provider, output dir) |
| `next.config.mjs` | Webpack rule to instrument code with babel-plugin-istanbul |
| `cypress.config.ts` | Cypress code coverage plugin setup |
| `cypress/support/e2e.ts` | Conditionally loads `@cypress/code-coverage/support` |
| `.nycrc` | NYC reporter config for merging |
| `src/app/api/coverage-data/route.ts` | Server-side coverage collection endpoint |
| `scripts/coverage.sh` | Orchestration script |

## CI

Coverage is not collected in CI. The CI pipeline runs E2E tests against Vercel preview deployments without instrumentation to avoid build overhead. Coverage is a local development tool.
