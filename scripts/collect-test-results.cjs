#!/usr/bin/env node

// Collects test results from mochawesome merged reports into a compact format
// for historical tracking. Reads merged-report.json files from each container.
//
// Usage: node scripts/collect-test-results.js <results-dir>
// Output: JSON to stdout with per-test pass/fail status

const fs = require('fs');
const path = require('path');

const resultsDir = process.argv[2];
if (!resultsDir) {
  console.error('Usage: node collect-test-results.js <results-dir>');
  process.exit(1);
}

const tests = new Map(); // fullTitle -> { passed, flaky }

function walkSuites(suites) {
  for (const suite of suites || []) {
    for (const test of suite.tests || []) {
      const title = test.fullTitle || test.title;
      const passed = test.pass === true;

      tests.set(title, { passed, flaky: false });
    }
    walkSuites(suite.suites);
  }
}

// Find all merged-report.json files
const reportFiles = [];
function findReports(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findReports(fullPath);
    } else if (entry.name === 'merged-report.json') {
      reportFiles.push(fullPath);
    }
  }
}

findReports(resultsDir);

if (reportFiles.length === 0) {
  console.error('No merged-report.json files found');
  process.exit(0);
}

for (const file of reportFiles) {
  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    const suites = report.results ? report.results.map((r) => r.suites).flat() : [];
    walkSuites(suites);
  } catch (e) {
    console.error(`Error parsing ${file}: ${e.message}`);
  }
}

// Mark tests as flaky using Cypress after:spec retry data.
// Mochawesome doesn't record retry attempts, so the Cypress config writes
// flaky-from-retries.json with test titles that passed after failed attempts.
function findFlakyRetryFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFlakyRetryFiles(fullPath));
    } else if (entry.name === 'flaky-from-retries.json') {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of findFlakyRetryFiles(resultsDir)) {
  try {
    const flakyTitles = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const title of flakyTitles) {
      // Find matching test by partial title match (after:spec joins with " > ")
      for (const [testTitle, testData] of tests) {
        if (testTitle === title || testTitle.includes(title) || title.includes(testTitle)) {
          testData.flaky = true;
        }
      }
    }
  } catch (e) {
    console.error(`Error reading flaky retries from ${file}: ${e.message}`);
  }
}

const result = {
  timestamp: new Date().toISOString(),
  tests: Object.fromEntries(tests),
};

console.log(JSON.stringify(result));
