# Integration Tests Guide

API route'ları için integration testleri yazma rehberi.

## Test Yapısı

Integration testleri `src/app/api/**/route.test.ts` formatında yazılır.

## Test Helper'ları

### `createMockRequest(url, options?)`

Mock NextRequest oluşturur:

```typescript
import { createMockRequest } from '@/shared/test/api-helpers';

const request = createMockRequest('http://localhost:3000/api/users', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  cookies: { 'auth-token': 'test-token' },
});
```

### `createMockUser(overrides?)`

Mock authenticated user oluşturur:

```typescript
import { createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

const user = createMockUser({
  id: 'user-123',
  email: 'test@example.com',
  role: UserRole.MASTER_ADMIN,
});
```

## Örnek Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock dependencies
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns data when authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock repository/use case here
    // ...

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
```

## Test Senaryoları

### Authentication Tests

- ✅ Unauthenticated request → 401
- ✅ Invalid token → 401
- ✅ Authenticated request → Success

### Authorization Tests

- ✅ Unauthorized role → 403
- ✅ Authorized role → Success
- ✅ Resource ownership → Success/403

### Request Validation Tests

- ✅ Missing required fields → 400
- ✅ Invalid data format → 400
- ✅ Valid request → Success

### Business Logic Tests

- ✅ Use case success → 200/201
- ✅ Use case failure → 400/404/500
- ✅ Edge cases → Appropriate status

## Notlar

- Integration testleri için test database kurulumu gerekebilir
- Mock'lar repository ve use case seviyesinde yapılabilir
- Gerçek database bağlantısı için test environment setup gerekir
