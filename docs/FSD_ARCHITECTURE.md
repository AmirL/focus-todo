# Feature-Sliced Design (FSD) Architecture Reference

This document outlines the Feature-Sliced Design principles used in this project.

## Overview

Feature-Sliced Design is an architectural pattern that organizes code into layers, slices, and segments to create maintainable, scalable applications with clear separation of concerns.

## Layer Hierarchy

Layers are organized from most responsibility and dependency to least:

### 3. Pages

- **Purpose**: Website/application pages (screens/activities)
- **Structure**: One page = one slice (can group similar pages)
- **Common segments**:
  - `ui/` - page UI, loading states, error boundaries
  - `api/` - data fetching and mutations
- **Note**: No limit on code amount as long as it's navigable

### 4. Widgets

- **Purpose**: Large self-sufficient UI blocks
- **Use when**: Reused across multiple pages OR large independent blocks
- **Avoid when**: Block makes up most page content and is never reused
- **Examples**: Page layouts, reusable complex components

### 5. Features

- **Purpose**: Main user interactions that users care about
- **Key principle**: Not everything needs to be a feature
- **Good indicator**: Reused on several pages
- **Common segments**:
  - `ui/` - interaction forms/components
  - `api/` - action-related API calls
  - `model/` - validation, internal state
  - `config/` - feature flags

### 6. Entities

- **Purpose**: Real-world business concepts
- **Examples**: User, Post, Group, Product
- **Common segments**:
  - `model/` - data storage, validation schemas
  - `api/` - entity-related requests
  - `ui/` - visual representation (reusable across pages)

### 7. Shared (Bottom Layer)

- **Purpose**: Foundation layer, external connections
- **Contains**: Segments only (no slices)
- **Common segments**:
  - `api/` - API client, request functions
  - `ui/` - UI kit, reusable components
  - `lib/` - focused internal libraries (not utils/helpers)
  - `config/` - environment variables, global flags
  - `routes/` - route constants/patterns
  - `i18n/` - translation setup

## Import Rule

**Critical Rule**: A module can only import from layers strictly below it.

```
App ←─ can import from all layers below
├─ Pages ←─ can import from Widgets, Features, Entities, Shared
├─ Widgets ←─ can import from Features, Entities, Shared
├─ Features ←─ can import from Entities, Shared
├─ Entities ←─ can import from Shared only
└─ Shared ←─ foundation layer, no imports from above
```

**Exceptions**: App and Shared layers can import segments within themselves freely.

## Slices and Segments

### Slices (Second Level)

- **Purpose**: Group code by business meaning
- **Naming**: Not standardized - determined by business domain
- **Independence**: Zero coupling between slices on same layer
- **Cohesion**: High cohesion within each slice
- **Layers with slices**: Pages, Widgets, Features, Entities
- **Layers without slices**: App, Shared

### Segments (Third Level)

- **Purpose**: Group code by technical nature
- **Standardized names**:
  - `ui/` - UI components, styles, formatters
  - `api/` - backend interactions, requests, types
  - `model/` - schemas, stores, business logic
  - `lib/` - slice-specific library code
  - `config/` - configuration, feature flags

### Custom Segments

- Allowed, especially in App and Shared layers
- Name should describe **purpose**, not essence
- ❌ Bad: `components/`, `hooks/`, `types/`
- ✅ Good: `authentication/`, `routing/`, `monitoring/`

## Public API Rule

**Requirement**: Every slice and segment must provide a public API.

**Implementation**:

- Create `index.ts` files that export public interfaces
- External modules can ONLY import from public API
- Internal file structure should be hidden

**Example**:

```typescript
// features/auth/index.ts
export { LoginForm } from './ui/LoginForm';
export { useAuth } from './model/auth-store';
export type { User } from './model/types';

// ❌ Don't import internals directly
import { validateEmail } from 'features/auth/lib/validation';

// ✅ Import from public API
import { LoginForm, useAuth } from 'features/auth';
```

## Entity Relationships

When entities need to reference each other, use the `@x` notation for cross-imports:

```typescript
// entities/artist/model/artist.ts
import type { Song } from 'entities/song/@x/artist';

// entities/song/@x/artist.ts
export type { Song } from '../model/song.ts';
```

## Best Practices

### For Features Layer

- Not everything needs to be a feature
- Good indicator: reused on multiple pages
- Optimize for newcomer experience discovering functionality

### For Shared Layer

- No business logic
- Libraries should have focused areas (not utils/helpers)
- Document library purpose in README
- Business-themed UI components are acceptable (company logo, layouts)

### For Widgets Layer

- Use for large, self-sufficient UI blocks
- Must be reused OR be large independent blocks
- Consider for nested routing systems (like Remix router blocks)

### General Guidelines

- Don't use every layer - only add if valuable
- Typical minimum: Shared, Pages, App
- Slice groups allowed but maintain isolation
- Zero coupling between slices on same layer
- High cohesion within slices

## Project-Specific Organization

### Task-Related Components

- **Generic task UI**: `shared/ui/task/`
- **Task business logic**: `entities/task/`
- **Task features**: `features/tasks/`

### Goal-Related Components

- **Generic goal UI**: `shared/ui/goal/`
- **Goal business logic**: `entities/goal/`
- **Goal features**: `features/goals/`

This structure ensures proper separation of concerns while maintaining Feature-Sliced Design principles.
