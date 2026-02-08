# Task API Documentation

This document describes the external Task API for programmatic access to tasks. All endpoints require API key authentication.

## Authentication

All API endpoints require authentication via API key. Pass the key using one of these methods:

- **Header**: `Authorization: Bearer <api_key>`
- **Header**: `X-API-Key: <api_key>`
- **Query param**: `?apiKey=<api_key>` (not recommended for production)

API keys can be created and managed in the application settings.

## Endpoints

### List Tasks

```
GET /api/tasks
```

Retrieve a list of tasks with optional filtering.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `on` | `today` \| `tomorrow` \| `YYYY-MM-DD` | - | Filter by specific day |
| `since` | ISO date string | - | Tasks with date >= since |
| `until` | ISO date string | - | Tasks with date < until |
| `listId` | number | - | Filter by list ID |
| `completed` | `true` \| `false` | - | Filter by completion status |
| `includeDeleted` | `true` \| `false` | `false` | Include all deleted tasks |
| `includeRecentlyDeleted` | `true` \| `false` | `false` | Include tasks deleted in last 24h |
| `tzOffset` | number | `0` | Timezone offset from UTC in minutes (e.g., -120 for UTC+2) |
| `limit` | 1-500 | 100 | Maximum number of tasks to return |

#### Example Request

```bash
curl -X GET "https://your-domain.com/api/tasks?on=today&completed=false" \
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
      "list": "Work",
      "listId": 1,
      "deletedAt": null,
      "updatedAt": "2026-01-25T08:00:00+00:00",
      "createdAt": "2026-01-24T10:00:00+00:00",
      "sortOrder": 0,
      "aiSuggestions": null
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

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Task ID |

#### Example Request

```bash
curl -X GET "https://your-domain.com/api/tasks/123" \
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
    "list": "Work",
    "listId": 1,
    "listDescription": "Work-related tasks and projects",
    "deletedAt": null,
    "updatedAt": "2026-01-25T10:00:00Z",
    "createdAt": "2026-01-25T09:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null
  }
}
```

The `listDescription` field contains the description of the task's list (category), or `null` if the list has no description or the task has no `listId`.

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
| `list` | string | Yes | List name (e.g., "Work", "Personal") |
| `details` | string | No | Task details/description |
| `date` | ISO date string | No | Scheduled date |
| `estimatedDuration` | number | No | Estimated duration in minutes |
| `isBlocker` | boolean | No | Whether task is a blocker |
| `listId` | number | No | List ID (alternative to `list`) |
| `selectedAt` | ISO date string | No | When task was selected |

#### Example Request

```bash
curl -X POST "https://your-domain.com/api/tasks" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Write documentation",
    "list": "Work",
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
    "list": "Work",
    "listId": null,
    "deletedAt": null,
    "updatedAt": "2026-01-25T12:00:00Z",
    "createdAt": "2026-01-25T12:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null
  }
}
```

**Status Code**: `201 Created`

#### Error Responses

- `400 Bad Request` - Missing required fields (name or list)

---

### Update Task

```
PATCH /api/tasks/:id
```

Partially update an existing task. Only include fields you want to change.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Task ID |

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
| `list` | string | List name |
| `listId` | number | List ID |
| `sortOrder` | number | Sort order |
| `aiSuggestions` | object \| null | AI-generated suggestions for task fields (see [AI Suggestions](#ai-suggestions)) |

#### Example Request - Mark as Completed

```bash
curl -X PATCH "https://your-domain.com/api/tasks/123" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "completedAt": "2026-01-25T15:30:00Z"
  }'
```

#### Example Request - Update Multiple Fields

```bash
curl -X PATCH "https://your-domain.com/api/tasks/123" \
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
curl -X PATCH "https://your-domain.com/api/tasks/123" \
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
    "list": "Work",
    "listId": 1,
    "listDescription": "Work-related tasks and projects",
    "deletedAt": null,
    "updatedAt": "2026-01-25T15:00:00Z",
    "createdAt": "2026-01-25T09:00:00Z",
    "sortOrder": 0,
    "aiSuggestions": null
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

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Task ID |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `permanent` | `true` \| `false` | `false` | Permanently delete (cannot be undone) |

#### Example Request - Soft Delete

```bash
curl -X DELETE "https://your-domain.com/api/tasks/123" \
  -H "Authorization: Bearer your_api_key"
```

#### Example Request - Permanent Delete

```bash
curl -X DELETE "https://your-domain.com/api/tasks/123?permanent=true" \
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

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created (POST requests) |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |

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
TASK=$(curl -s -X POST "https://your-domain.com/api/tasks" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "New task", "list": "Work"}')

TASK_ID=$(echo $TASK | jq -r '.task.id')

# 2. Update the task
curl -X PATCH "https://your-domain.com/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isBlocker": true, "estimatedDuration": 30}'

# 3. Mark as completed
curl -X PATCH "https://your-domain.com/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"completedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

# 4. Delete the task
curl -X DELETE "https://your-domain.com/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Fetch Today's Incomplete Tasks

```bash
curl -X GET "https://your-domain.com/api/tasks?on=today&completed=false" \
  -H "Authorization: Bearer $API_KEY"
```

### Fetch All Blockers

```bash
curl -X GET "https://your-domain.com/api/tasks?completed=false" \
  -H "Authorization: Bearer $API_KEY" | jq '.tasks | map(select(.isBlocker == true))'
```
