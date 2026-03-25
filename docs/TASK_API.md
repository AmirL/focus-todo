# External API Documentation

This document describes the external API for programmatic access to tasks, goals, lists, and initiative (daily focus). All endpoints require API key authentication.

## Authentication

All API endpoints require authentication via API key. Pass the key using one of these methods:

- **Header**: `Authorization: Bearer <api_key>`
- **Header**: `X-API-Key: <api_key>`
- **Query param**: `?apiKey=<api_key>` (not recommended for production)

API keys can be created and managed in the application settings.

## Task Endpoints

### List Tasks

```
GET /api/tasks
```

Retrieve a list of tasks with optional filtering.

#### Query Parameters

| Parameter                | Type                                  | Default | Description                                                |
| ------------------------ | ------------------------------------- | ------- | ---------------------------------------------------------- |
| `on`                     | `today` \| `tomorrow` \| `YYYY-MM-DD` | -       | Filter by specific day. `today` also includes overdue (past incomplete) tasks |
| `since`                  | ISO date string                       | -       | Tasks with date >= since                                   |
| `until`                  | ISO date string                       | -       | Tasks with date < until                                    |
| `listId`                 | number                                | -       | Filter by list ID                                          |
| `goalId`                 | number                                | -       | Filter by goal ID                                          |
| `completed`              | `true` \| `false`                     | -       | Filter by completion status                                |
| `includeDeleted`         | `true` \| `false`                     | `false` | Include all deleted tasks                                  |
| `includeRecentlyDeleted` | `true` \| `false`                     | `false` | Include tasks deleted in last 24h                          |
| `tzOffset`               | number                                | `-180`  | Timezone offset from UTC in minutes (e.g., -180 for UTC+3) |
| `limit`                  | 1-500                                 | 100     | Maximum number of tasks to return                          |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/tasks?on=today&completed=false" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

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

---

### Get Single Task

```
GET /api/tasks/:id
```

Retrieve a single task by ID.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Task ID     |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/tasks/123" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

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

The `listDescription` field contains the description of the task's list (category), or `null` if the list has no description.

#### Error Responses

- `400 Bad Request` - Invalid task ID format
- `404 Not Found` - Task not found or deleted

---

### Create Task

```
POST /api/tasks
```

Create a new task.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Task name (max 300 chars) |
| `listId` | number | Yes | List ID (e.g., 1 for "Work", 2 for "Personal") |
| `details` | string | No | Task details/description |
| `date` | ISO date string | No | Scheduled date |
| `estimatedDuration` | number | No | Estimated duration in minutes |
| `isBlocker` | boolean | No | Whether task is a blocker |
| `selectedAt` | ISO date string | No | When task was selected |
| `goalId` | number \| null | No | Associated goal ID |

#### Example Request

```bash
curl -X POST "https://doable-tasks.vercel.app/api/tasks" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Write documentation",
    "listId": 1,
    "details": "API documentation for task endpoints",
    "date": "2026-01-26T10:00:00Z",
    "estimatedDuration": 45,
    "isBlocker": false
  }'
```

#### Example Response

```json
{
  "task": {
    "id": 124,
    "name": "Write documentation",
    "details": "API documentation for task endpoints",
    "date": "2026-01-26T10:00:00Z",
    "completedAt": null,
    "selectedAt": null,
    "estimatedDuration": 45,
    "isBlocker": false,
    "listId": 1,
    "deletedAt": null,
    "updatedAt": "2026-01-25T12:00:00Z",
    "createdAt": "2026-01-25T12:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null,
    "goalId": null
  }
}
```

**Status Code**: `201 Created`

#### Error Responses

- `400 Bad Request` - Missing required fields (name or listId)

---

### Update Task

```
PATCH /api/tasks/:id
```

Partially update an existing task. Only include fields you want to change.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Task ID     |

#### Request Body

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Task name |
| `details` | string | Task details |
| `date` | ISO date string \| null | Scheduled date |
| `completedAt` | ISO date string \| null | Completion timestamp |
| `selectedAt` | ISO date string \| null | Selection timestamp |
| `estimatedDuration` | number \| null | Duration in minutes |
| `isBlocker` | boolean | Blocker status |
| `listId` | number | List ID |
| `sortOrder` | number | Sort order |
| `aiSuggestions` | object \| null | AI-generated suggestions for task fields (see [AI Suggestions](#ai-suggestions)) |
| `goalId` | number \| null | Associated goal ID |

#### Example Request - Mark as Completed

```bash
curl -X PATCH "https://doable-tasks.vercel.app/api/tasks/123" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "completedAt": "2026-01-25T15:30:00Z"
  }'
```

#### Example Request - Update Multiple Fields

```bash
curl -X PATCH "https://doable-tasks.vercel.app/api/tasks/123" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated task name",
    "isBlocker": true,
    "estimatedDuration": 90
  }'
```

#### Example Request - Set AI Suggestions

```bash
curl -X PATCH "https://doable-tasks.vercel.app/api/tasks/123" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "aiSuggestions": {
      "name": {
        "suggestion": "A clearer task title",
        "userReaction": null
      },
      "details": {
        "suggestion": "Detailed breakdown:\n- [ ] Step 1\n- [ ] Step 2",
        "userReaction": null
      }
    }
  }'
```

#### Example Response

```json
{
  "task": {
    "id": 123,
    "name": "Updated task name",
    "details": "Original details preserved",
    "date": "2026-01-25T14:00:00Z",
    "completedAt": null,
    "selectedAt": null,
    "estimatedDuration": 90,
    "isBlocker": true,
    "listId": 1,
    "listDescription": "Work-related tasks and projects",
    "deletedAt": null,
    "updatedAt": "2026-01-25T15:00:00Z",
    "createdAt": "2026-01-25T09:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null,
    "goalId": null
  }
}
```

#### Error Responses

- `400 Bad Request` - Invalid task ID
- `404 Not Found` - Task not found or deleted

---

### Delete Task

```
DELETE /api/tasks/:id
```

Delete a task. By default, performs a soft delete (sets `deletedAt` timestamp).

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Task ID     |

#### Query Parameters

| Parameter   | Type              | Default | Description                           |
| ----------- | ----------------- | ------- | ------------------------------------- |
| `permanent` | `true` \| `false` | `false` | Permanently delete (cannot be undone) |

#### Example Request - Soft Delete

```bash
curl -X DELETE "https://doable-tasks.vercel.app/api/tasks/123" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Request - Permanent Delete

```bash
curl -X DELETE "https://doable-tasks.vercel.app/api/tasks/123?permanent=true" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "message": "Task deleted"
}
```

Or for permanent deletion:

```json
{
  "message": "Task permanently deleted"
}
```

#### Error Responses

- `400 Bad Request` - Invalid task ID
- `404 Not Found` - Task not found

---

## Goal Endpoints

### List Goals

```
GET /api/goals
```

Retrieve all goals for the authenticated user.

#### Query Parameters

| Parameter        | Type              | Default | Description                        |
| ---------------- | ----------------- | ------- | ---------------------------------- |
| `listId`         | number            | -       | Filter by list ID                  |
| `includeDeleted` | `true` \| `false` | `false` | Include soft-deleted goals         |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/goals" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "goals": [
    {
      "id": 1,
      "title": "Launch MVP",
      "description": "Ship the first version",
      "progress": 75,
      "listId": 1,
      "listName": "Work",
      "userId": "abc123",
      "deletedAt": null
    }
  ]
}
```

---

### Get Single Goal

```
GET /api/goals/:id
```

Retrieve a single goal by ID.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Goal ID     |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/goals/1" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "goal": {
    "id": 1,
    "title": "Launch MVP",
    "description": "Ship the first version",
    "progress": 75,
    "listId": 1,
    "listName": "Work",
    "userId": "abc123",
    "deletedAt": null
  }
}
```

#### Error Responses

- `400 Bad Request` - Invalid goal ID format
- `404 Not Found` - Goal not found or deleted

---

### Create Goal

```
POST /api/goals
```

Create a new goal.

#### Request Body

| Field         | Type   | Required | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| `title`       | string | Yes      | Goal title                     |
| `listId`      | number | Yes      | List ID the goal belongs to    |
| `description` | string | No       | Goal description               |
| `progress`    | number | No       | Progress percentage (default 0)|

#### Example Request

```bash
curl -X POST "https://doable-tasks.vercel.app/api/goals" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Launch MVP",
    "listId": 1,
    "description": "Ship the first version"
  }'
```

**Status Code**: `201 Created`

#### Error Responses

- `400 Bad Request` - Missing required fields (title or listId)
- `404 Not Found` - List not found

---

### Update Goal

```
PATCH /api/goals/:id
```

Partially update an existing goal. Only include fields you want to change.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Goal ID     |

#### Request Body

| Field         | Type                       | Description            |
| ------------- | -------------------------- | ---------------------- |
| `title`       | string                     | Goal title             |
| `description` | string                     | Goal description       |
| `progress`    | number                     | Progress (0-100)       |
| `listId`      | number                     | Move to different list |
| `deletedAt`   | ISO date string \| null    | Set null to restore    |

#### Example Request

```bash
curl -X PATCH "https://doable-tasks.vercel.app/api/goals/1" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"progress": 100}'
```

#### Error Responses

- `400 Bad Request` - Invalid goal ID
- `404 Not Found` - Goal not found or deleted

---

### Delete Goal

```
DELETE /api/goals/:id
```

Delete a goal. By default, performs a soft delete (sets `deletedAt` timestamp).

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Goal ID     |

#### Query Parameters

| Parameter   | Type              | Default | Description                           |
| ----------- | ----------------- | ------- | ------------------------------------- |
| `permanent` | `true` \| `false` | `false` | Permanently delete (cannot be undone) |

#### Example Request

```bash
curl -X DELETE "https://doable-tasks.vercel.app/api/goals/1" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "message": "Goal deleted"
}
```

#### Error Responses

- `400 Bad Request` - Invalid goal ID
- `404 Not Found` - Goal not found

---

## List Endpoints

### List All Lists

```
GET /api/lists
```

Retrieve all lists (categories) for the authenticated user.

#### Query Parameters

| Parameter         | Type              | Default | Description                  |
| ----------------- | ----------------- | ------- | ---------------------------- |
| `includeArchived` | `true` \| `false` | `false` | Include archived lists       |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/lists" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "lists": [
    {
      "id": 1,
      "name": "Work",
      "description": "Work-related tasks and projects",
      "userId": "abc123",
      "isDefault": true,
      "participatesInInitiative": true,
      "sortOrder": 0,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z",
      "archivedAt": null
    }
  ]
}
```

---

### Get Single List

```
GET /api/lists/:id
```

Retrieve a single list by ID.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | List ID     |

#### Error Responses

- `400 Bad Request` - Invalid list ID format
- `404 Not Found` - List not found

---

### Create List

```
POST /api/lists
```

Create a new list.

#### Request Body

| Field                      | Type    | Required | Description                                        |
| -------------------------- | ------- | -------- | -------------------------------------------------- |
| `name`                     | string  | Yes      | List name (max 255 chars)                          |
| `description`              | string  | No       | List description                                   |
| `participatesInInitiative` | boolean | No       | Whether list participates in initiative (default: true) |

#### Example Request

```bash
curl -X POST "https://doable-tasks.vercel.app/api/lists" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Side Projects",
    "description": "Personal side project tasks"
  }'
```

**Status Code**: `201 Created`

#### Error Responses

- `400 Bad Request` - Missing name or name too long
- `409 Conflict` - A list with this name already exists

---

### Update List

```
PATCH /api/lists/:id
```

Update an existing list. Only include fields you want to change.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | List ID     |

#### Request Body

| Field                      | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| `name`                     | string  | List name (max 255 chars)                    |
| `description`              | string  | List description                             |
| `participatesInInitiative` | boolean | Initiative participation                     |
| `archived`                 | boolean | Archive/unarchive the list                   |

#### Example Request - Archive a List

```bash
curl -X PATCH "https://doable-tasks.vercel.app/api/lists/3" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"archived": true}'
```

#### Error Responses

- `400 Bad Request` - Invalid list ID or no valid fields
- `404 Not Found` - List not found
- `409 Conflict` - Duplicate list name

---

### Delete List

```
DELETE /api/lists/:id
```

Permanently delete a list. If the list has associated tasks or goals, you must specify a target list to reassign them to.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | List ID     |

#### Query Parameters

| Parameter    | Type   | Description                                        |
| ------------ | ------ | -------------------------------------------------- |
| `reassignTo` | number | List ID to move tasks/goals to before deletion     |

#### Example Request

```bash
curl -X DELETE "https://doable-tasks.vercel.app/api/lists/3?reassignTo=1" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "message": "List deleted successfully"
}
```

#### Error Responses

- `400 Bad Request` - Invalid list ID, or list has items and no `reassignTo` specified
- `404 Not Found` - List or target list not found

---

## Initiative Endpoints

The initiative system manages daily focus — which list (category) to focus on each day. It tracks suggestions, user choices, and balance across lists.

### Get Current Initiative

```
GET /api/initiative
```

Get today's and tomorrow's initiative along with balance data and a suggested list for upcoming days.

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/initiative" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "today": {
    "id": 42,
    "userId": "abc123",
    "date": "2026-02-21",
    "suggestedListId": 1,
    "chosenListId": null,
    "reason": null,
    "setAt": "2026-02-20T18:00:00.000Z",
    "changedAt": null
  },
  "tomorrow": null,
  "suggestedList": {
    "id": 2,
    "name": "Personal",
    "participatesInInitiative": true,
    "lastTouchedAt": "2026-02-19T00:00:00.000Z"
  },
  "balance": [
    { "listId": 1, "listName": "Work", "count": 18, "percentage": 60, "lastUsedDate": "2026-02-21" },
    { "listId": 2, "listName": "Personal", "count": 12, "percentage": 40, "lastUsedDate": "2026-02-19" }
  ],
  "participatingLists": [
    { "id": 1, "name": "Work", "participatesInInitiative": true },
    { "id": 2, "name": "Personal", "participatesInInitiative": true }
  ]
}
```

---

### Get Initiative by Date

```
GET /api/initiative/:date
```

Get the initiative for a specific date.

#### Path Parameters

| Parameter | Type       | Description                |
| --------- | ---------- | -------------------------- |
| `date`    | YYYY-MM-DD | The date to look up        |

#### Error Responses

- `400 Bad Request` - Invalid date format
- `404 Not Found` - No initiative for this date

---

### Set Initiative (Create)

```
POST /api/initiative
```

Set the focus list for a date. Can only set initiative for today or tomorrow.

#### Request Body

| Field    | Type       | Required | Description                                   |
| -------- | ---------- | -------- | --------------------------------------------- |
| `listId` | number     | Yes      | List ID to focus on                           |
| `date`   | YYYY-MM-DD | No       | Target date (default: tomorrow)               |
| `reason` | string     | No       | Reason for choosing this list                 |

#### Example Request

```bash
curl -X POST "https://doable-tasks.vercel.app/api/initiative" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"listId": 2, "date": "2026-02-22", "reason": "Catching up on personal tasks"}'
```

**Status Code**: `201 Created`

#### Error Responses

- `400 Bad Request` - Missing listId or invalid date
- `404 Not Found` - List not found
- `409 Conflict` - Initiative for this date already exists (use PATCH to change)

---

### Change Initiative

```
PATCH /api/initiative/:date
```

Change the focus list for a specific date that already has an initiative set.

#### Path Parameters

| Parameter | Type       | Description         |
| --------- | ---------- | ------------------- |
| `date`    | YYYY-MM-DD | The date to update  |

#### Request Body

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| `listId` | number | Yes      | New list ID to focus on        |
| `reason` | string | No       | Reason for the change          |

#### Error Responses

- `400 Bad Request` - Missing listId or invalid date
- `404 Not Found` - No initiative for this date or list not found

---

### Get Initiative History

```
GET /api/initiative/history
```

Get initiative history with balance data for a configurable period.

#### Query Parameters

| Parameter | Type   | Default | Description                        |
| --------- | ------ | ------- | ---------------------------------- |
| `days`    | 1-365  | 30      | Number of days to look back        |

#### Example Request

```bash
curl -X GET "https://doable-tasks.vercel.app/api/initiative/history?days=60" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Response

```json
{
  "initiatives": [
    {
      "id": 42,
      "userId": "abc123",
      "date": "2026-02-21",
      "suggestedListId": 1,
      "chosenListId": null,
      "reason": null,
      "setAt": "2026-02-20T18:00:00.000Z",
      "changedAt": null,
      "suggestedListName": "Work",
      "chosenListName": null,
      "effectiveListName": "Work"
    }
  ],
  "balance": [
    { "listId": 1, "listName": "Work", "count": 18, "percentage": 60, "lastUsedDate": "2026-02-21" }
  ],
  "period": {
    "startDate": "2026-01-22",
    "endDate": "2026-02-21",
    "days": 30
  }
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code  | Description                               |
| ----- | ----------------------------------------- |
| `200` | Success                                   |
| `201` | Created (POST requests)                   |
| `400` | Bad Request - Invalid input               |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource doesn't exist        |
| `409` | Conflict - Duplicate resource             |
| `500` | Internal Server Error                     |

---

## Date Handling

- All dates are handled in UTC by default
- Use the `tzOffset` parameter in GET requests to receive dates adjusted for your timezone
- When creating/updating tasks, send dates in ISO 8601 format (e.g., `2026-01-25T10:00:00Z`)

---

## AI Suggestions

Tasks may include an `aiSuggestions` field containing AI-generated improvement suggestions for task fields.

### Structure

```json
{
  "aiSuggestions": {
    "<fieldName>": {
      "suggestion": "string - the proposed value",
      "userReaction": null | "accepted" | "rejected"
    }
  }
}
```

- Keys correspond to task field names (e.g., `name`, `details`)
- `suggestion`: The proposed new value for the field
- `userReaction`: `null` when pending review, `"accepted"` or `"rejected"` after user action
- Set `aiSuggestions` to `null` to clear all suggestions

---

## Rate Limiting

Currently, there are no rate limits enforced. This may change in future versions.

---

## Examples

### Complete Workflow

```bash
# 1. Create a task
TASK=$(curl -s -X POST "https://doable-tasks.vercel.app/api/tasks" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "New task", "listId": 1}')

TASK_ID=$(echo $TASK | jq -r '.task.id')

# 2. Update the task
curl -X PATCH "https://doable-tasks.vercel.app/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isBlocker": true, "estimatedDuration": 30}'

# 3. Mark as completed
curl -X PATCH "https://doable-tasks.vercel.app/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"completedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

# 4. Delete the task
curl -X DELETE "https://doable-tasks.vercel.app/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Fetch Today's Incomplete Tasks

```bash
curl -X GET "https://doable-tasks.vercel.app/api/tasks?on=today&completed=false" \
  -H "Authorization: Bearer $API_KEY"
```

### Fetch All Blockers

```bash
curl -X GET "https://doable-tasks.vercel.app/api/tasks?completed=false" \
  -H "Authorization: Bearer $API_KEY" | jq '.tasks | map(select(.isBlocker == true))'
```
