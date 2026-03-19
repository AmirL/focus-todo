#!/usr/bin/env bash
set -euo pipefail

# Local coverage script: runs vitest coverage, starts an instrumented dev server,
# runs Cypress E2E tests with coverage, merges all reports, and prints a summary.
#
# Usage:
#   pnpm run coverage              # unit + e2e (starts instrumented server automatically)
#   pnpm run coverage --unit-only  # unit tests only, no dev server needed
#
# Environment variables:
#   COVERAGE_PORT  - port for the instrumented dev server (default: 3200)
#
# The script automatically starts a Next.js dev server with CYPRESS_COVERAGE=true
# so the code is instrumented via babel-plugin-istanbul. The server is shut down
# when the script exits.

COVERAGE_DIR="coverage"
MERGE_DIR="$COVERAGE_DIR/to-merge"
MERGED_DIR="$COVERAGE_DIR/merged"
DEV_SERVER_PID=""
UNIT_ONLY=false
E2E_RAN=false
PORT="${COVERAGE_PORT:-3200}"

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --unit-only) UNIT_ONLY=true ;;
  esac
done

# Check E2E prerequisites (Cypress needs test credentials)
if [ "$UNIT_ONLY" = false ]; then
  MISSING_VARS=false

  # Cypress reads CYPRESS_* env vars automatically (stripping the prefix).
  # They can also be set in cypress.env.json.
  if [ -z "${CYPRESS_TEST_EMAIL:-}" ] && [ ! -f "cypress.env.json" ]; then
    MISSING_VARS=true
  fi
  if [ -z "${CYPRESS_TEST_PASSWORD:-}" ] && [ ! -f "cypress.env.json" ]; then
    MISSING_VARS=true
  fi

  if [ "$MISSING_VARS" = true ]; then
    echo ""
    echo "WARNING: E2E test credentials not found."
    echo "  E2E coverage requires CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD."
    echo ""
    echo "  Option 1: Create cypress.env.json (see cypress.env.json.example)"
    echo "  Option 2: Export env vars (use values from .env.local):"
    echo "    export CYPRESS_TEST_EMAIL=\$NEXT_PUBLIC_TEST_EMAIL"
    echo "    export CYPRESS_TEST_PASSWORD=\$NEXT_PUBLIC_TEST_PASSWORD"
    echo ""
    echo "  Falling back to --unit-only mode."
    echo ""
    UNIT_ONLY=true
  fi
fi

cleanup() {
  if [ -n "$DEV_SERVER_PID" ]; then
    echo "==> Stopping dev server (PID $DEV_SERVER_PID)..."
    kill "$DEV_SERVER_PID" 2>/dev/null || true
    wait "$DEV_SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Clean previous run
rm -rf "$MERGE_DIR" "$MERGED_DIR"
mkdir -p "$MERGE_DIR" "$MERGED_DIR"

# 1. Run unit tests with coverage
echo "==> Running unit tests with coverage..."
pnpm vitest run --coverage || true

# 2. Start instrumented dev server and run Cypress E2E tests
if [ "$UNIT_ONLY" = false ]; then
  # Check if any dev server is running (coverage needs exclusive DB access to avoid
  # "Too many connections" errors from running two Next.js servers simultaneously)
  for CHECK_PORT in 3000 3001 3002 "${PORT}"; do
    if curl -s -o /dev/null -w '' "http://localhost:${CHECK_PORT}" 2>/dev/null; then
      echo "ERROR: A server is already running on port ${CHECK_PORT}."
      echo "  The coverage script starts its own instrumented dev server and needs exclusive"
      echo "  database access. Running two servers causes 'Too many connections' errors."
      echo ""
      echo "  Please stop all dev servers before running coverage."
      echo "  Skipping E2E coverage (unit coverage still collected)."
      UNIT_ONLY=true
      break
    fi
  done

  if [ "$UNIT_ONLY" = false ]; then
    echo "==> Starting instrumented dev server on port ${PORT} (CYPRESS_COVERAGE=true)..."
    CYPRESS_COVERAGE=true pnpm dev --port "$PORT" &
    DEV_SERVER_PID=$!

    # Wait for the server to be ready (up to 120 seconds)
    echo "==> Waiting for dev server to start..."
    RETRIES=0
    MAX_RETRIES=120
    while ! curl -s -o /dev/null -w '' "http://localhost:${PORT}" 2>/dev/null; do
      RETRIES=$((RETRIES + 1))
      if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Dev server did not start within ${MAX_RETRIES}s. Skipping E2E coverage."
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        DEV_SERVER_PID=""
        break
      fi
      sleep 1
    done

    # Run Cypress with coverage if server is up
    if curl -s -o /dev/null -w '' "http://localhost:${PORT}" 2>/dev/null; then
      echo "==> Running Cypress E2E tests with coverage against http://localhost:${PORT}..."
      CYPRESS_COVERAGE=true CYPRESS_BASE_URL="http://localhost:${PORT}" pnpm cypress run || true
      E2E_RAN=true
    fi
  fi
fi

# 3. Collect available coverage JSON files
INDEX=0
if [ -f "$COVERAGE_DIR/unit/coverage-final.json" ]; then
  cp "$COVERAGE_DIR/unit/coverage-final.json" "$MERGE_DIR/coverage-${INDEX}.json"
  echo "==> Found unit test coverage"
  INDEX=$((INDEX + 1))
fi
if [ -f "$COVERAGE_DIR/coverage-final.json" ]; then
  cp "$COVERAGE_DIR/coverage-final.json" "$MERGE_DIR/coverage-${INDEX}.json"
  echo "==> Found E2E test coverage"
  INDEX=$((INDEX + 1))
fi

if [ "$INDEX" -eq 0 ]; then
  echo "No coverage files found."
  exit 0
fi

# 4. Merge and generate reports
echo "==> Merging coverage reports..."
pnpm exec nyc merge "$MERGE_DIR" "$MERGED_DIR/coverage-final.json"
pnpm exec nyc report \
  --temp-dir "$MERGED_DIR" \
  --reporter=text-summary \
  --reporter=json-summary \
  --reporter=lcov \
  --report-dir "$MERGED_DIR"

# 5. Print summary
if [ -f "$MERGED_DIR/coverage-summary.json" ]; then
  LABEL="unit only"
  if [ "$E2E_RAN" = true ]; then
    LABEL="unit + e2e"
  fi
  echo ""
  echo "== Coverage Summary ($LABEL) =="
  node -e "
    const data = require('./$MERGED_DIR/coverage-summary.json');
    const total = data.total || {};
    for (const key of ['lines', 'statements', 'functions', 'branches']) {
      const pct = total[key]?.pct ?? 'N/A';
      console.log('  ' + key + ': ' + pct + '%');
    }
  "
  echo ""
  echo "HTML report: $MERGED_DIR/lcov-report/index.html"
fi

# 6. Clean up non-merged coverage reports to avoid confusion
# (AI agents may read these instead of the merged data and report lower coverage)
echo "==> Cleaning up individual coverage reports..."
rm -rf "$COVERAGE_DIR/unit" "$COVERAGE_DIR/bdd" "$MERGE_DIR" "$COVERAGE_DIR/.nyc_output"
rm -f "$COVERAGE_DIR/coverage-final.json" "$COVERAGE_DIR/coverage-summary.json"
rm -f "$COVERAGE_DIR/lcov.info"
# Remove Istanbul HTML report files from coverage root (not from merged/)
rm -f "$COVERAGE_DIR/index.html" "$COVERAGE_DIR/base.css" "$COVERAGE_DIR/prettify.css" \
      "$COVERAGE_DIR/prettify.js" "$COVERAGE_DIR/sorter.js" "$COVERAGE_DIR/sort-arrow-sprite.png" \
      "$COVERAGE_DIR/favicon.png" "$COVERAGE_DIR/block-navigation.js"
rm -rf "$COVERAGE_DIR/lcov-report"
# Remove per-directory Istanbul HTML reports
for dir in "$COVERAGE_DIR"/_pages "$COVERAGE_DIR"/app "$COVERAGE_DIR"/entities \
           "$COVERAGE_DIR"/features "$COVERAGE_DIR"/hooks "$COVERAGE_DIR"/shared; do
  rm -rf "$dir"
done

# 7. Archive coverage report for git (individual files are gitignored)
ARCHIVE="$COVERAGE_DIR/coverage-report.tar.gz"
if [ -d "$MERGED_DIR" ]; then
  tar -czf "$ARCHIVE" -C "$MERGED_DIR" .
  echo "Archive: $ARCHIVE"
fi
