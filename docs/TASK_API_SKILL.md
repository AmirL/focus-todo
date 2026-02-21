# Focus Todo — API Skill

You have access to a task management API. Use it to manage tasks, goals, lists, and daily initiative (focus) on behalf of the user.

## Connection

- **Base URL**: `https://doable-tasks.vercel.app`
- **Auth**: Pass the API key via header `Authorization: Bearer <API_KEY>`
- **Content-Type**: `application/json` for request bodies

## Task Endpoints

### 1. List Tasks

```
GET /api/tasks
```

Query parameters (all optional):

| Param | Type | Description |
|-------|------|-------------|
| `on` | `today` \| `tomorrow` \| `YYYY-MM-DD` | Filter by day |
| `since` | ISO 8601 date | Tasks with date >= value |
| `until` | ISO 8601 date | Tasks with date < value |
| `listId` | number | Filter by list ID |
| `goalId` | number | Filter by associated goal |
| `completed` | `true` \| `false` | Filter by completion status |
| `includeDeleted` | `true` \| `false` | Include soft-deleted tasks (default: false) |
| `includeRecentlyDeleted` | `true` \| `false` | Include tasks deleted in last 24h (default: false) |
| `tzOffset` | number | Timezone offset from UTC in minutes (e.g., -120 for UTC+2) |
| `limit` | 1–500 | Max results (default: 100) |

Response: `200 OK`

```json
{
  "tasks": [
    {
      "id": 1,
      "name": "Complete project report",
      "details": "Include Q4 metrics",
      "date": "2026-01-25T09:00:00+00:00",
      "completedAt": null,
      "selectedAt": null,
      "estimatedDuration": 60,
      "isBlocker": false,
      "listId": 1,
      "deletedAt": null,
      "updatedAt": "2026-01-25T08:00:00+00:00",
      "createdAt": "2026-01-24T10:00:00+00:00",
      "sortOrder": 0,
      "aiSuggestions": null,
      "goalId": null
    }
  ]
}
```

### 2. Get Single Task

```
GET /api/tasks/:id
```

Response: `200 OK`

```json
{
  "task": {
    "id": 123,
    "name": "Review pull request",
    "details": "Check for security issues",
    "date": "2026-01-25T14:00:00Z",
    "completedAt": null,
    "selectedAt": null,
    "estimatedDuration": 30,
    "isBlocker": true,
    "listId": 1,
    "listDescription": "Work-related tasks and projects",
    "deletedAt": null,
    "updatedAt": "2026-01-25T10:00:00Z",
    "createdAt": "2026-01-25T09:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null,
    "goalId": null
  }
}
```

Note: `listDescription` is only included in the single-task endpoint.

### 3. Create Task

```
POST /api/tasks
```

Request body:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Task name (max 300 chars) |
| `listId` | number | **Yes** | List ID (use GET /api/lists to find IDs) |
| `details` | string | No | Description or notes |
| `date` | ISO 8601 string | No | Scheduled date (UTC) |
| `estimatedDuration` | number | No | Minutes |
| `isBlocker` | boolean | No | Mark as blocker (default: false) |
| `selectedAt` | ISO 8601 string | No | Selection timestamp |
| `goalId` | number \| null | No | Associated goal ID |

Response: `201 Created` — returns `{ "task": { ... } }`

### 4. Update Task

```
PATCH /api/tasks/:id
```

Send only the fields you want to change:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Task name |
| `details` | string | Description |
| `date` | ISO 8601 \| null | Scheduled date (null to clear) |
| `completedAt` | ISO 8601 \| null | Set to mark complete, null to uncomplete |
| `selectedAt` | ISO 8601 \| null | Selection timestamp |
| `estimatedDuration` | number \| null | Minutes |
| `isBlocker` | boolean | Blocker status |
| `listId` | number | Move to different list |
| `sortOrder` | number | Sort position |
| `goalId` | number \| null | Associated goal |
| `aiSuggestions` | object \| null | AI suggestions (see below) |

Response: `200 OK` — returns `{ "task": { ... } }`

### 5. Delete Task

```
DELETE /api/tasks/:id
```

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `permanent` | `true` \| `false` | `false` | Permanent delete (irreversible) |

Response: `200 OK` — `{ "message": "Task deleted" }` or `{ "message": "Task permanently deleted" }`

## Goal Endpoints

### 6. List Goals

```
GET /api/goals
```

| Param | Type | Description |
|-------|------|-------------|
| `listId` | number | Filter by list ID |
| `includeDeleted` | `true` \| `false` | Include soft-deleted goals (default: false) |

Response: `200 OK` — `{ "goals": [{ id, title, description, progress, listId, listName, deletedAt, ... }] }`

### 7. Get Single Goal

```
GET /api/goals/:id
```

Response: `200 OK` — `{ "goal": { id, title, description, progress, listId, listName, deletedAt, ... } }`

### 8. Create Goal

```
POST /api/goals
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Goal title |
| `listId` | number | **Yes** | List ID the goal belongs to |
| `description` | string | No | Goal description |
| `progress` | number | No | Progress 0–100 (default: 0) |

Response: `201 Created` — returns `{ "goal": { ... } }`

### 9. Update Goal

```
PATCH /api/goals/:id
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Goal title |
| `description` | string | Description |
| `progress` | number | Progress 0–100 |
| `listId` | number | Move to different list |
| `deletedAt` | ISO 8601 \| null | Set null to restore a soft-deleted goal |

Response: `200 OK` — returns `{ "goal": { ... } }`

### 10. Delete Goal

```
DELETE /api/goals/:id
```

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `permanent` | `true` \| `false` | `false` | Permanent delete (irreversible) |

Response: `200 OK` — `{ "message": "Goal deleted" }` or `{ "message": "Goal permanently deleted" }`

## List Endpoints

### 11. List All Lists

```
GET /api/lists
```

| Param | Type | Description |
|-------|------|-------------|
| `includeArchived` | `true` \| `false` | Include archived lists (default: false) |

Response: `200 OK` — `{ "lists": [{ id, name, description, isDefault, participatesInInitiative, sortOrder, createdAt, updatedAt, archivedAt }] }`

### 12. Get Single List

```
GET /api/lists/:id
```

Response: `200 OK` — `{ "list": { ... } }`

### 13. Create List

```
POST /api/lists
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | List name (max 255 chars) |
| `description` | string | No | List description |
| `participatesInInitiative` | boolean | No | Participates in daily focus (default: true) |

Response: `201 Created` — returns `{ "list": { ... } }`

Error `409` if a list with the same name exists.

### 14. Update List

```
PATCH /api/lists/:id
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | List name (max 255 chars) |
| `description` | string | Description |
| `participatesInInitiative` | boolean | Initiative participation |
| `archived` | boolean | Archive/unarchive the list |

Response: `200 OK` — returns `{ "list": { ... } }`

### 15. Delete List

```
DELETE /api/lists/:id
```

| Query Param | Type | Description |
|-------------|------|-------------|
| `reassignTo` | number | List ID to move tasks/goals to before deletion |

If the list has tasks or goals and no `reassignTo` is specified, returns `400` with `{ error, tasksCount, goalsCount }`.

Response: `200 OK` — `{ "message": "List deleted successfully" }`

## Initiative Endpoints

The initiative system manages daily focus — which list to focus on each day.

### 16. Get Current Initiative

```
GET /api/initiative
```

Returns today/tomorrow initiatives, balance data, and a suggested list for upcoming days.

Response: `200 OK`

```json
{
  "today": { "id": 42, "date": "2026-02-21", "suggestedListId": 1, "chosenListId": null, "reason": null, "setAt": "...", "changedAt": null },
  "tomorrow": null,
  "suggestedList": { "id": 2, "name": "Personal", "participatesInInitiative": true, "lastTouchedAt": "..." },
  "balance": [{ "listId": 1, "listName": "Work", "count": 18, "percentage": 60, "lastUsedDate": "2026-02-21" }],
  "participatingLists": [{ "id": 1, "name": "Work", "participatesInInitiative": true }]
}
```

### 17. Get Initiative by Date

```
GET /api/initiative/:date
```

`:date` is `YYYY-MM-DD`. Returns `{ "initiative": { ... } }` or `404`.

### 18. Set Initiative

```
POST /api/initiative
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `listId` | number | **Yes** | List to focus on |
| `date` | YYYY-MM-DD | No | Target date (default: tomorrow). Only today or tomorrow allowed. |
| `reason` | string | No | Reason for choice |

Response: `201 Created` — returns `{ "initiative": { ... } }`

Error `409` if initiative already exists for that date (use PATCH to change).

### 19. Change Initiative

```
PATCH /api/initiative/:date
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `listId` | number | **Yes** | New list to focus on |
| `reason` | string | No | Reason for change |

Response: `200 OK` — returns `{ "initiative": { ... } }`

### 20. Get Initiative History

```
GET /api/initiative/history
```

| Param | Type | Description |
|-------|------|-------------|
| `days` | 1–365 | Days to look back (default: 30) |

Returns `{ initiatives, balance, period: { startDate, endDate, days } }`. Each initiative includes `suggestedListName`, `chosenListName`, `effectiveListName`.

## AI Suggestions

Tasks can carry AI-generated suggestions for field improvements. Structure:

```json
{
  "aiSuggestions": {
    "<fieldName>": {
      "suggestion": "proposed new value",
      "userReaction": null
    }
  }
}
```

- Keys are task field names (e.g., `name`, `details`)
- `userReaction`: `null` (pending), `"accepted"`, or `"rejected"`
- Set `aiSuggestions` to `null` to clear all suggestions

## Error Format

All errors return:

```json
{ "error": "Description of what went wrong" }
```

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid input, missing required fields) |
| 401 | Unauthorized (missing or invalid API key) |
| 404 | Resource not found or deleted |
| 409 | Conflict (duplicate resource) |
| 500 | Server error |

## Rules and Conventions

- All dates must be **ISO 8601 / UTC** (e.g., `2026-01-25T10:00:00Z`). Initiative dates use `YYYY-MM-DD`.
- `listId` is required when creating tasks and goals. Use `GET /api/lists` to discover available list IDs.
- Soft-deleted tasks/goals are hidden by default from list queries.
- To mark a task complete, PATCH with `"completedAt": "<current ISO timestamp>"`.
- To uncomplete a task, PATCH with `"completedAt": null`.
- To restore a soft-deleted task, PATCH with `"deletedAt": null` (use `includeDeleted=true` to find it first).
- To restore a soft-deleted goal, PATCH with `"deletedAt": null` (use `includeDeleted=true` to find it first).
- The `updatedAt` field is set automatically by the server on every update.
- Initiative can only be set for today or tomorrow.

## Common Workflows

### Get today's incomplete tasks

```
GET /api/tasks?on=today&completed=false
```

### Create and schedule a task

```
POST /api/tasks
{ "name": "Write report", "listId": 1, "date": "2026-02-22T09:00:00Z", "estimatedDuration": 45 }
```

### Mark a task complete

```
PATCH /api/tasks/123
{ "completedAt": "2026-02-21T15:30:00Z" }
```

### Move a task to a different list

```
PATCH /api/tasks/123
{ "listId": 2 }
```

### Soft-delete and then restore

```
DELETE /api/tasks/123

GET /api/tasks?includeDeleted=true    (find the task)
PATCH /api/tasks/123
{ "deletedAt": null }
```

### Get all goals for a list

```
GET /api/goals?listId=1
```

### Set tomorrow's focus

```
POST /api/initiative
{ "listId": 2, "reason": "Catching up on personal tasks" }
```

### Check initiative balance

```
GET /api/initiative/history?days=30
```
