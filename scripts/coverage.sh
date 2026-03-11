#!/usr/bin/env bash
set -euo pipefail

# Local coverage script: runs vitest coverage, optionally Cypress coverage,
# merges available reports, and prints a summary.

COVERAGE_DIR="coverage"
MERGE_DIR="$COVERAGE_DIR/to-merge"
MERGED_DIR="$COVERAGE_DIR/merged"

# Clean previous run
rm -rf "$MERGE_DIR" "$MERGED_DIR"
mkdir -p "$MERGE_DIR" "$MERGED_DIR"

# 1. Run unit tests with coverage
echo "==> Running unit tests with coverage..."
pnpm vitest run --coverage || true

# 2. Optionally run Cypress if a dev server is already running
DEV_SERVER_UP=false
if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
  DEV_SERVER_UP=true
fi

if [ "$DEV_SERVER_UP" = true ]; then
  echo "==> Dev server detected on localhost:3000, running Cypress with coverage..."
  CYPRESS_COVERAGE=true pnpm cypress run || true
else
  echo "==> No dev server on localhost:3000, skipping Cypress coverage."
  echo "    Start the dev server (pnpm dev) to include E2E coverage."
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
  if [ "$DEV_SERVER_UP" = true ]; then
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
fi
