# GitHub Actions Workflows

Bu dizin CI/CD pipeline'larını içerir.

## Workflow Dosyaları

### `ci.yml`

Ana CI pipeline'ı:

- Code quality checks (type check, lint, format)
- Unit ve integration testleri
- E2E testleri
- Build check

### `test.yml`

Test odaklı workflow:

- Unit ve integration testleri
- E2E testleri
- Coverage raporları

### `test-coverage.yml`

Coverage raporlama workflow'u:

- Detaylı coverage raporları
- Coverage trend analizi

## Kullanım

Workflow'lar otomatik olarak şu durumlarda çalışır:

- `main` veya `develop` branch'ine push yapıldığında
- Pull request açıldığında

## Secrets

Aşağıdaki secrets'ları GitHub repository settings'te tanımlamanız gerekir:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Coverage

Coverage raporları her test çalıştırmasından sonra artifact olarak yüklenir ve 7-30 gün saklanır.
