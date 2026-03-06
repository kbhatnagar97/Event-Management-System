# Family Day 2026 — API Contracts

> **Project:** Event Management System — HashedIn by Deloitte  
> **Version:** 2.0  
> **Date:** March 6, 2026  
> **Base URL:** `{BASE_URL}/api/v1`  
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Data Models](#data-models)
2. [Endpoints](#endpoints)
   - [GET /health](#0-health-check)
   - [POST /registration/verify-email](#1-verify-email)
   - [POST /registration/register](#2-register--update-guest)
   - [GET /checkin/lookup/:code](#3-lookup-guest-by-code)
   - [POST /checkin](#4-check-in-guest)
   - [POST /checkin/undo](#5-undo-check-in)
   - [GET /checkin/stats](#6-get-check-in-stats)
   - [GET /checkin/guests](#7-search-guests)
3. [Error Handling](#error-handling)
4. [Status Codes](#status-codes)
5. [Authentication](#authentication)

---

## Data Models

### Guest

| Field          | Type            | Required | Description                          |
|----------------|-----------------|----------|--------------------------------------|
| `id`           | `string (UUID)` | ✅       | Unique guest identifier              |
| `firstName`    | `string`        | ✅       | Guest's first name                   |
| `lastName`     | `string`        | ✅       | Guest's last name                    |
| `email`        | `string`        | ✅       | Deloitte email address               |
| `code`         | `string`        | ✅       | 6-digit registration code            |
| `adults`       | `number`        | ✅       | Number of adult family members       |
| `kids`         | `number`        | ✅       | Number of children                   |
| `seniors`      | `number`        | ✅       | Number of senior family members      |
| `status`       | `GuestStatus`   | ✅       | Current registration/check-in status |
| `checkedInAt`  | `string (ISO)`  | ❌       | Timestamp of check-in (nullable)     |
| `checkedInBy`  | `string`        | ❌       | Method used for check-in (nullable)  |
| `createdAt`    | `string (ISO)`  | ✅       | Registration timestamp               |

### GuestStatus (enum)

```
"pending" | "checked_in" | "cancelled"
```

### CheckInMethod (enum)

```
"qr_scan" | "manual_code" | "manual_search"
```

---

## Endpoints

> **Note:** All check-in endpoints (`/api/v1/checkin/*`) require authentication via the `Authorization` header. Registration endpoints are public. See [Authentication](#authentication).

---

### 0. Health Check

Simple liveness probe.

```
GET /health
```

**Success Response — `200 OK`:**

```json
{
  "status": "ok"
}
```

---

### 1. Verify Email

Check if an email is a valid Deloitte employee email eligible for registration.

```
POST /api/v1/registration/verify-email
```

**Request Body:**

```json
{
  "email": "john.doe@deloitte.com"
}
```

**Success Response (new user) — `200 OK`:**

```json
{
  "valid": true,
  "registered": false,
  "employeeName": "John Doe",
  "guest": null
}
```

**Success Response (already registered) — `200 OK`:**

```json
{
  "valid": true,
  "registered": true,
  "employeeName": "John Doe",
  "guest": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@deloitte.com",
    "code": "482719",
    "adults": 2,
    "kids": 1,
    "seniors": 0,
    "status": "pending",
    "checkedInAt": null,
    "checkedInBy": null,
    "createdAt": "2026-03-05T10:30:00.000Z"
  }
}
```

> When `registered: true`, the full guest object is returned so the FE can skip directly to the confirmation screen.

**Error Response — `400 Bad Request`:**

```json
{
  "error": "INVALID_EMAIL",
  "message": "Please enter a valid Deloitte email address"
}
```

---

### 2. Register / Update Guest

Create a new guest registration, or **update an existing one** if the email is already registered (upsert).

```
POST /api/v1/registration/register
```

**Request Body — `RegistrationPayload`:**

```json
{
  "email": "john.doe@deloitte.com",
  "firstName": "John",
  "lastName": "Doe",
  "adults": 2,
  "kids": 1,
  "seniors": 0
}
```

| Field       | Type     | Validation                              |
|-------------|----------|-----------------------------------------|
| `email`     | `string` | Must be valid `@deloitte.com` email     |
| `firstName` | `string` | Required, 1–50 chars                    |
| `lastName`  | `string` | Required, 1–50 chars                    |
| `adults`    | `number` | Integer, min: 0, max: 10               |
| `kids`      | `number` | Integer, min: 0, max: 10               |
| `seniors`   | `number` | Integer, min: 0, max: 10 (default: 0)  |

> **Upsert behaviour:** If the email already exists in the database, the BE updates `firstName`, `lastName`, `adults`, `kids`, and `seniors` on the existing record and returns it. The original `code` is preserved. **No 409 is returned.**

**Success Response — `201 Created` — `RegistrationResponse`:**

```json
{
  "guest": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@deloitte.com",
    "code": "482719",
    "adults": 2,
    "kids": 1,
    "seniors": 0,
    "status": "pending",
    "checkedInAt": null,
    "checkedInBy": null,
    "createdAt": "2026-03-05T10:30:00.000Z"
  },
  "code": "482719"
}
```

**Error Responses:**

| Status | Error Code          | When                              |
|--------|---------------------|-----------------------------------|
| `422`  | `VALIDATION_ERROR`  | Missing/invalid fields            |

---

### 3. Lookup Guest by Code

Find a guest by their 6-digit registration code (used after QR scan or manual code entry).

```
GET /api/v1/checkin/lookup/:code
```

**Path Parameters:**

| Param  | Type     | Description                 |
|--------|----------|-----------------------------|
| `code` | `string` | 6-digit registration code   |

**Success Response — `200 OK`:**

```json
{
  "guest": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@deloitte.com",
    "code": "482719",
    "adults": 2,
    "kids": 1,
    "seniors": 0,
    "status": "pending",
    "checkedInAt": null,
    "checkedInBy": null,
    "createdAt": "2026-03-05T10:30:00.000Z"
  }
}
```

> If `status === "checked_in"`, the FE shows the **DuplicateOverlay** instead of SuccessOverlay.

**Error Response — `404 Not Found`:**

```json
{
  "error": "GUEST_NOT_FOUND",
  "message": "No registration found for this code"
}
```

> FE shows **NotFoundOverlay** on 404.

---

### 4. Check In Guest

Confirm a guest's check-in at the event venue.

```
POST /api/v1/checkin
```

> ⚠️ Note: The path is `/api/v1/checkin` (no `/confirm` suffix).

**Request Body — `CheckInPayload`:**

```json
{
  "guestId": "550e8400-e29b-41d4-a716-446655440000",
  "adults": 2,
  "kids": 1,
  "seniors": 0,
  "method": "qr_scan"
}
```

| Field     | Type            | Validation                                     |
|-----------|-----------------|------------------------------------------------|
| `guestId` | `string (UUID)` | Must exist in DB                               |
| `adults`  | `number`        | Integer, min: 0 (can be edited at check-in)    |
| `kids`    | `number`        | Integer, min: 0 (can be edited at check-in)    |
| `seniors` | `number`        | Integer, min: 0 (can be edited at check-in)    |
| `method`  | `CheckInMethod` | `"qr_scan"` \| `"manual_code"` \| `"manual_search"` |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "guest": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@deloitte.com",
    "code": "482719",
    "adults": 2,
    "kids": 1,
    "seniors": 0,
    "status": "checked_in",
    "checkedInAt": "2026-03-28T11:15:30.000Z",
    "checkedInBy": "qr_scan",
    "createdAt": "2026-03-05T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error Code          | When                          |
|--------|---------------------|-------------------------------|
| `404`  | `GUEST_NOT_FOUND`   | Guest ID doesn't exist        |
| `409`  | `ALREADY_CHECKED_IN`| Guest is already checked in   |

```json
{
  "error": "ALREADY_CHECKED_IN",
  "message": "This guest was already checked in",
  "checkedInAt": "2026-03-28T11:10:00.000Z"
}
```

---

### 5. Undo Check-In

Revert a guest's check-in status back to pending (used within the 3-second undo window).

```
POST /api/v1/checkin/undo
```

**Request Body:**

```json
{
  "guestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "guest": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@deloitte.com",
    "code": "482719",
    "adults": 2,
    "kids": 1,
    "seniors": 0,
    "status": "pending",
    "checkedInAt": null,
    "checkedInBy": null,
    "createdAt": "2026-03-05T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error Code        | When                              |
|--------|-------------------|-----------------------------------|
| `404`  | `GUEST_NOT_FOUND` | Guest ID doesn't exist            |
| `400`  | `NOT_CHECKED_IN`  | Guest isn't currently checked in  |

---

### 6. Get Check-In Stats

Get real-time event check-in statistics (used for the progress bar).

```
GET /api/v1/checkin/stats
```

**Success Response — `200 OK` — `CheckInStats`:**

```json
{
  "total": 350,
  "checkedIn": 127,
  "pending": 223,
  "percentage": 36.3
}
```

> FE polls this or invalidates on every check-in/undo via TanStack Query key `['stats']`.

---

### 7. Search Guests

Search and filter the guest list (used on the check-in search screen).

```
GET /api/v1/checkin/guests?q={query}&filter={filter}&page={page}&limit={limit}
```

**Query Parameters:**

| Param    | Type     | Default   | Description                                  |
|----------|----------|-----------|----------------------------------------------|
| `q`      | `string` | `""`      | Search by name, email, or code               |
| `filter` | `string` | `"all"`   | `"all"` \| `"pending"` \| `"checked_in"`    |
| `page`   | `number` | `1`       | Pagination page number                       |
| `limit`  | `number` | `20`      | Results per page                             |

**Success Response — `200 OK`:**

```json
{
  "guests": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@deloitte.com",
      "code": "482719",
      "adults": 2,
      "kids": 1,
      "seniors": 0,
      "status": "pending",
      "checkedInAt": null,
      "checkedInBy": null,
      "createdAt": "2026-03-05T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 350,
    "totalPages": 18
  }
}
```

> FE uses TanStack Query key `['guests', { q, filter, page }]` for caching.

---

## Error Handling

All error responses follow this base shape:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

> **Note:** Additional context fields are **flattened into the top-level** response body (not nested under a `details` key). For example, `ALREADY_CHECKED_IN` adds `checkedInAt` at the top level.

### Validation Error (422):

Returned by FastAPI/Pydantic when request body fields fail validation.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {
    "email": "Must be a valid @deloitte.com email",
    "adults": "Must be a non-negative integer"
  }
}
```

---

## Status Codes

| Code  | Meaning              | Used For                               |
|-------|----------------------|----------------------------------------|
| `200` | OK                   | Successful reads and updates           |
| `201` | Created              | Successful registration (new or upsert)|
| `400` | Bad Request          | Invalid state change (e.g. undo when not checked in) |
| `404` | Not Found            | Guest/code not found                   |
| `409` | Conflict             | Already checked in                     |
| `422` | Unprocessable Entity | Field validation failures              |
| `500` | Internal Server Error| Unexpected server errors               |

---

## Authentication

All **check-in endpoints** (`/api/v1/checkin/*`) are protected via the `Authorization` header using `Depends(get_current_user)` middleware.

- **Registration endpoints** (`/api/v1/registration/*`) are **public** — no auth required.
- The auth middleware is currently a **no-op stub** (returns a hardcoded placeholder user). It will be replaced with Deloitte SSO / internal auth token validation before production.

---

## FE → BE Integration Notes

| Concept | Detail |
|---------|--------|
| **Auth** | Check-in routes require auth header (currently stub). Registration routes are public. |
| **Cache invalidation** | FE invalidates `['guests']` and `['stats']` query keys on every check-in and undo |
| **QR Code content** | The 6-digit `code` string is encoded into the QR. BE returns it in `RegistrationResponse.code` |
| **Undo window** | FE auto-dismisses after 3 seconds. Undo call can happen within that window |
| **Check-in method tracking** | `method` field in `CheckInPayload` tracks how the guest was checked in (QR scan vs manual code vs search) |
| **Family count editing** | Adults/kids/seniors can be modified at check-in time. The updated counts are sent in `CheckInPayload` |
| **Real-time stats** | Progress bar shows `checkedIn/total` ratio. FE re-fetches on every mutation |
| **Registration upsert** | Re-registering the same email updates the existing record (name, adults, kids, seniors). The original code is preserved. No 409 error. |
| **Verify-email guest** | When `registered: true`, the verify-email response includes the full guest object so the FE can skip to the confirmation screen |

---

*Updated March 6, 2026 — synced with backend implementation. For wireframes, see `/design/wireframes/`.*
