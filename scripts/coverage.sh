#!/usr/bin/env bash
set -euo pipefail

# Local coverage script: runs vitest coverage, starts an instrumented dev server,
# runs Cypress E2E tests with coverage, merges all reports, and prints a summary.
#
# Usage:
#   pnpm run coverage              # unit + e2e (starts instrumented server automatically)
#   pnpm run coverage --unit-only  # unit tests only, no dev server needed
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

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --unit-only) UNIT_ONLY=true ;;
  esac
done

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
  # Check if a dev server is already running on port 3000
  EXTERNAL_SERVER=false
  if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
    EXTERNAL_SERVER=true
    echo "==> Dev server already running on localhost:3000."
    echo "    WARNING: For E2E coverage, the server must have been started with:"
    echo "      CYPRESS_COVERAGE=true pnpm dev"
    echo "    If not, coverage data will be incomplete. Stop the server and re-run this script"
    echo "    to let it start an instrumented server automatically."
  fi

  if [ "$EXTERNAL_SERVER" = false ]; then
    echo "==> Starting instrumented dev server (CYPRESS_COVERAGE=true)..."
    CYPRESS_COVERAGE=true pnpm dev &
    DEV_SERVER_PID=$!

    # Wait for the server to be ready (up to 60 seconds)
    echo "==> Waiting for dev server to start..."
    RETRIES=0
    MAX_RETRIES=60
    while ! curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; do
      RETRIES=$((RETRIES + 1))
      if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Dev server did not start within ${MAX_RETRIES}s. Skipping E2E coverage."
        kill "$DEV_SERVER_PID" 2>/dev/null || true
        DEV_SERVER_PID=""
        break
      fi
      sleep 1
    done
  fi

  # Run Cypress with coverage if server is up
  if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
    echo "==> Running Cypress E2E tests with coverage..."
    CYPRESS_COVERAGE=true pnpm cypress run || true
    E2E_RAN=true
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
