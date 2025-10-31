# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Akademi Port application.

**Base URL:** `http://localhost:3000/api`

**Authentication:** All endpoints require authentication via session cookies (handled by Supabase Auth).

---

## Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Sub-Projects](#sub-projects)
4. [Tasks](#tasks)
5. [Task Comments](#task-comments)
6. [Companies](#companies)
7. [Programs](#programs)
8. [Users](#users)

---

## Authentication

### Get Current User

```http
GET /api/auth/me
```

**Response:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "admin" | "consultant" | "company",
  "companyId": "uuid" | null
}
```

### Sign In

```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Sign Out

```http
POST /api/auth/signout
```

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

---

## Projects

### List Projects

```http
GET /api/projects
```

**Query Parameters:**
- `companyId` (optional): Filter by company
- `consultantId` (optional): Filter by consultant
- `status` (optional): Filter by status
- `isTemplate` (optional): Filter templates

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "consultantId": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "planning" | "active" | "on_hold" | "completed" | "cancelled",
    "priority": "low" | "medium" | "high" | "critical",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T00:00:00.000Z",
    "progress": 50,
    "isTemplate": false,
    "templateId": "uuid" | null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Project

```http
GET /api/projects/:id
```

**Response:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "consultantId": "uuid",
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "priority": "high",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "progress": 50,
  "isTemplate": false,
  "templateId": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Create Project

```http
POST /api/projects
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "consultantId": "uuid",
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "priority": "high",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "isTemplate": false
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Update Project

```http
PUT /api/projects/:id
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active",
  "priority": "critical",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Delete Project

```http
DELETE /api/projects/:id
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### Get Project Templates

```http
GET /api/projects/templates
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Template Name",
    "description": "Template description",
    "status": "planning",
    "priority": "medium",
    "isTemplate": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create Project from Template

```http
POST /api/projects/from-template
```

**Request Body:**
```json
{
  "templateId": "uuid",
  "companyId": "uuid",
  "consultantId": "uuid",
  "name": "Project from Template",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Get Project Sub-Projects

```http
GET /api/projects/:id/sub-projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Sub-Project Name",
    "description": "Sub-project description",
    "status": "in_progress",
    "orderIndex": 1,
    "progress": 30,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

## Sub-Projects

### List Sub-Projects

```http
GET /api/sub-projects?projectId=uuid
```

**Query Parameters:**
- `projectId` (required): Project ID

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Sub-Project Name",
    "description": "Description",
    "status": "in_progress",
    "orderIndex": 1,
    "progress": 30,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Sub-Project

```http
GET /api/sub-projects/:id
```

**Response:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "Sub-Project Name",
  "description": "Description",
  "status": "in_progress",
  "orderIndex": 1,
  "progress": 30,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Create Sub-Project

```http
POST /api/sub-projects
```

**Request Body:**
```json
{
  "projectId": "uuid",
  "name": "New Sub-Project",
  "description": "Description",
  "status": "todo",
  "orderIndex": 1
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Update Sub-Project

```http
PUT /api/sub-projects/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "in_progress"
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Delete Sub-Project

```http
DELETE /api/sub-projects/:id
```

**Response:**
```json
{
  "message": "Sub-project deleted successfully"
}
```

---

## Tasks

### List Tasks

```http
GET /api/tasks?subProjectId=uuid
```

**Query Parameters:**
- `subProjectId` (optional): Filter by sub-project
- `assignedTo` (optional): Filter by assigned user
- `status` (optional): Filter by status

**Response:**
```json
[
  {
    "id": "uuid",
    "subProjectId": "uuid",
    "assignedTo": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo" | "in_progress" | "review" | "done" | "cancelled",
    "priority": "low" | "medium" | "high" | "critical",
    "dueDate": "2025-02-01T00:00:00.000Z",
    "completedAt": null,
    "approvedAt": null,
    "approvedBy": null,
    "orderIndex": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Task

```http
GET /api/tasks/:id
```

**Response:**
```json
{
  "id": "uuid",
  "subProjectId": "uuid",
  "assignedTo": "uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2025-02-01T00:00:00.000Z",
  "completedAt": null,
  "approvedAt": null,
  "approvedBy": null,
  "orderIndex": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Create Task

```http
POST /api/tasks
```

**Request Body:**
```json
{
  "subProjectId": "uuid",
  "assignedTo": "uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-02-01",
  "orderIndex": 1
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Update Task

```http
PUT /api/tasks/:id
```

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "critical",
  "dueDate": "2025-02-15"
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Delete Task

```http
DELETE /api/tasks/:id
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### Complete Task

```http
POST /api/tasks/:id/complete
```

**Response:**
```json
{
  "message": "Task completed successfully"
}
```

### Approve Task

```http
POST /api/tasks/:id/approve
```

**Request Body:**
```json
{
  "approvedBy": "uuid"
}
```

**Response:**
```json
{
  "message": "Task approved successfully"
}
```

### Reject Task

```http
POST /api/tasks/:id/reject
```

**Request Body:**
```json
{
  "reason": "Needs more work"
}
```

**Response:**
```json
{
  "message": "Task rejected successfully"
}
```

---

## Task Comments

### List Task Comments

```http
GET /api/tasks/:id/comments
```

**Response:**
```json
[
  {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "userEmail": "user@example.com",
    "comment": "This is a comment",
    "isQuestion": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create Task Comment

```http
POST /api/tasks/:id/comments
```

**Request Body:**
```json
{
  "taskId": "uuid",
  "userId": "uuid",
  "comment": "This is a new comment",
  "isQuestion": false
}
```

**Response:**
```json
{
  "id": "uuid"
}
```

### Delete Task Comment

```http
DELETE /api/tasks/:id/comments/:commentId
```

**Response:**
```json
{
  "message": "Task comment deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

---

## Versioning

API Version: `v1` (implicit, no version prefix in URL)

---

## Notes

- All dates are in ISO 8601 format
- All IDs are UUIDs
- Timestamps are in UTC
- Progress values are percentages (0-100)
- Status and priority values are enums (see specific endpoint documentation)
