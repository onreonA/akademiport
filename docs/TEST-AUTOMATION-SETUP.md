# Test Automation Setup

Bu dokümantasyon test automation altyapısını açıklar.

## Pre-commit Hooks (Husky)

### Kurulum

Husky otomatik olarak `npm install` sırasında kurulur. Manuel kurulum için:

```bash
npm run prepare
```

### Pre-commit Hook

Commit öncesi şunlar çalışır:

1. **Type Check**: TypeScript type kontrolü
2. **Lint**: ESLint kontrolü
3. **Tests**: Sadece değişen dosyalar için testler
4. **Format**: Prettier ile kod formatlama

### Pre-push Hook

Push öncesi şunlar çalışır:

1. **All Tests**: Tüm unit ve integration testleri
2. **E2E Tests**: End-to-end testleri

### Hook'ları Atlamak

**Önerilmez**, ancak acil durumlarda:

```bash
git commit --no-verify  # Pre-commit hook'unu atla
git push --no-verify     # Pre-push hook'unu atla
```

## CI/CD Pipeline (GitHub Actions)

### Workflow'lar

#### 1. `ci.yml` - Ana CI Pipeline

**Çalışma Zamanı:**

- `main` veya `develop` branch'ine push
- Pull request açıldığında

**Adımlar:**

1. **Quality Checks**
   - Type check
   - Lint
   - Format check

2. **Tests**
   - Unit ve integration testleri
   - Coverage raporu oluşturma
   - Codecov'a yükleme

3. **E2E Tests**
   - Playwright testleri
   - Test sonuçları artifact olarak saklanır

4. **Build Check**
   - Production build kontrolü

#### 2. `test.yml` - Test Odaklı Workflow

**Çalışma Zamanı:**

- `main` veya `develop` branch'ine push
- Pull request açıldığında

**Adımlar:**

1. Unit & Integration Tests
2. E2E Tests
3. Coverage raporları

#### 3. `test-coverage.yml` - Coverage Raporlama

**Çalışma Zamanı:**

- `main` branch'ine push
- `main` branch'e PR

**Adımlar:**

1. Coverage raporu oluşturma
2. GitHub Step Summary'ye yazma
3. Artifact olarak saklama (30 gün)

### Secrets

GitHub repository settings'te aşağıdaki secrets'ları tanımlayın:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

### Coverage Raporları

Coverage raporları:

- Her test çalıştırmasından sonra artifact olarak yüklenir
- 7-30 gün saklanır
- GitHub Actions UI'dan indirilebilir

## Test Komutları

### Development

```bash
# Watch mode
npm test

# UI mode
npm run test:ui

# E2E UI mode
npm run test:e2e:ui
```

### CI/CD

```bash
# Run all tests
npm run test:run

# Run E2E tests
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all

# Generate coverage
npm run test:coverage

# Run tests for changed files only
npm run test:changed
```

## Test Coverage Hedefleri

- **Unit Tests**: > 80%
- **Integration Tests**: > 70%
- **E2E Tests**: Critical user flows

## Troubleshooting

### Pre-commit hook çok yavaş

Sadece değişen dosyalar için test çalıştırılır (`--changed` flag). Tüm testleri çalıştırmak için:

```bash
npm run test:run
```

### CI'da testler başarısız oluyor

1. Local'de testleri çalıştırın: `npm run test:all`
2. Coverage raporunu kontrol edin: `npm run test:coverage`
3. GitHub Actions loglarını inceleyin

### E2E testleri CI'da başarısız oluyor

1. Local'de testleri çalıştırın: `npm run test:e2e`
2. Headed mode'da çalıştırın: `npm run test:e2e:headed`
3. Debug mode'da çalıştırın: `npm run test:e2e:debug`

## Best Practices

1. **Commit öncesi**: Pre-commit hook'ları çalıştırılır, sorunları erken yakalayın
2. **Push öncesi**: Pre-push hook tüm testleri çalıştırır, production'a geçmeden önce kontrol edin
3. **PR açmadan önce**: Local'de tüm testleri çalıştırın
4. **Coverage**: Coverage'ı düzenli olarak kontrol edin ve hedefleri koruyun
