import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Endpoint for @cypress/code-coverage to collect server-side coverage data.
// Only active when code is instrumented via babel-plugin-istanbul (CYPRESS_COVERAGE=true).
export function GET() {
  const coverage = (globalThis as Record<string, unknown>).__coverage__;
  if (!coverage) {
    return NextResponse.json(null, { status: 204 });
  }
  return NextResponse.json({ coverage });
}
