# Test Coverage Analysis Guide

Bu dokümantasyon test coverage analizi için rehberlik sağlar.

## Coverage Raporu Oluşturma

Coverage raporunu oluşturmak için:

```bash
npm run test:coverage
```

Bu komut:

- Tüm testleri çalıştırır
- Coverage verilerini toplar
- `coverage/coverage-final.json` dosyasını oluşturur
- HTML raporu oluşturur (`coverage/index.html`)

## Coverage Analizi

Coverage analizini çalıştırmak için:

```bash
npm run test:coverage:analyze
```

Bu script:

- Coverage raporunu analiz eder
- Genel coverage özetini gösterir
- Düşük coverage dosyalarını listeler
- Kritik path'leri önceliklendirir
- Detaylı rapor oluşturur (`test-results/coverage-analysis.json`)

## Coverage Thresholds

Proje için minimum coverage threshold'ları:

- **Lines:** %60
- **Statements:** %60
- **Functions:** %60
- **Branches:** %60

## Critical Paths

Aşağıdaki path'ler kritik olarak işaretlenmiştir:

- `src/2-application/use-cases` - Business logic
- `src/app/api` - API routes
- `src/4-infrastructure` - Infrastructure layer

Bu path'ler için %80+ coverage hedeflenir.

## Coverage İyileştirme Stratejisi

1. **Kritik Path'leri Önceliklendir**
   - Use case'ler için test ekle
   - API route'lar için integration test ekle
   - Infrastructure layer için test ekle

2. **Düşük Coverage Dosyalarını Tespit Et**

   ```bash
   npm run test:coverage:analyze
   ```

3. **Test Ekleme Planı**
   - Unit testler (use case'ler için)
   - Integration testler (API route'lar için)
   - Component testler (UI component'ler için)

## Coverage Raporu Görüntüleme

HTML coverage raporunu görüntülemek için:

```bash
open coverage/index.html
```

veya tarayıcıda `coverage/index.html` dosyasını açın.

## Troubleshooting

### Coverage Raporu Oluşmuyor

1. Testlerin tamamlandığından emin olun
2. `coverage/` klasörünün var olduğunu kontrol edin
3. `coverage-final.json` dosyasının oluştuğunu kontrol edin

### Coverage Analizi Başarısız

1. Önce `npm run test:coverage` çalıştırın
2. `coverage/coverage-final.json` dosyasının var olduğunu kontrol edin
3. Script'in doğru çalıştığından emin olun

## Kaynaklar

- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [@vitest/coverage-v8](https://github.com/vitest-dev/vitest/tree/main/packages/coverage-v8)
