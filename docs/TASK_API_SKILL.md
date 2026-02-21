# Focus Todo — Task API Skill

You have access to a task management API. Use it to create, read, update, and delete tasks on behalf of the user.

## Connection

- **Base URL**: `https://doable-tasks.vercel.app`
- **Auth**: Pass the API key via header `Authorization: Bearer <API_KEY>`
- **Content-Type**: `application/json` for request bodies

## Endpoints

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
| `listId` | number | Filter by list (1 = Work, 2 = Personal) |
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
| `listId` | number | **Yes** | 1 = Work, 2 = Personal |
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
| 404 | Task not found or deleted |
| 500 | Server error |

## Rules and Conventions

- All dates must be **ISO 8601 / UTC** (e.g., `2026-01-25T10:00:00Z`).
- `listId` is required when creating tasks. Common values: **1** (Work), **2** (Personal).
- Soft-deleted tasks (with `deletedAt` set) are hidden by default from list queries.
- To mark a task complete, PATCH with `"completedAt": "<current ISO timestamp>"`.
- To uncomplete a task, PATCH with `"completedAt": null`.
- To restore a soft-deleted task, PATCH with `"deletedAt": null` (use `includeDeleted=true` to find it first).
- The `updatedAt` field is set automatically by the server on every update.

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
