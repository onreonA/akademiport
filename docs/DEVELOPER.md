# Developer Guide

## Welcome! 👋

This guide will help you set up your development environment and understand the development workflow for Akademi Port.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)
7. [Troubleshooting](#troubleshooting)
8. [Useful Commands](#useful-commands)

---

## Prerequisites

### Required Software

- **Node.js:** v20 or higher
- **npm:** v10 or higher
- **Git:** Latest version
- **PostgreSQL:** v15+ (or Supabase account)
- **Code Editor:** VS Code recommended

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer"
  ]
}
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/akademi-port.git
cd akademi-port
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get Supabase Credentials:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the URL and anon key

### 4. Database Setup

Run migrations in Supabase SQL Editor:

```bash
# Navigate to migrations folder
cd src/4-infrastructure/database/migrations

# Run migrations in order
# 01-users.sql
# 02-programs.sql
# 03-companies.sql
# ... (all migration files)
```

**Important:** Run migrations in numerical order!

### 5. Seed Data (Optional)

Create test users in Supabase Auth:

```sql
-- Admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@akademiport.com', crypt('password123', gen_salt('bf')), now());

-- Update users table
INSERT INTO users (id, email, role, first_name, last_name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@akademiport.com'),
  'admin@akademiport.com',
  'admin',
  'Admin',
  'User'
);
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Default Credentials:**
- Email: `admin@akademiport.com`
- Password: `password123`

---

## Development Workflow

### Project Structure

```
src/
├── 1-presentation/    # UI components
├── 2-application/     # Business logic (use cases)
├── 3-domain/          # Entities and interfaces
├── 4-infrastructure/  # Database and external services
├── 5-shared/          # Utilities and constants
├── 6-core/            # Core patterns (Result, Error)
└── app/               # Next.js pages and API routes
```

### Creating a New Feature

#### 1. Define Domain Entity

```typescript
// src/3-domain/entities/MyEntity.ts
export interface MyEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Create Repository Interface

```typescript
// src/3-domain/interfaces/repositories/IMyEntityRepository.ts
export interface IMyEntityRepository {
  create(data: CreateMyEntityDto): Promise<MyEntity>;
  findById(id: string): Promise<MyEntity | null>;
  findAll(): Promise<MyEntity[]>;
  update(id: string, data: UpdateMyEntityDto): Promise<MyEntity>;
  delete(id: string): Promise<void>;
}
```

#### 3. Implement Repository

```typescript
// src/4-infrastructure/database/repositories/MyEntityRepository.ts
export class SupabaseMyEntityRepository implements IMyEntityRepository {
  async create(data: CreateMyEntityDto): Promise<MyEntity> {
    const supabase = createClient();
    const { data: entity, error } = await supabase
      .from('my_entities')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return entity;
  }
  
  // ... other methods
}
```

#### 4. Create Use Cases

```typescript
// src/2-application/use-cases/my-entity/CreateMyEntityUseCase.ts
export class CreateMyEntityUseCase {
  constructor(private repository: IMyEntityRepository) {}

  async execute(data: CreateMyEntityDto): Promise<Result<{ id: string }>> {
    try {
      // Validation
      const errors = MyEntityValidator.validate(data);
      if (errors.length > 0) {
        return Result.fail(new AppError(errors.join(', '), 400));
      }

      // Create entity
      const entity = await this.repository.create(data);

      return Result.ok({ id: entity.id });
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to create entity', 500)
      );
    }
  }
}
```

#### 5. Create API Route

```typescript
// src/app/api/my-entities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CreateMyEntityUseCase } from '@/application/use-cases/my-entity/CreateMyEntityUseCase';
import { SupabaseMyEntityRepository } from '@/infrastructure/database/repositories/MyEntityRepository';
import { auth } from '@/infrastructure/api/helpers/auth';

const repository = new SupabaseMyEntityRepository();

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await auth(req);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const body = await req.json();
    const useCase = new CreateMyEntityUseCase(repository);
    const result = await useCase.execute(body);

    if (result.isSuccess) {
      return NextResponse.json(result.value, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error?.message }, { status: result.error?.status || 500 });
    }
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 });
  }
}
```

#### 6. Create UI Component

```typescript
// src/1-presentation/components/features/my-entity/MyEntityForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { toast } from 'sonner';

export function MyEntityForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/my-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create');
      }

      toast.success('Entity created successfully!');
      setName('');
    } catch (error: any) {
      toast.error('Error creating entity', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Entity name"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Entity'}
      </Button>
    </form>
  );
}
```

#### 7. Write Tests

```typescript
// src/2-application/use-cases/my-entity/CreateMyEntityUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateMyEntityUseCase } from './CreateMyEntityUseCase';

describe('CreateMyEntityUseCase', () => {
  let mockRepository: IMyEntityRepository;
  let useCase: CreateMyEntityUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      // ... other methods
    };
    useCase = new CreateMyEntityUseCase(mockRepository);
  });

  it('should create entity successfully', async () => {
    const data = { name: 'Test Entity' };
    const createdEntity = { id: 'uuid', ...data, createdAt: new Date(), updatedAt: new Date() };

    vi.mocked(mockRepository.create).mockResolvedValue(createdEntity);

    const result = await useCase.execute(data);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.id).toBe('uuid');
    expect(mockRepository.create).toHaveBeenCalledWith(data);
  });
});
```

---

## Coding Standards

### TypeScript

- **Strict Mode:** Always enabled
- **Type Safety:** Avoid `any`, use `unknown` if needed
- **Interfaces vs Types:** Use `interface` for objects, `type` for unions/intersections
- **Naming:**
  - PascalCase for types, interfaces, classes
  - camelCase for variables, functions
  - UPPER_CASE for constants

### React

- **Functional Components:** Always use function components
- **Hooks:** Follow Rules of Hooks
- **Props:** Destructure props
- **Event Handlers:** Prefix with `handle` (e.g., `handleClick`)
- **Client Components:** Mark with `'use client'` directive

### File Naming

- **Components:** PascalCase (e.g., `UserCard.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Tests:** Same as source + `.test.ts` (e.g., `UserCard.test.tsx`)
- **Types:** PascalCase (e.g., `User.ts`)

### Code Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState('');

  // 3b. Event handlers
  const handleClick = () => {
    // ...
  };

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

### Tailwind CSS

- **Utility-First:** Use Tailwind classes
- **Responsive:** Mobile-first approach
- **Custom Classes:** Only when necessary
- **Class Order:** Follow Prettier plugin order

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// Bad (custom CSS)
<div className="my-custom-class">
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/3-domain/entities/Project.test.ts
```

### Writing Tests

#### Unit Tests (Entities, Use Cases)

```typescript
import { describe, it, expect } from 'vitest';

describe('MyEntity', () => {
  it('should create a valid entity', () => {
    const entity = { id: '1', name: 'Test' };
    expect(entity).toBeDefined();
    expect(entity.name).toBe('Test');
  });
});
```

#### Integration Tests (Repositories, API)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MyRepository', () => {
  let repository: MyRepository;

  beforeEach(() => {
    repository = new MyRepository();
  });

  it('should fetch entity from database', async () => {
    const entity = await repository.findById('1');
    expect(entity).toBeDefined();
  });
});
```

### Test Coverage Goals

- **Unit Tests:** > 80%
- **Integration Tests:** > 60%
- **E2E Tests:** Critical paths only

---

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Code refactoring
- `docs/what-documented` - Documentation
- `test/what-tested` - Test additions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(projects): add project template creation

- Add CreateProjectTemplateUseCase
- Add API endpoint /api/projects/templates
- Add UI form for template creation

Closes #123
```

```
fix(tasks): resolve task approval bug

Task approval was failing due to missing approvedBy field validation.

Fixes #456
```

### Pull Request Process

1. **Create Branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push to Remote:**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create PR:**
   - Use PR template
   - Add description and screenshots
   - Link related issues
   - Request review

5. **Code Review:**
   - Address feedback
   - Update PR

6. **Merge:**
   - Squash and merge
   - Delete branch

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### EMFILE: too many open files

**macOS:**
```bash
# Check current limit
ulimit -n

# Increase limit (temporary)
ulimit -n 10240

# Permanent fix: Add to ~/.zshrc or ~/.bashrc
echo "ulimit -n 10240" >> ~/.zshrc
```

### Database Connection Issues

1. Check `.env.local` credentials
2. Verify Supabase project is active
3. Check network connection
4. Review Supabase logs

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

### Test Failures

```bash
# Clear test cache
npm test -- --clearCache

# Run single test
npm test -- path/to/test.ts

# Debug mode
npm test -- --inspect-brk
```

---

## Useful Commands

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

### Testing

```bash
npm test                 # Run tests (watch mode)
npm run test:run         # Run tests once
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

### Database

```bash
# Connect to Supabase
npx supabase login

# Link project
npx supabase link --project-ref your-project-ref

# Pull remote schema
npx supabase db pull

# Generate types
npx supabase gen types typescript --local > src/5-shared/types/database.ts
```

### Storybook

```bash
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Getting Help

- **Issues:** Create a GitHub issue
- **Discussions:** Use GitHub Discussions
- **Slack:** Join our Slack workspace
- **Email:** dev@akademiport.com

---

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

Happy coding! 🚀

