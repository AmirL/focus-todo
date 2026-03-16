# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `pnpm run dev` (runs on port 3000 by default, or next available port)
- **Build**: `pnpm run build` (includes running tests first)
- **Test**: `pnpm test` or `vitest run`
- **Lint**: `pnpm run lint`
- **TypeScript check**: `pnpm tsc --noEmit` (type checking without emitting files)
- **Database migrations**: `pnpm run db:generate` and `pnpm run db:migrate`
- **Architecture analysis**: `pnpm run fsd` (Feature-Sliced Design linting)
- **Code coverage**: `pnpm run coverage` (unit + e2e combined). See [`docs/CODE_COVERAGE.md`](./docs/CODE_COVERAGE.md) for details.

### Port Configuration

The dev server uses Next.js default port selection (3000, or next available). Auth is configured to work with any port - Better Auth derives the URL from request headers for local development. No environment variables needed for local dev.

**Important**: When starting the dev server, always read the server output to get the actual URL (e.g., `http://localhost:3000`). Next.js prints the URL when the server is ready - don't assume a port, check the output. Ensure the dev server is running before testing with `playwright-cli`.

## Architecture Overview

This is a Next.js 14 todo/task management application using Feature-Sliced Design (FSD) architecture with these key layers:

### FSD Architecture Structure

This project follows **Feature-Sliced Design (FSD)** architecture. For complete FSD guidelines, see [`docs/FSD_ARCHITECTURE.md`](./docs/FSD_ARCHITECTURE.md).

**Layer hierarchy** (top to bottom):

- **app/**: Next.js App Router pages and API routes
- **\_pages/**: Composed pages combining multiple features
- **features/**: Business logic features (goals, tasks with add/edit/actions/filter)
- **entities/**: Core domain models (task, goal, user)
- **shared/**: Reusable utilities, UI components, and infrastructure

**Key FSD Rules:**

- **Import Rule**: Only import from layers strictly below your current layer
- **Public API Rule**: Every slice/segment must provide a public API via `index.ts`
- **No shared/ in features/**: This violates FSD - use top-level `shared/` instead

**Component Organization:**

- **shared/ui/task/**: Task-specific reusable components
- **entities/goal/ui/**: Goal-specific reusable components
- **shared/ui/**: Generic reusable components
- **features/[feature]/ui/**: Feature-specific components (NOT reused elsewhere)

### Core Domain Models

- **TaskModel**: Main entity with properties like name, details, date, estimatedDuration, list, isBlocker, selectedAt
- **GoalModel**: Goals with title, progress, and list categorization
- Both use class-transformer for serialization and have utility functions for state checking

### Database & State Management

- **Database**: MySQL with Drizzle ORM, schema at `src/shared/lib/drizzle/schema.ts`
- **State**: React Query for server state, Zustand stores for client state
- **Auth**: Better Auth integration with admin role validation

### Key Technical Details

- **Lists**: Tasks/goals are categorized into "Work" and "Personal" lists
- **Date handling**: Uses dayjs with UTC transformations
- **UI**: Radix UI components with Tailwind CSS styling
- **PWA**: Configured with next-pwa
- **Testing**: Vitest with globals enabled. Unit test files use the `.spec.ts` naming convention (not `.test.ts`)
- **E2E Testing**: Cypress for E2E tests, running in CI against Vercel preview deployments. See [`docs/E2E_TESTS.md`](./docs/E2E_TESTS.md) for details.
- **E2E selectors**: Use `data-cy` attributes for Cypress selectors. Add `data-cy` attributes to components when writing E2E tests. Never rely on CSS classes, layout structure, or tag hierarchy for selectors.

### API Routes Pattern

**Session-based routes** (internal, require Better Auth session):

- GET `/api/get-tasks` and `/api/get-goals`
- POST `/api/create-task` and `/api/create-goal`
- PUT `/api/update-task` and `/api/update-goal`

**External API** (API key authentication):

Full RESTful API for programmatic access to tasks, goals, lists, and initiative. See [`docs/TASK_API.md`](./docs/TASK_API.md) for complete documentation and [`docs/TASK_API_SKILL.md`](./docs/TASK_API_SKILL.md) for the LLM-optimized version.

- `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id` - Task CRUD with filtering
- `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/:id` - Goal CRUD
- `GET/POST /api/lists`, `GET/PATCH/DELETE /api/lists/:id` - List (category) management
- `GET/POST /api/initiative`, `GET/PATCH /api/initiative/:date`, `GET /api/initiative/history` - Daily focus management

### Development Notes

- **Package Manager**: This project uses pnpm, not npm
- Component development should follow existing Radix UI + Tailwind patterns
- New features should be structured according to FSD layers
- Database changes require running migrations via `pnpm run db:generate` and `pnpm run db:migrate`
- **Database migrations**: `pnpm run db:migrate` requires `DATABASE_URL` env var. It is not auto-loaded from `.env.local`. Run with: `DATABASE_URL='...' npx drizzle-kit migrate`
- **Shared database**: Dev and prod use the same database. Be careful with migrations and data changes.
- **Test user login**: In dev mode, the login page has a "Login as Test User" button. It reads credentials from `NEXT_PUBLIC_TEST_EMAIL` and `NEXT_PUBLIC_TEST_PASSWORD` env vars in `.env.local`. Use this for `playwright-cli` testing. Note: the button may need to be clicked twice and the redirect can take a few seconds. If the page doesn't redirect after clicking, wait 3-5 seconds and try again or navigate to `/` manually.
- Always run `pnpm tsc --noEmit` before committing to ensure TypeScript compliance
- The steiger config has specific FSD rules disabled - follow existing patterns rather than strict FSD compliance

### Workflow

- First work on the task,
- When you consider your work is finished, use `playwright-cli` to test it
- When test is finished, task you need acceptance from the reviewer agent
- When the branch has commits (changes were made in the worktree), create a PR. After creating the PR, wait for all CI checks to pass before considering the work done.
- When E2E tests fail in CI, wait for the GitHub Actions run to finish, check the failure, fix it, push, and repeat until CI is green. Don't leave failing CI behind.
- When finishing a feature, add or update E2E tests. Remove E2E tests for removed features.

### CI/CD Pipeline

After pushing a PR, the CI pipeline runs in this order:
1. **Vercel Preview Deployment** (~90 seconds) - builds and deploys a preview
2. **E2E tests** start after the preview deployment finishes

When waiting for CI checks, wait ~90 seconds for the preview deployment to complete, then use `gh run watch` to monitor the E2E test run to completion.

### Development Best Practices

- When finish a task - review your changes in the browser (`playwright-cli`) and take a screenshot as evidence. Save screenshots to `screenshots/<short-feature-name>.png` (e.g. `screenshots/blocked-tasks-in-charts.png`). These are committed to git so they're visible in PR reviews.
- When a change affects any UI form or dialog (add/edit forms, settings dialogs, etc.), take a screenshot of each modified form specifically — not just the list/page view. Forms are common sources of layout regressions.

### Recommended Practices

- Use proactively qa agent and code review agent.