# Accessibility Testing Guide

Bu dokümantasyon projedeki accessibility (a11y) test stratejisini ve kullanımını açıklar.

## Genel Bakış

Proje WCAG 2.1 Level AA standartlarına uygunluk için accessibility testleri içerir:

- **Unit/Component Tests**: jest-axe ile React component testleri
- **E2E Tests**: Playwright ile sayfa seviyesi accessibility testleri
- **CI/CD**: Otomatik accessibility kontrolleri

## Araçlar

### 1. jest-axe

React component'leri için accessibility testleri.

**Kurulum:**

```bash
npm install --save-dev jest-axe
```

**Kullanım:**

```typescript
import { expectNoViolations, WCAG_AA_RULES } from '@/shared/test/accessibility-helpers';
import { render } from '@testing-library/react';

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  await expectNoViolations(container, {
    rules: WCAG_AA_RULES,
  });
});
```

### 2. Playwright Accessibility API

E2E testlerde sayfa seviyesi accessibility kontrolleri.

**Kullanım:**

```typescript
import { test, expect } from '@playwright/test';

test('page should be accessible', async ({ page }) => {
  await page.goto('/dashboard');
  const snapshot = await page.accessibility.snapshot();
  expect(snapshot).toBeTruthy();
});
```

### 3. @axe-core/playwright (Opsiyonel)

Daha detaylı accessibility kontrolleri için.

**Kurulum:**

```bash
npm install --save-dev @axe-core/playwright
```

**Kullanım:**

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page should have no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Test Senaryoları

### Component Level Tests

Component testlerinde accessibility kontrolü:

```typescript
// src/1-presentation/components/features/Button/Button.test.tsx
import { expectNoViolations } from '@/shared/test/accessibility-helpers';

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  await expectNoViolations(container);
});
```

### E2E Tests

Sayfa seviyesi accessibility testleri:

```typescript
// e2e/accessibility/accessibility.spec.ts
test('dashboard should have proper heading hierarchy', async ({ page }) => {
  await page.goto('/dashboard');
  // Check heading hierarchy, form labels, keyboard navigation, etc.
});
```

## WCAG 2.1 Level AA Kuralları

Testler şu WCAG kurallarını kontrol eder:

### 1. Color Contrast (1.4.3)

- Text ve background arasında yeterli kontrast oranı (4.5:1 normal text, 3:1 large text)

### 2. Keyboard Navigation (2.1.1, 2.1.2)

- Tüm interactive elementler klavye ile erişilebilir olmalı
- Klavye tuzakları olmamalı

### 3. ARIA Attributes (4.1.2)

- ARIA attribute'ları doğru kullanılmalı
- ARIA label'ları ve role'ler doğru olmalı

### 4. Semantic HTML (4.1.1)

- Semantic HTML elementleri kullanılmalı (header, nav, main, footer, etc.)
- Heading hierarchy doğru olmalı (h1 → h2 → h3)

### 5. Focus Management (2.4.7)

- Focus görünür olmalı
- Focus order mantıklı olmalı

### 6. Image Alt Text (1.1.1)

- Tüm informative image'ler alt text'e sahip olmalı
- Decorative image'ler alt="" veya role="presentation" olmalı

### 7. Form Labels (3.3.2)

- Tüm form input'ları label'e sahip olmalı
- Label'ler input'larla doğru şekilde ilişkilendirilmeli

### 8. Heading Order (2.4.6)

- Heading'ler mantıklı bir sırada olmalı (h1 → h2 → h3)

### 9. Link Purpose (2.4.4)

- Link'ler açıklayıcı text'e sahip olmalı
- Context'ten bağımsız anlaşılabilir olmalı

### 10. Button Name (4.1.2)

- Button'lar accessible name'e sahip olmalı (text, aria-label, veya aria-labelledby)

## Test Helpers

### `expectNoViolations`

Component veya container için accessibility kontrolü yapar:

```typescript
import { expectNoViolations, WCAG_AA_RULES } from '@/shared/test/accessibility-helpers';

await expectNoViolations(container, {
  rules: WCAG_AA_RULES,
  ignoredRules: ['color-contrast'], // Opsiyonel: belirli kuralları ignore et
});
```

### `checkAccessibility`

Detaylı accessibility sonuçları için:

```typescript
import { checkAccessibility, getViolationsSummary } from '@/shared/test/accessibility-helpers';

const results = await checkAccessibility(container);
if (results.violations.length > 0) {
  console.log(getViolationsSummary(results));
}
```

## CI/CD Entegrasyonu

Accessibility testleri CI/CD pipeline'ında otomatik çalışır:

1. **Unit/Integration Tests**: `npm run test:a11y`
2. **E2E Tests**: `npm run test:a11y:e2e`

Testler `continue-on-error: true` ile çalışır, build'i durdurmaz ancak sonuçlar raporlanır.

## Best Practices

1. **Her yeni component için accessibility testi yazın**
2. **Form'lar için mutlaka label kontrolü yapın**
3. **Keyboard navigation'ı test edin**
4. **Color contrast'ı kontrol edin**
5. **ARIA attribute'larını doğru kullanın**
6. **Semantic HTML kullanın**

## Yaygın Sorunlar ve Çözümler

### 1. Missing Alt Text

```tsx
// ❌ Yanlış
<img src="/logo.png" />

// ✅ Doğru
<img src="/logo.png" alt="Company Logo" />
<img src="/decoration.png" alt="" role="presentation" />
```

### 2. Missing Form Labels

```tsx
// ❌ Yanlış
<input type="email" name="email" />

// ✅ Doğru
<label htmlFor="email">Email</label>
<input type="email" id="email" name="email" />
```

### 3. Missing Button Names

```tsx
// ❌ Yanlış
<button>×</button>

// ✅ Doğru
<button aria-label="Close dialog">×</button>
```

### 4. Incorrect Heading Hierarchy

```tsx
// ❌ Yanlış
<h1>Title</h1>
<h3>Subtitle</h3> // h2 atlanmış

// ✅ Doğru
<h1>Title</h1>
<h2>Subtitle</h2>
```

## Kaynaklar

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Playwright Accessibility API](https://playwright.dev/docs/accessibility-testing)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)

