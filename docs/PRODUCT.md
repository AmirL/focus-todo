# Focus Todo — Product Overview

## What is Focus Todo?

Focus Todo is a task and goal management application for individuals who juggle responsibilities across multiple areas of life — work, personal projects, side ventures, health, and more. Beyond organizing tasks, it introduces a **daily focus system** called Initiative that helps users maintain balance by tracking which areas they focus on and suggesting where to direct energy next.

**Production URL**: https://doable-tasks.vercel.app

## Problem

People managing tasks across different life domains tend to over-invest in one area at the expense of others. Standard todo apps organize tasks but don't help users *balance* their attention. Focus Todo addresses this with a focus rotation mechanism that creates lightweight accountability without rigid scheduling.

## Core Concepts

### Tasks

A task is the fundamental unit of work. Tasks have a name, optional details, and belong to a **list** (category). They can be enriched with:

- **Scheduled date** — when the task should be done
- **Estimated duration** — expected time in minutes
- **Blocker flag** — marks high-priority tasks that block other progress
- **Goal link** — ties the task to a larger objective

Tasks flow through these states:

| State | Condition |
|-------|-----------|
| **Backlog** | No date assigned, not selected — available for future scheduling |
| **Selected** | Pulled from backlog for attention (via `selectedAt` timestamp) |
| **Scheduled** | Assigned to a specific future date |
| **Today** | Scheduled for today, or overdue from a past date |
| **Completed** | Marked as done |
| **Deleted** | Soft-deleted with a 24-hour recovery window |

### Goals

Goals represent larger objectives that tasks contribute toward. Each goal tracks:

- **Progress** — a percentage (0–100%) updated manually
- **Milestones** — progress snapshots with descriptions and dates, creating a history of progress over time
- **List** — the category the goal belongs to

Tasks can be linked to goals, connecting daily work to bigger objectives.

### Lists

Lists are categories that organize tasks and goals. Every user starts with two defaults:

- **Work** — professional tasks and goals
- **Personal** — personal tasks and goals

Users can create additional lists (e.g., "Side Projects", "Health"). Each list controls whether it **participates in Initiative rotation** and can be **archived** when no longer active without deleting its contents.

### Initiative (Daily Focus)

The Initiative is Focus Todo's defining feature. It answers: *"What area should I focus on today?"*

**How it works:**

1. The system analyzes focus history — which lists you've focused on and how frequently
2. It calculates a **balance score** showing attention distribution across participating lists
3. It **suggests** the list you've neglected most recently
4. You **accept** the suggestion or **override** it with your own choice, optionally noting why

The initiative is set one day ahead — each evening, you decide tomorrow's focus. The system tracks suggested vs. chosen lists, reasons for overrides, and a rolling balance history (up to 365 days).

This creates a lightweight accountability system for maintaining work-life balance without rigid scheduling.

## Features

### Task Management

| Feature | Description |
|---------|-------------|
| Quick add | Inline task creation from the main view |
| Edit dialog | Full editing — name, details, date, duration, blocker, list, goal |
| Complete / uncomplete | Toggle task completion with a checkbox |
| Snooze | Reschedule a task to a later date |
| Select from backlog | Pull unscheduled tasks into focus |
| Blocker flag | Mark tasks as high-priority blockers |
| Duration estimate | Set expected time in minutes |
| Drag-and-drop reorder | Reorder tasks within a list |
| Soft delete | 24-hour recovery window before permanent deletion |
| Spotlight search | Cmd+K / Ctrl+K for fast task lookup and navigation |

### Goal Tracking

- Create goals with title, description, and progress percentage
- Record milestones — progress snapshots with descriptions and dates
- Link tasks to goals
- Filter goals by list

### List Management

- Create, rename, and describe custom lists
- Control initiative participation per list
- Archive and unarchive lists
- Reorder lists
- Delete lists with automatic task/goal reassignment

### Initiative & Balance

- Daily focus suggestions based on historical balance
- Accept or override suggestions with a reason
- Balance dashboard showing focus distribution percentages
- Initiative history spanning up to 365 days

### Settings

- **List manager** — create, edit, archive, reorder, and delete lists
- **Initiative history** — view and analyze daily focus patterns
- **API keys** — generate and revoke keys for programmatic access

## Platforms

### Web Application

Focus Todo is a responsive web application accessible in any modern browser.

### Progressive Web App (PWA)

Installable on mobile (iOS, Android) and desktop (Chrome, Edge) for a native-like experience with offline support via service workers.

### External API

A full REST API provides programmatic access to all features: tasks, goals, lists, and initiative. Authentication uses API keys generated in Settings.

See [External API Documentation](./TASK_API.md) for the full endpoint reference, or [API Skill Reference](./TASK_API_SKILL.md) for a concise version optimized for LLM integrations.

## AI Suggestions

Tasks support AI-generated suggestions for improving task fields (name, details, etc.). When available:

- Each suggestion proposes a new value for a specific field
- Users can accept or reject each suggestion individually
- Suggestions are delivered through the API, enabling external AI tools to enhance task quality

## Authentication & Security

- Email/password authentication for user accounts
- Session-based auth for the web interface
- API key auth for programmatic access — keys are hashed server-side and revocable
- Per-user data isolation — users only access their own data

## Views & Navigation

The main interface provides filtered views of tasks:

| View | Shows |
|------|-------|
| **Today** | Tasks scheduled for today + overdue tasks |
| **Tomorrow** | Tasks scheduled for tomorrow (with initiative picker) |
| **Backlog** | Unscheduled, unselected tasks |
| **Selected** | Tasks pulled from backlog for attention |
| **All** | Complete task list |

Goals appear at the top of the main view, grouped by list.

## Glossary

| Term | Definition |
|------|------------|
| **Task** | A unit of work with a name, optional date, and list assignment |
| **Goal** | A larger objective tracked by progress and milestones |
| **List** | A category for organizing tasks and goals (e.g., "Work", "Personal") |
| **Initiative** | The daily focus system that suggests which list to concentrate on |
| **Blocker** | A high-priority flag on a task indicating it blocks other progress |
| **Milestone** | A progress snapshot on a goal with a description and date |
| **Backlog** | Tasks without a scheduled date or selection |
| **Soft delete** | Marking an item as deleted with a 24-hour recovery period |

## Related Documentation

| Document | Description |
|----------|-------------|
| [External API](./TASK_API.md) | Full REST API reference with examples |
| [API Skill Reference](./TASK_API_SKILL.md) | Concise API reference for LLM integrations |
| [Architecture](./FSD_ARCHITECTURE.md) | Technical architecture (Feature-Sliced Design) |
| [E2E Tests](./E2E_TESTS.md) | End-to-end testing setup and Cypress Cloud |
