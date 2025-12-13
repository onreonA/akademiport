# Visual Regression Testing Guide

Bu dokümantasyon projedeki visual regression testing stratejisini ve kullanımını açıklar.

## Genel Bakış

Proje visual regression testing için şu araçları kullanır:

- **Storybook**: Component stories
- **Chromatic**: Visual regression testing ve UI review
- **Storybook Test Runner**: Automated visual tests

## Araçlar

### 1. Chromatic

Visual regression testing ve UI review platformu.

**Kurulum:**

Chromatic paketi zaten kurulu (`@chromatic-com/storybook`). Yapılandırma `.chromatic.config.json` dosyasında.

**Kullanım:**

```bash
# Chromatic'e publish et
npm run chromatic

# veya direkt
npx chromatic --project-token=YOUR_TOKEN
```

**Yapılandırma:**

`.chromatic.config.json` dosyasında:

- `projectToken`: Chromatic project token (GitHub Secrets'tan alınır)
- `buildScriptName`: Storybook build script'i
- `onlyChanged`: Sadece değişen story'leri test et
- `exitZeroOnChanges`: Visual değişikliklerde exit code 0 döndür (review için)

### 2. Storybook Test Runner

Automated visual regression tests için.

**Kurulum:**

```bash
npm install --save-dev @storybook/test-runner
```

**Kullanım:**

```bash
# Storybook çalışırken test runner'ı çalıştır
npm run storybook &
npm run test:visual

# CI'da
npm run build-storybook
npm run storybook &
npm run test:visual:ci
```

**Yapılandırma:**

`.storybook/test-runner.config.ts` dosyasında:

- Accessibility checks (axe-core)
- Visual regression test tags
- Test filtering

### 3. Story Tags

Story'leri tag'leyerek test scope'unu kontrol edebilirsiniz:

```typescript
// Visual regression test için
tags: ['visual'];

// Test'i atla
tags: ['skip-visual'];

// Hem visual hem accessibility test için
tags: ['visual', 'a11y'];
```

## CI/CD Entegrasyonu

### GitHub Actions Workflow

`.github/workflows/visual-regression.yml` dosyası:

1. **Chromatic Job**: Storybook'u build edip Chromatic'e publish eder
2. **Test Runner Job**: Storybook test runner'ı çalıştırır

**Secrets:**

- `CHROMATIC_PROJECT_TOKEN`: Chromatic project token (GitHub Secrets'a eklenmeli)

## Visual Regression Test Senaryoları

### 1. Component Visual Tests

Her component story'si için visual snapshot:

```typescript
// button.stories.tsx
export default {
  title: 'UI/Button',
  component: Button,
  tags: ['visual'], // Visual regression test için
} satisfies Meta<typeof Button>;
```

### 2. Interaction Tests

User interaction'ları test et:

```typescript
export const Interactive: Story = {
  tags: ['visual'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    // Visual state'i kontrol et
  },
};
```

### 3. Responsive Tests

Farklı viewport'larda test:

```typescript
export const Mobile: Story = {
  tags: ['visual'],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

## Best Practices

1. **Tag Stories**: Visual test edilecek story'leri `visual` tag'i ile işaretleyin
2. **Skip Unstable**: Flaky veya unstable story'leri `skip-visual` tag'i ile atlayın
3. **Review Changes**: Chromatic'te visual değişiklikleri review edin
4. **Baseline Updates**: Intentional değişikliklerde baseline'ı güncelleyin

## Troubleshooting

### Chromatic Build Fails

```bash
# Storybook build'i kontrol et
npm run build-storybook

# Chromatic config'i kontrol et
cat .chromatic.config.json
```

### Test Runner Fails

```bash
# Storybook'un çalıştığından emin ol
npm run storybook

# Test runner config'i kontrol et
cat .storybook/test-runner.config.ts
```

### Visual Changes Not Detected

- Chromatic'te `onlyChanged: true` ayarını kontrol edin
- Story'lerin `visual` tag'i olduğundan emin olun
- Storybook build'inin güncel olduğundan emin olun

## Kaynaklar

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Test Runner](https://storybook.js.org/docs/writing-tests/test-runner)
- [Visual Testing Best Practices](https://storybook.js.org/docs/writing-tests/visual-testing)
