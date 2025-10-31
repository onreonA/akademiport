# Architecture Documentation

## Overview

Akademi Port is built using **Domain-Driven Design (DDD)** principles with a clean, layered architecture. The application follows a modular structure that separates concerns and promotes maintainability, testability, and scalability.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Layered Architecture](#layered-architecture)
4. [Data Flow](#data-flow)
5. [Design Patterns](#design-patterns)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [State Management](#state-management)

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.0.1 (App Router, Turbopack)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Supabase Client
- **Authentication:** Supabase Auth

### Testing
- **Test Framework:** Vitest
- **Testing Library:** @testing-library/react
- **Coverage:** v8

### Development Tools
- **Linter:** ESLint 9
- **Formatter:** Prettier
- **Type Checking:** TypeScript
- **Storybook:** Component development

---

## Project Structure

```
akademi-port/
├── src/
│   ├── 1-presentation/          # UI Layer
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── atoms/       # Basic UI components
│   │   │   │   ├── molecules/   # Composite UI components
│   │   │   │   └── organisms/   # Complex UI sections
│   │   │   └── features/        # Feature-specific components
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # UI utilities
│   │
│   ├── 2-application/           # Application Layer
│   │   └── use-cases/           # Business logic use cases
│   │       ├── project/
│   │       ├── sub-project/
│   │       ├── task/
│   │       └── task-comment/
│   │
│   ├── 3-domain/                # Domain Layer
│   │   ├── entities/            # Domain entities
│   │   └── interfaces/
│   │       └── repositories/    # Repository interfaces
│   │
│   ├── 4-infrastructure/        # Infrastructure Layer
│   │   ├── api/
│   │   │   └── helpers/         # API utilities
│   │   └── database/
│   │       ├── migrations/      # SQL migrations
│   │       └── repositories/    # Repository implementations
│   │
│   ├── 5-shared/                # Shared Layer
│   │   ├── constants/           # App constants
│   │   ├── hooks/               # Shared hooks
│   │   ├── lib/                 # Shared utilities
│   │   ├── test/                # Test utilities & mocks
│   │   └── types/               # Shared types
│   │
│   ├── 6-core/                  # Core Layer
│   │   ├── errors.ts            # Error classes
│   │   └── result.ts            # Result pattern
│   │
│   └── app/                     # Next.js App Router
│       ├── api/                 # API routes
│       ├── dashboard/           # Admin dashboard
│       ├── consultant-dashboard/# Consultant dashboard
│       ├── company-dashboard/   # Company dashboard
│       └── login/               # Auth pages
│
├── docs/                        # Documentation
├── public/                      # Static assets
└── tests/                       # E2E tests (future)
```

---

## Layered Architecture

### 1. Presentation Layer (`1-presentation/`)

**Responsibility:** User interface and user interaction

**Components:**
- **Atoms:** Basic UI components (Button, Input, Card, etc.)
- **Molecules:** Composite components (GradientHeader, StatCard, etc.)
- **Organisms:** Complex sections (Sidebar, Header, Forms, etc.)
- **Features:** Feature-specific components (UserCard, ProgramForm, etc.)

**Key Principles:**
- Components are pure and reusable
- No business logic in components
- Props-driven design
- Responsive and accessible

### 2. Application Layer (`2-application/`)

**Responsibility:** Application-specific business logic

**Use Cases:**
- Each use case represents a single business operation
- Use cases orchestrate domain entities and repositories
- Return `Result<T>` for consistent error handling

**Example Use Cases:**
- `CreateProjectUseCase`
- `CompleteTaskUseCase`
- `ApproveTaskUseCase`

**Pattern:**
```typescript
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(data: CreateProjectDto): Promise<Result<{ id: string }>> {
    // 1. Validation
    // 2. Business logic
    // 3. Repository interaction
    // 4. Return result
  }
}
```

### 3. Domain Layer (`3-domain/`)

**Responsibility:** Core business entities and rules

**Entities:**
- Pure TypeScript interfaces/types
- No dependencies on external libraries
- Represent core business concepts

**Repository Interfaces:**
- Define contracts for data access
- Implementation-agnostic
- Used by application layer

**Example Entity:**
```typescript
export interface Project {
  id: string;
  companyId: string | null;
  consultantId: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Infrastructure Layer (`4-infrastructure/`)

**Responsibility:** External services and data persistence

**Components:**
- **Repositories:** Supabase database implementations
- **API Helpers:** Authentication, validation, error handling
- **Migrations:** SQL schema definitions

**Key Features:**
- Implements domain repository interfaces
- Handles database connections
- Manages external service integrations

### 5. Shared Layer (`5-shared/`)

**Responsibility:** Cross-cutting concerns and utilities

**Contents:**
- Constants (navigation, roles, etc.)
- Shared hooks (useAuth, useSupabase, etc.)
- Utility functions
- Type definitions
- Test utilities and mocks

### 6. Core Layer (`6-core/`)

**Responsibility:** Fundamental patterns and utilities

**Components:**
- **Result Pattern:** Type-safe error handling
- **Error Classes:** Standardized error types
- **Base Types:** Core type definitions

**Result Pattern:**
```typescript
type Result<T> = {
  isSuccess: boolean;
  value?: T;
  error?: AppError;
};
```

---

## Data Flow

### Request Flow (Top-Down)

```
User Interaction
    ↓
Presentation Component
    ↓
API Route Handler
    ↓
Use Case
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
Database (Supabase)
```

### Response Flow (Bottom-Up)

```
Database (Supabase)
    ↓
Repository Implementation
    ↓
Use Case (Result<T>)
    ↓
API Route Handler
    ↓
HTTP Response (JSON)
    ↓
Presentation Component
    ↓
UI Update
```

### Example: Creating a Project

1. **User Action:** User fills form and clicks "Create Project"
2. **Component:** Form submits data via `fetch('/api/projects')`
3. **API Route:** `/api/projects/route.ts` receives POST request
4. **Authentication:** Verify user session
5. **Use Case:** `CreateProjectUseCase.execute(data)`
6. **Validation:** Validate project data
7. **Repository:** `ProjectRepository.create(data)`
8. **Database:** Insert into `projects` table
9. **Response:** Return project ID
10. **UI Update:** Navigate to project detail page

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access logic

**Implementation:**
- Interface in domain layer
- Implementation in infrastructure layer
- Dependency injection in use cases

**Benefits:**
- Testable (easy to mock)
- Swappable implementations
- Clean separation of concerns

### 2. Result Pattern

**Purpose:** Type-safe error handling without exceptions

**Implementation:**
```typescript
// Success
return Result.ok(data);

// Failure
return Result.fail(new AppError('Error message', 400));

// Usage
const result = await useCase.execute(data);
if (result.isSuccess) {
  // Handle success
  console.log(result.value);
} else {
  // Handle error
  console.error(result.error);
}
```

**Benefits:**
- Explicit error handling
- Type-safe
- No try-catch boilerplate

### 3. Dependency Injection

**Purpose:** Loose coupling and testability

**Implementation:**
```typescript
// Use case receives dependencies via constructor
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}
}

// In API route
const repository = new SupabaseProjectRepository();
const useCase = new CreateProjectUseCase(repository);
```

### 4. Factory Pattern

**Purpose:** Object creation abstraction

**Usage:**
- Entity validation and creation
- Repository instantiation

### 5. Observer Pattern

**Purpose:** React state management

**Implementation:**
- React hooks (useState, useEffect)
- Context API for global state

---

## Database Schema

### Core Tables

#### `users`
- User authentication and profile
- Role-based access control
- Company association

#### `programs`
- Training programs
- Managed by consultants
- Associated with multiple companies

#### `companies`
- Company profiles
- Program enrollment
- User management

#### `projects`
- Project management
- Template support
- Progress tracking

#### `sub_projects`
- Project breakdown
- Ordered hierarchy
- Status tracking

#### `tasks`
- Task assignment
- Approval workflow
- Due date tracking

#### `task_comments`
- Task discussions
- Question/answer support
- User attribution

### Key Features

- **Soft Deletes:** Using `deleted_at` column
- **Timestamps:** Automatic `created_at` and `updated_at`
- **RLS Policies:** Row-level security for data access
- **Triggers:** Auto-update timestamps and progress
- **Indexes:** Performance optimization

---

## Authentication & Authorization

### Authentication

**Provider:** Supabase Auth

**Flow:**
1. User submits credentials
2. Supabase validates and creates session
3. Session cookie stored in browser
4. Subsequent requests include session cookie
5. Server validates session on each request

### Authorization

**Role-Based Access Control (RBAC):**

- **Admin:** Full system access
- **Consultant:** Manage programs, projects, companies
- **Company:** View assigned projects, complete tasks

**Implementation:**
- Middleware checks user role
- API routes validate permissions
- RLS policies enforce database-level security

**Example:**
```typescript
const { user, error } = await auth(req);
if (error) {
  return NextResponse.json({ error: error.message }, { status: error.status });
}

if (user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## State Management

### Client-Side State

**Local State:**
- `useState` for component-specific state
- `useReducer` for complex state logic

**Server State:**
- `fetch` for API calls
- Manual cache invalidation
- Loading and error states

**Global State:**
- Context API for auth state
- Minimal global state (auth only)

### Server-Side State

**Database:**
- Single source of truth
- Supabase real-time subscriptions (future)

**Session:**
- User authentication
- Role and permissions

---

## Performance Optimizations

### Database

- **Indexes:** 35+ performance indexes
- **Query Optimization:** Efficient joins and filters
- **Connection Pooling:** Supabase handles automatically

### Frontend

- **Code Splitting:** Next.js automatic code splitting
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Dynamic imports for heavy components
- **Memoization:** React.memo, useMemo, useCallback

### API

- **Caching:** HTTP caching headers (future)
- **Pagination:** Limit query results
- **Compression:** Gzip/Brotli (future)

---

## Security

### Best Practices

1. **Input Validation:** Zod schemas for all inputs
2. **SQL Injection Prevention:** Parameterized queries
3. **XSS Prevention:** React auto-escaping
4. **CSRF Protection:** SameSite cookies
5. **Authentication:** Secure session management
6. **Authorization:** Role-based access control
7. **RLS Policies:** Database-level security

---

## Testing Strategy

### Unit Tests

- Domain entities
- Use cases
- Utility functions

### Integration Tests

- Repository implementations
- API endpoints

### E2E Tests (Future)

- Critical user flows
- Cross-browser testing

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring
- [ ] Backup strategy
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured

---

## Future Enhancements

1. **Real-time Updates:** Supabase subscriptions
2. **File Uploads:** Document management
3. **Notifications:** Email and in-app
4. **Analytics:** Usage tracking and reporting
5. **API Versioning:** v2 endpoints
6. **GraphQL:** Alternative API layer
7. **Mobile App:** React Native
8. **Internationalization:** Multi-language support

---

## Contributing

See [DEVELOPER.md](./DEVELOPER.md) for development guidelines and contribution process.

