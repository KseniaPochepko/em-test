# User Requests Backend Documentation

## Overview

The User Requests backend system manages submitted requests through a complete lifecycle, from creation to completion. The system handles only anonymous requests, providing status tracking and management capabilities.

## Database Architecture

### Schema Design

The system uses a public database schema.

### Data Models

#### Request Model

The primary model for handling requests with the following structure:

```typescript
@Table({
  tableName: 'requests',
})

export default class Request extends Model {
    @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
    id: number;
}
    
    // Other model properties defined based on specific requirements
```
#### Request Actions Model

The model for handling request answers  with the following structure:
```typescript
@Table({
  tableName: 'request_actions',
})
export default class RequestAction extends Model {
    @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true})
    id: number;
}

// Other model properties defined based on specific requirements
```

#### Request Status Enum

The system defines four request statuses:

```typescript
export enum RequestStatus {
  Pending = 'Pending', // Initial state for all new requests
  InProgress = 'InProgress', // Request is being actively worked on
  Resolved = 'Resolved', // Request has been successfully fulfilled
  Rejected = 'Rejected', // Request has been canceled/rejected
}
```

#### Request Action Type Enum

The system defines five request action types:

```typescript
export enum RequestActionType {
  Comment = 'Comment', // Add a comment or note to the request without changing its status
  Accept = 'Accept', // Accept the request and move it to processing
  Resolve = 'Resolve', // Mark the request as resolved
  Reject = 'Reject', // Reject or deny the request
  Reopen = 'Reopen', // Reopen a previously closed or resolved request
}
```

#### Status Flow

Requests follow a defined lifecycle:

- **New** – Initial state when the request is created.
- **Processing** – Request is being actively worked on.
- **Completed** – Request has been successfully fulfilled.
- **Canceled** – Request has been rejected or canceled.

Valid state transitions:

- `New` → `Processing`
- `New` → `Canceled`
- `Processing` → `Completed`
- `Processing` → `Canceled`

#### Status Action Types

The following actions can be performed on a request. 

- **Comment** – Add a comment or note to the request without changing its status.
- **Accept** – Accept the request and move it to the `Processing` state.
- **Resolve** – Mark the request as resolved (move it to `Completed`).
- **Reject** – Reject or deny the request (move it to `Canceled`).
- **Reopen** – Reopen a previously closed or resolved request, typically moving it back to `Processing` state.

## API Endpoints

### Request Management

#### [get] /requests

Retrieves a list of requests, optionally filtered by date parameters.

**Successful Response (200 OK):**

Returns a JSON object with array of request objects and metadata.

```json
{
  "items": [
    {
      "status": "Pending",
      "id": 1,
      "title": "send me $1K",
      "content": "I want to eat",
      "updatedAt": "2025-05-21T14:55:08.355Z",
      "createdAt": "2025-05-21T14:55:08.355Z"
    }
  ],
  "page": "1",
  "perPage": "20",
  "totalPages": 1,
  "total": 1,
  "hasMore": false
}
```

#### [get] /requests/:id

Retrieves a single request.

**Successful Response (200 OK):**

Returns a JSON object representing a request, including its current status, metadata, and content.

```json
{
  "status": "Pending",
  "id": 1,
  "title": "send me $1K",
  "content": "I want to eat",
  "updatedAt": "2025-05-21T14:55:08.355Z",
  "createdAt": "2025-05-21T14:55:08.355Z"
}
```

#### [post] /requests

Creates a new request with the provided data.

**Request Body:**

The body must conform to the `CreateRequestBody` schema. The fields include:

| Field       | Type     | Required | Description                     |
|-------------|----------|----------|---------------------------------|
| `title`     | string   | Yes      | Title or subject of the request |
| `content`   | string   | Yes      | Detailed description or message |

**Successful Response (200 OK):**

Returns the created JSON object with metadata.
```json
{
  "status": "Pending",
  "id": 1,
  "title": "send me $1K",
  "content": "I want to eat",
  "updatedAt": "2025-05-21T14:55:08.355Z",
  "createdAt": "2025-05-21T14:55:08.355Z"
}
```

**Error Responses:**

Validation Error (400 Bad Request)
```json
{
    "message": "title is a required field",
    "path": "title"
}
```

Unexpected server error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```

#### [patch] /requests/:id

Updates an existing request with the provided data.

**Path Parameters:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | number | Yes      | ID of the request to update |

**Request Body:**

The body must follow the `UpdateRequestBody` schema. Common updatable fields include:

| Field     | Type     | Required | Description                           |
|-----------|----------|----------|---------------------------------------|
| `title`   | string   | Optional | Updated title of the request          |
| `content` | string   | Optional | Updated content or message            |
| `status`  | string   | Optional | Updated status (e.g., `Processing`)   |

**Successful Response (200 OK):**

Returns the JSON object with changed metadata and an appended history entry reflecting the action taken.
```json
{
  "id": 2,
  "title": "Complaint",
  "content": "The kitchen is dirty",
  "status": "InProgress",
  "createdAt": "2025-05-22T13:00:06.950Z",
  "updatedAt": "2025-05-22T13:19:37.965Z",
  "history": [
    {
      "id": 4,
      "type": "Accept",
      "content": null,
      "createdAt": "2025-05-22T13:19:37.969Z",
      "updatedAt": "2025-05-22T13:19:37.969Z",
      "requestId": 2
    }
  ]
}
```

**Error Responses:**

No Request Exists With The Given ID (404 Not Found)
```json
{
    "message": "Request"
}
```

Unexpected server error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```

#### [post] /requests/reject-all

Rejects all requests in bulk, optionally with a comment or message.

**Request Body:**

The body must conform to the `RequestActionBody` schema.

| Field    | Type   | Required | Description                              |
|----------|--------|----------|------------------------------------------|
| `message` | string | Optional | Optional reason or comment for rejection |

> If no message is provided, `null` will be used as the default.

**Successful Response (200 OK):**

Returns a summary of the rejection action, typically the number of requests affected.

```json
{
    "updated": 0
}
```

**Error Responses:**

Unexpected server error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```

#### [post] /requests/:id/accept

Accepts a request and updates its status to `InProgress`. Optionally adds a comment to the request history.

**Path Parameters:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | number | Yes      | ID of the request to accept |

**Request body:**

Validated using `RequestActionBody`. Typically includes an optional comment.

| Field     | Type   | Required | Description                                |
|-----------|--------|----------|--------------------------------------------|
| `message` | string | Optional | Optional comment to attach to the action   |

**Successful response (200 OK):**

Returns the updated request object with updated metadata and a new entry in the request history.
```json
{
    "id": 3,
    "title": "Birthday party",
    "content": "Where is my invitation?",
    "status": "InProgress",
    "createdAt": "2025-05-22T13:43:01.607Z",
    "updatedAt": "2025-05-22T13:43:43.300Z",
    "history": [
        {
            "id": 6,
            "type": "Accept",
            "content": null,
            "createdAt": "2025-05-22T13:43:43.306Z",
            "updatedAt": "2025-05-22T13:43:43.306Z",
            "requestId": 3
        }
    ]
}
```

**Error Responses:**

Validation Error (400 Bad Request)
```json
{
  "message": "id must be a `number` type, but the final value was: `NaN` (cast from the value `\"R_\"`).",
  "path": "id"
}
```

No Request Exists With The Given ID (404 Not Found)
```json
{
    "message": "Request"
}
```

Unexpected server error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```

#### [post] /requests/:id/resolve

Marks a request as `Resolved`. Optionally includes a comment explaining the resolution.

**Path Parameters:**

| Parameter | Type   | Required | Description               |
|-----------|--------|----------|---------------------------|
| `id`      | number | Yes      | ID of the request to resolve |

**Request Body:**

Validated using `RequestActionBody`. Can include an optional message.

| Field     | Type   | Required | Description                               |
|-----------|--------|----------|-------------------------------------------|
| `message` | string | Optional | Optional comment explaining the resolution |

**Successful Response (200 OK):**

Returns the updated request object, including the new status and a history entry.

```json
{
    "id": 3,
    "title": "Birthday party",
    "content": "Where is my invitation?",
    "status": "Resolved",
    "createdAt": "2025-05-22T13:43:01.607Z",
    "updatedAt": "2025-05-22T13:54:50.396Z",
    "history": [
        {
            "id": 6,
            "type": "Accept",
            "content": null,
            "createdAt": "2025-05-22T13:43:43.306Z",
            "updatedAt": "2025-05-22T13:43:43.306Z",
            "requestId": 3
        },
        {
            "id": 7,
            "type": "Resolve",
            "content": "The invitation is already sent. Please wait for it.",
            "createdAt": "2025-05-22T13:54:50.402Z",
            "updatedAt": "2025-05-22T13:54:50.402Z",
            "requestId": 3
        }
    ]
}
```
**Error Responses:**

Validation Error (400 Bad Request)
```json
{
  "message": "id must be a `number` type, but the final value was: `NaN` (cast from the value `\"R_\"`).",
  "path": "id"
}
```

No Request Exists With The Given ID (404 Not Found)

```json
{
    "message": "Request"
}
```

Unexpected Server Error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```

#### [post] /requests/:id/reject

Rejects a request and updates its status to `Rejected`. You can optionally provide a reason or comment.

**Path Parameters:**

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `id`      | number | Yes      | ID of the request to reject |

**Request Body:**

Validated using `RequestActionBody`. Supports an optional rejection message.

| Field     | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| `message` | string | Optional | Optional reason for rejection         |

**Successful Response (200 OK):**

Returns the updated request object, with updated metadata and a new history record.

```json
{
    "id": 4,
    "title": "I lost my key",
    "content": "Do we have another one?",
    "status": "Rejected",
    "createdAt": "2025-05-22T14:00:49.669Z",
    "updatedAt": "2025-05-22T14:00:57.929Z",
    "history": [
        {
            "id": 8,
            "type": "Reject",
            "content": "I don't know",
            "createdAt": "2025-05-22T14:00:57.933Z",
            "updatedAt": "2025-05-22T14:00:57.933Z",
            "requestId": 4
        }
    ]
}
```

**Error Responses:**

Validation Error (400 Bad Request)
```json
{
  "message": "id must be a `number` type, but the final value was: `NaN` (cast from the value `\"R_\"`).",
  "path": "id"
}
```

No Request Exists With The Given ID (404 Not Found)
```json
{
    "message": "Request"
}
```

Unexpected Server Error (500 Internal Server Error)
```json
{
    "message": "Internal Server Error"
}
```
