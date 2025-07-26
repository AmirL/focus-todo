# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `pnpm run dev` (runs on port 8000)
- **Build**: `pnpm run build` (includes running tests first)
- **Test**: `pnpm test` or `vitest run`
- **Lint**: `pnpm run lint`
- **TypeScript check**: `pnpm tsc --noEmit` (type checking without emitting files)
- **Database migrations**: `pnpm run db:generate` and `pnpm run db:migrate`
- **Architecture analysis**: `pnpm run fsd` (Feature-Sliced Design linting)

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
- **shared/ui/goal/**: Goal-specific reusable components
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
- **Testing**: Vitest with globals enabled

### API Routes Pattern

API routes follow RESTful patterns:

- GET `/api/get-tasks` and `/api/get-goals`
- POST `/api/create-task` and `/api/create-goal`
- PUT `/api/update-task` and `/api/update-goal`

All API routes require admin authentication via Better Auth.

### Development Notes

- **Package Manager**: This project uses pnpm, not npm
- Component development should follow existing Radix UI + Tailwind patterns
- New features should be structured according to FSD layers
- Database changes require running migrations via `pnpm run db:generate` and `pnpm run db:migrate`
- Always run `pnpm tsc --noEmit` before committing to ensure TypeScript compliance
- The steiger config has specific FSD rules disabled - follow existing patterns rather than strict FSD compliance

### Testing Guidelines

- When finish task, use playwright mcp to test it
- When finish task you need acceptance from the reviewer agent
