# Performance Testing

Bu dizin performance ve load testing araçlarını ve senaryolarını içerir.

## Araçlar

### 1. Lighthouse CI

Web sayfalarının performans, erişilebilirlik, best practices ve SEO skorlarını ölçer.

**Kurulum:**

```bash
npm install -g @lhci/cli@latest
```

**Kullanım:**

```bash
# Local test
npm run lighthouse

# CI test
npm run lighthouse:ci
```

**Yapılandırma:**

- `.lighthouserc.js` dosyasında threshold değerleri ve test edilecek URL'ler tanımlıdır.

**Threshold Değerleri:**

- Performance: ≥ 0.7
- Accessibility: ≥ 0.9
- Best Practices: ≥ 0.8
- SEO: ≥ 0.8
- FCP: < 2000ms
- LCP: < 2500ms
- CLS: < 0.1
- TBT: < 300ms
- Speed Index: < 3000ms

### 2. k6

API endpoint'lerinin load ve stress testlerini yapar.

**Kurulum:**

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

**Kullanım:**

```bash
# API load test
npm run k6:api

# Auth load test
npm run k6:auth

# Custom test
k6 run --vus 20 --duration 60s performance/k6/api-load-test.js
```

**Test Senaryoları:**

- `k6/api-load-test.js`: Genel API endpoint'leri
- `k6/auth-load-test.js`: Authentication endpoint'leri

## CI/CD Entegrasyonu

Performance testleri GitHub Actions workflow'unda otomatik olarak çalıştırılır:

- **Lighthouse CI**: Her push/PR'da çalışır
- **k6 Load Test**: Her push/PR'da çalışır

Workflow dosyası: `.github/workflows/performance.yml`

## Sonuçlar

- Lighthouse sonuçları: `.lighthouseci/` dizininde
- k6 sonuçları: `performance/k6-results.json` dosyasında

## Threshold Değerleri

### Lighthouse

- Performance: ≥ 0.7
- Accessibility: ≥ 0.9
- Best Practices: ≥ 0.8
- SEO: ≥ 0.8

### k6

- Response Time (p95): < 2000ms
- Error Rate: < 5%
- Request Duration: < 2000ms

## Notlar

- Performance testleri CI'da `continue-on-error: true` ile çalışır, build'i durdurmaz
- Sonuçlar artifact olarak kaydedilir ve analiz edilebilir
- Local test için uygulamanın çalışıyor olması gerekir (`npm start`)

