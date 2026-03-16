#!/usr/bin/env node

// Analyzes historical test results to detect flaky tests across runs.
// Maintains a rolling window of the last 20 runs stored in a JSON history file.
//
// Usage: node scripts/analyze-flaky-tests.js <history-file> <current-results-file>
// Output: Markdown step summary to stdout, exits with code 0

const fs = require('fs');

const MAX_RUNS = 20;
const historyFile = process.argv[2];
const currentFile = process.argv[3];

if (!historyFile || !currentFile) {
  console.error('Usage: node analyze-flaky-tests.js <history-file> <current-results-file>');
  process.exit(1);
}

// Load history
let history = { runs: [] };
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  } catch {
    history = { runs: [] };
  }
}

// Load current results
let current;
try {
  current = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
} catch (e) {
  console.error(`Cannot read current results: ${e.message}`);
  process.exit(0);
}

// Append current run to history
history.runs.push(current);

// Trim to last N runs
if (history.runs.length > MAX_RUNS) {
  history.runs = history.runs.slice(-MAX_RUNS);
}

// Save updated history
fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

// Aggregate stats per test
const stats = new Map(); // title -> { passes, failures, flaky, lastFailure, total }

for (const run of history.runs) {
  for (const [title, result] of Object.entries(run.tests || {})) {
    if (!stats.has(title)) {
      stats.set(title, { passes: 0, failures: 0, flaky: 0, lastFailure: null, total: 0 });
    }
    const s = stats.get(title);
    s.total++;
    if (result.passed) {
      s.passes++;
    } else {
      s.failures++;
      s.lastFailure = run.timestamp;
    }
    if (result.flaky) {
      s.flaky++;
    }
  }
}

// Generate markdown summary
const lines = [];
lines.push('## E2E Test Reliability Report');
lines.push('');
lines.push(`Analyzing last **${history.runs.length}** run(s)`);
lines.push('');

// Find tests with any failures or flakiness
const unreliable = [];
for (const [title, s] of stats) {
  const failureRate = ((s.failures + s.flaky) / s.total) * 100;
  if (s.failures > 0 || s.flaky > 0) {
    unreliable.push({ title, ...s, failureRate });
  }
}

// Sort by failure rate descending
unreliable.sort((a, b) => b.failureRate - a.failureRate);

if (unreliable.length === 0) {
  lines.push('All tests are stable across recorded history.');
} else {
  lines.push(`Found **${unreliable.length}** unreliable test(s):`);
  lines.push('');
  lines.push('| Test | Runs | Passes | Fails | Flaky | Failure Rate | Last Failure |');
  lines.push('|------|------|--------|-------|-------|-------------|-------------|');

  for (const t of unreliable) {
    const lastFail = t.lastFailure ? t.lastFailure.split('T')[0] : '-';
    lines.push(
      `| ${truncate(t.title, 60)} | ${t.total} | ${t.passes} | ${t.failures} | ${t.flaky} | ${t.failureRate.toFixed(1)}% | ${lastFail} |`,
    );
  }
}

// Current run summary
lines.push('');
lines.push('### Current Run');
const currentTests = Object.entries(current.tests || {});
const currentPassed = currentTests.filter(([, r]) => r.passed).length;
const currentFailed = currentTests.filter(([, r]) => !r.passed).length;
const currentFlaky = currentTests.filter(([, r]) => r.flaky).length;
lines.push(
  `- Total: ${currentTests.length}, Passed: ${currentPassed}, Failed: ${currentFailed}, Flaky (retried): ${currentFlaky}`,
);

// Output machine-readable list based on CURRENT RUN only (not historical aggregate).
// The label should reflect whether THIS run had flaky or failed tests.
const currentRunFlaky = currentTests
  .filter(([, r]) => r.flaky || !r.passed)
  .map(([title]) => title);
if (currentRunFlaky.length > 0) {
  fs.writeFileSync('/tmp/flaky-test-names.json', JSON.stringify(currentRunFlaky));
} else {
  // Ensure no stale file from a previous step triggers labeling
  if (fs.existsSync('/tmp/flaky-test-names.json')) {
    fs.unlinkSync('/tmp/flaky-test-names.json');
  }
}

console.log(lines.join('\n'));

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.substring(0, max - 3) + '...';
}
