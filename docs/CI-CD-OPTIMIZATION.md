# CI/CD Optimization Guide

Bu dokümantasyon projedeki CI/CD pipeline optimizasyonlarını ve best practice'leri açıklar.

## Genel Bakış

Proje şu CI/CD optimizasyonlarını içerir:

- **Parallelization**: Matrix strategy ile paralel test çalıştırma
- **Caching**: Node modules, Playwright browsers, Vitest cache
- **Smart Hooks**: lint-staged ve changed tests ile hızlı pre-commit/push hooks
- **Test Reporting**: Test summaries ve artifact uploads
- **Notifications**: (Opsiyonel) Slack/Discord webhook entegrasyonu

## GitHub Actions Workflows

### 1. Optimized CI Workflow (`ci-optimized.yml`)

**Özellikler:**

- **Matrix Strategy**: Testleri paralel çalıştırır (unit, integration, accessibility)
- **Caching**: Node modules, Playwright browsers, Vitest cache
- **Test Summaries**: Otomatik test sonuç özetleri
- **Artifact Management**: Test sonuçları ve coverage raporları

**Kullanım:**

```yaml
# .github/workflows/ci.yml dosyasını ci-optimized.yml ile değiştirin
# veya ci-optimized.yml'yi ci.yml olarak rename edin
```

**Matrix Strategy:**

```yaml
strategy:
  fail-fast: false
  matrix:
    test-type: [unit, integration, accessibility]
```

Bu sayede her test tipi paralel çalışır ve birinin başarısız olması diğerlerini durdurmaz.

### 2. Caching Strategy

**Node Modules Cache:**

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**Playwright Browsers Cache:**

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```

**Vitest Cache:**

```yaml
- name: Cache Vitest
  uses: actions/cache@v4
  with:
    path: node_modules/.vitest
    key: ${{ runner.os }}-vitest-${{ hashFiles('**/package-lock.json') }}
```

## Pre-commit Hooks

### lint-staged Configuration

`.lintstagedrc.js` dosyası sadece değişen dosyaları lint/format eder:

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.json': ['prettier --write'],
  '*.md': ['prettier --write'],
};
```

**Kurulum:**

```bash
npm install --save-dev lint-staged
```

**Kullanım:**

Pre-commit hook otomatik olarak lint-staged kullanır. Eğer lint-staged yoksa, fallback olarak tüm dosyaları kontrol eder.

## Pre-push Hooks

### Smart Test Execution

Pre-push hook şu mantıkla çalışır:

1. **Changed Tests**: Eğer sadece test dosyaları değiştiyse, sadece onları çalıştır
2. **Full Suite**: Eğer kod değiştiyse, tüm test suite'ini çalıştır

```bash
# Changed tests only
npm run test:changed

# Full suite
npm run test:run
```

## Vitest Configuration Optimizations

### Parallelization Settings

```typescript
test: {
  threads: !process.env.CI, // Disable threads in CI
  maxWorkers: process.env.CI ? 1 : undefined, // Single worker in CI
  minWorkers: 1,
}
```

**Neden?**

- CI ortamında thread'ler bazen sorun çıkarabilir
- Single worker daha stabil sonuçlar verir
- Local development'da paralel çalışma hızlandırır

### Coverage Thresholds

```typescript
coverage: {
  thresholds: {
    lines: 60,
    functions: 60,
    branches: 60,
    statements: 60,
  },
}
```

Coverage threshold'ları build'i durdurmaz ancak uyarı verir.

### Test Reporting

```typescript
reporters: process.env.CI
  ? ['verbose', 'json', 'junit']
  : ['verbose', 'json'],
outputFile: {
  json: './test-results/results.json',
  junit: './test-results/junit.xml',
},
```

CI'da JUnit formatı GitHub Actions'ın test summary'si için kullanılır.

## Test Result Reporting

### Artifact Uploads

Test sonuçları otomatik olarak artifact olarak kaydedilir:

```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.test-type }}
    path: |
      test-results/${{ matrix.test-type }}-results.json
      coverage/
    retention-days: 7
```

### Test Summary

GitHub Actions'ın built-in summary özelliği kullanılır:

```yaml
- name: Generate test summary
  run: |
    echo "## Test Results Summary" >> $GITHUB_STEP_SUMMARY
    echo "| Test Type | Status |" >> $GITHUB_STEP_SUMMARY
    # ...
```

## Notifications (Opsiyonel)

### Slack Webhook

`ci-optimized.yml` dosyasında commented out olarak örnek var:

```yaml
# notify:
#   name: Notify Results
#   runs-on: ubuntu-latest
#   needs: [tests, e2e-tests, build]
#   if: always()
#
#   steps:
#     - name: Notify Slack
#       if: failure()
#       uses: 8398a7/action-slack@v3
#       with:
#         status: ${{ job.status }}
#         webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Kurulum:**

1. GitHub Secrets'a `SLACK_WEBHOOK_URL` ekleyin
2. Comment'leri kaldırın
3. Webhook URL'ini yapılandırın

## Performance Metrics

### Expected Improvements

- **Test Execution Time**: %30-50 daha hızlı (parallelization sayesinde)
- **Pre-commit Hook Time**: %70-90 daha hızlı (lint-staged sayesinde)
- **CI Pipeline Time**: %20-40 daha hızlı (caching sayesinde)

### Monitoring

CI pipeline sürelerini GitHub Actions'ın "Actions" sekmesinden takip edebilirsiniz.

## Best Practices

1. **Always use caching**: Node modules ve browser cache'leri mutlaka cache'leyin
2. **Fail-fast: false**: Matrix strategy'de bir test başarısız olsa bile diğerleri çalışsın
3. **Artifact retention**: Test sonuçlarını 7 gün saklayın (daha uzun süre storage maliyeti artırır)
4. **Timeout settings**: Her job için timeout belirleyin (sonsuz döngüleri önler)
5. **Continue-on-error**: Non-critical testler için kullanın (accessibility, performance)

## Troubleshooting

### Cache Issues

Eğer cache sorunları yaşıyorsanız:

```bash
# Cache'i temizle
gh cache delete --all

# veya GitHub Actions UI'dan cache'i sil
```

### Test Timeout Issues

Test timeout sorunları için:

```yaml
timeout-minutes: 30 # Job timeout
testTimeout: 10000 # Vitest test timeout (ms)
```

### Parallelization Issues

Eğer paralel testler sorun çıkarıyorsa:

```typescript
// vitest.config.ts
test: {
  threads: false,  // Disable threads
  maxWorkers: 1,   // Single worker
}
```

## Migration Guide

### Mevcut CI Workflow'unu Güncelleme

1. `ci-optimized.yml` dosyasını inceleyin
2. Gerekli değişiklikleri `ci.yml`'ye uygulayın
3. Test edin
4. Deploy edin

### lint-staged Kurulumu

```bash
npm install --save-dev lint-staged
```

`.lintstagedrc.js` dosyası zaten mevcut, sadece paketi kurun.

## Kaynaklar

- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Vitest Configuration](https://vitest.dev/config/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [GitHub Actions Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

