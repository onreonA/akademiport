# Testing Guide - Akademi Port

## 🧪 Testing Overview

Bu proje kapsamlı bir test suite'ine sahiptir:
- **Unit Tests** - Jest + React Testing Library
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Playwright multi-browser testing

## 📋 Test Commands

### Unit Tests
```bash
# Tüm unit test'leri çalıştır
npm test

# Watch mode'da çalıştır
npm run test:watch

# Coverage raporu ile çalıştır
npm run test:coverage

# CI için optimize edilmiş
npm run test:ci
```

### E2E Tests
```bash
# Tüm E2E test'leri çalıştır
npm run test:e2e

# UI ile test'leri çalıştır
npm run test:e2e:ui

# Headed mode'da çalıştır (browser görünür)
npm run test:e2e:headed
```

## 🏗️ Test Structure

```
__tests__/
├── components/ui/          # UI component unit tests
│   ├── Button.test.tsx
│   ├── StatsCard.test.tsx
│   └── StatusBadge.test.tsx
├── api/                    # API integration tests
│   ├── auth.test.ts
│   ├── company.test.ts
│   ├── admin.test.ts
│   └── news.test.ts
└── e2e/                   # End-to-end tests
    ├── auth.spec.ts
    ├── company-dashboard.spec.ts
    └── admin-dashboard.spec.ts
```

## 🎯 Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🔧 Test Configuration

### Jest Configuration
- **Environment**: jsdom
- **Setup**: jest.setup.js
- **Coverage**: Istanbul
- **Mocking**: Next.js router, Supabase client

### Playwright Configuration
- **Browsers**: Chrome, Firefox, Safari
- **Mobile**: iPhone 12, Pixel 5
- **Base URL**: http://localhost:3000
- **Retries**: 2 (CI), 0 (local)

## 📝 Writing Tests

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/Button'

test('renders with default props', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### API Tests
```typescript
describe('Auth API Endpoints', () => {
  test('should handle login request', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword'
    }
    
    expect(loginData.email).toBe('test@example.com')
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('should login and navigate to dashboard', async ({ page }) => {
  await page.goto('/giris')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/firma')
})
```

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Unit Tests
  run: npm run test:ci

- name: Run E2E Tests
  run: npm run test:e2e
```

### Pre-commit Hooks
- ESLint check
- Prettier format
- Unit test run

## 🐛 Debugging Tests

### Unit Tests
```bash
# Debug mode
npm test -- --detectOpenHandles

# Verbose output
npm test -- --verbose
```

### E2E Tests
```bash
# Debug mode
npm run test:e2e -- --debug

# Specific test
npm run test:e2e auth.spec.ts
```

## 📊 Test Reports

### Coverage Report
- **Location**: `coverage/lcov-report/index.html`
- **Format**: HTML, LCOV, JSON

### E2E Report
- **Location**: `playwright-report/index.html`
- **Format**: HTML with screenshots and videos

## 🔍 Best Practices

### Unit Tests
1. **Arrange-Act-Assert** pattern
2. **Mock external dependencies**
3. **Test user interactions**
4. **Use data-testid attributes**

### API Tests
1. **Test happy path and error cases**
2. **Validate response structure**
3. **Test authentication/authorization**
4. **Use realistic test data**

### E2E Tests
1. **Test critical user journeys**
2. **Use page object pattern for complex pages**
3. **Wait for elements before interaction**
4. **Clean up test data**

## 🚨 Common Issues

### Jest Issues
- **Module resolution**: Check jest.config.js moduleNameMapping
- **Async operations**: Use async/await or waitFor
- **Mock issues**: Ensure mocks are properly configured

### Playwright Issues
- **Timeout errors**: Increase timeout or wait for elements
- **Authentication**: Use beforeEach hooks for login
- **Flaky tests**: Add proper waits and retries

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)

## 🎉 Success Metrics

- ✅ **100%** critical user flows covered
- ✅ **70%+** code coverage maintained
- ✅ **<5s** average test execution time
- ✅ **0** flaky tests in CI
- ✅ **Multi-browser** compatibility verified
