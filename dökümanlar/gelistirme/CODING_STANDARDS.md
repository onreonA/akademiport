# 📋 Coding Standards & Project Rules

## 🎯 Overview

Bu doküman, proje genelinde tutarlı kod yazımı ve geliştirme standartlarını belirler.

## 📁 File & Folder Naming

### Files

- **Components**: `PascalCase.tsx` (örn: `UserProfile.tsx`)
- **Pages**: `kebab-case.tsx` (örn: `proje-yonetimi.tsx`)
- **API Routes**: `kebab-case/route.ts` (örn: `user-management/route.ts`)
- **Utilities**: `camelCase.ts` (örn: `formatDate.ts`)
- **Types**: `camelCase.ts` (örn: `userTypes.ts`)

### Folders

- **Components**: `PascalCase/` (örn: `UserProfile/`)
- **Pages**: `kebab-case/` (örn: `proje-yonetimi/`)
- **API**: `kebab-case/` (örn: `user-management/`)

## 🔧 Code Style

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'consultant';
}

// ❌ Bad
interface user {
  id: string;
  email: string;
  role: string;
}
```

### React Components

```typescript
// ✅ Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function UserProfile({ user, onUpdate }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
    </div>
  );
}

// ❌ Bad
export default function userProfile(props: any) {
  return <div><h1>{props.user.name}</h1></div>
}
```

### Import Order

```typescript
// ✅ Good - Alphabetical order with grouping
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { User } from '@/types';

import { validateUser } from './utils';
```

## 🎨 Styling Standards

### Tailwind CSS

```typescript
// ✅ Good - Logical grouping
<div className="flex flex-col items-center justify-center h-64 bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">

// ❌ Bad - Random order
<div className="p-6 flex shadow-md bg-gray-50 rounded-lg h-64 items-center justify-center flex-col hover:shadow-lg transition-shadow duration-200">
```

### CSS Classes Order

1. **Layout**: `flex`, `grid`, `block`, `inline`
2. **Positioning**: `relative`, `absolute`, `fixed`
3. **Sizing**: `w-`, `h-`, `min-w-`, `max-h-`
4. **Spacing**: `m-`, `p-`, `space-`
5. **Colors**: `bg-`, `text-`, `border-`
6. **Typography**: `font-`, `text-`, `leading-`
7. **Effects**: `shadow-`, `opacity-`, `blur-`
8. **Transitions**: `transition-`, `duration-`, `ease-`

## 🔐 Security Standards

### API Routes

```typescript
// ✅ Good
export async function GET(request: NextRequest) {
  const userEmail = request.headers.get('X-User-Email');

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate user exists
  const user = await validateUser(userEmail);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Business logic
}

// ❌ Bad
export async function GET(request: NextRequest) {
  // No validation
  const data = await getData();
  return NextResponse.json(data);
}
```

### Environment Variables

```typescript
// ✅ Good
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

// ❌ Bad
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
```

## 📊 Database Standards

### Table Naming

- **Tables**: `snake_case` (örn: `user_profiles`)
- **Columns**: `snake_case` (örn: `created_at`)
- **Indexes**: `idx_table_column` (örn: `idx_users_email`)

### Migration Naming

```
001_initial_schema.sql
002_add_user_profiles.sql
003_create_projects_table.sql
```

## 🧪 Testing Standards

### Test File Naming

- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `feature.integration.test.ts`
- **E2E Tests**: `feature.e2e.test.ts`

### Test Structure

```typescript
describe('UserProfile Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render user information correctly', () => {
    // Test
  });

  it('should handle update action', () => {
    // Test
  });
});
```

## 📝 Documentation Standards

### Component Documentation

```typescript
/**
 * UserProfile component displays user information and allows editing
 *
 * @param user - User object containing profile information
 * @param onUpdate - Callback function called when user data is updated
 * @param isEditable - Whether the profile can be edited
 */
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  isEditable?: boolean;
}
```

### API Documentation

```typescript
/**
 * GET /api/users/[id]
 *
 * Retrieves user information by ID
 *
 * @param id - User ID
 * @returns User object or error
 *
 * @example
 * GET /api/users/123
 * Response: { id: "123", email: "user@example.com", ... }
 */
```

## 🚀 Git Standards

### Commit Messages

```
feat: add user profile editing functionality
fix: resolve authentication redirect loop
docs: update API documentation
refactor: simplify user validation logic
test: add unit tests for user components
```

### Branch Naming

```
feature/user-profile-editing
bugfix/auth-redirect-loop
hotfix/critical-security-patch
refactor/database-schema-cleanup
```

## 🔍 Code Review Checklist

### Before Submitting PR

- [ ] Code follows naming conventions
- [ ] All imports are properly organized
- [ ] TypeScript types are properly defined
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Security validations are in place
- [ ] Code is formatted with Prettier
- [ ] ESLint passes without errors
- [ ] Tests pass (if applicable)

### Review Checklist

- [ ] Code is readable and maintainable
- [ ] Performance implications considered
- [ ] Security best practices followed
- [ ] Database queries are optimized
- [ ] Error messages are user-friendly
- [ ] Accessibility standards met
- [ ] Mobile responsiveness considered

## 🛠️ Development Tools

### Required Extensions (VSCode)

- Prettier - Code formatter
- ESLint - Code linting
- Tailwind CSS IntelliSense - CSS autocomplete
- TypeScript Importer - Auto imports
- Supabase - Database integration

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install husky --save-dev

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run check-all"
```

## 📈 Performance Standards

### Bundle Size

- Keep individual components under 50KB
- Use dynamic imports for large components
- Optimize images with Next.js Image component

### Database Queries

- Use indexes for frequently queried columns
- Implement pagination for large datasets
- Use connection pooling for database connections

### API Response Times

- GET requests: < 200ms
- POST/PUT requests: < 500ms
- Database queries: < 100ms

---

**Bu standartlar proje genelinde tutarlılık sağlar ve kod kalitesini artırır.**
