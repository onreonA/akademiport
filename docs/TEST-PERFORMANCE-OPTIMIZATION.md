# Test Performance Optimization Guide

Bu dokümantasyon test performansı optimizasyonlarını ve best practice'leri açıklar.

## Genel Bakış

Test performansı optimizasyonları şu alanları kapsar:

- **Test Execution Time**: Test sürelerini optimize etme
- **Test Sharding**: Büyük test suite'lerini bölme
- **Parallel Execution**: Paralel test çalıştırma
- **Mock Optimization**: Mock'ları optimize etme

## Mevcut Optimizasyonlar

### 1. Vitest Configuration

**Parallelization:**

```typescript
// vitest.config.ts
test: {
  threads: !process.env.CI, // Disable threads in CI
  maxWorkers: process.env.CI ? 1 : undefined,
  isolate: true, // Isolate each test file
  pool: 'threads',
}
```

**Neden?**

- CI'da single thread daha stabil
- Local'de parallel execution daha hızlı
- Isolation test interference'ı önler

### 2. Test Retry Mechanism

**Retry Settings:**

```typescript
test: {
  retry: process.env.CI ? 2 : 0, // Retry in CI only
}
```

**Neden?**

- Flaky testleri otomatik retry eder
- CI'da daha güvenilir sonuçlar
- Local'de retry gereksiz (hızlı feedback)

### 3. Test Timeout Settings

**Timeout Values:**

```typescript
test: {
  testTimeout: 10000, // 10 seconds
  hookTimeout: 10000,
}
```

**Neden?**

- Sonsuz döngüleri önler
- Yavaş testleri tespit eder
- CI'da timeout sorunlarını önler

## Performance Analysis

### Test Performance Script

```bash
npm run test:performance
```

Bu script:

- Yavaş testleri tespit eder (>1s)
- En yavaş test dosyalarını listeler
- Optimizasyon önerileri sunar

### Yavaş Test Tespiti

**Threshold:**

- **Yavaş Test:** >1000ms (1 saniye)
- **Çok Yavaş Test:** >5000ms (5 saniye)

**Optimizasyon Stratejisi:**

1. **Mock Optimization**: Mock'ları daha hızlı hale getir
2. **Async Operations**: Gereksiz async işlemleri kaldır
3. **Test Isolation**: Test interference'ı önle
4. **Test Sharding**: Büyük test suite'lerini böl

## Test Sharding

Büyük test suite'lerini paralel çalıştırmak için:

```bash
# Test suite'ini 4 parçaya böl
npm run test:run -- --shard=1/4
npm run test:run -- --shard=2/4
npm run test:run -- --shard=3/4
npm run test:run -- --shard=4/4
```

**CI'da:**

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm run test:run -- --shard=${{ matrix.shard }}/4
```

## Best Practices

### 1. Mock Optimization

**❌ Yavaş:**

```typescript
vi.mock('@/api/service', () => ({
  fetchData: vi.fn(() => Promise.resolve(data)), // Async mock
}));
```

**✅ Hızlı:**

```typescript
vi.mock('@/api/service', () => ({
  fetchData: vi.fn().mockResolvedValue(data), // Sync mock
}));
```

### 2. Test Isolation

**❌ Yavaş:**

```typescript
describe('MyComponent', () => {
  // Shared state between tests
  let sharedData;
});
```

**✅ Hızlı:**

```typescript
describe('MyComponent', () => {
  setupTestIsolation(); // Isolated state

  beforeEach(() => {
    // Fresh state for each test
  });
});
```

### 3. Async Operations

**❌ Yavaş:**

```typescript
it('test', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Unnecessary delay
});
```

**✅ Hızlı:**

```typescript
it('test', async () => {
  await waitFor(() => {
    expect(element).toBeInTheDocument();
  }); // Only wait when necessary
});
```

## Monitoring

### Performance Metrics

- **Test Execution Time**: CI'da takip edilir
- **Slow Tests**: Performance script ile tespit edilir
- **Test Reliability**: Flaky test oranı ile ölçülür

### CI/CD Integration

Performance metrikleri GitHub Actions'da takip edilir:

```yaml
- name: Test Performance Analysis
  run: npm run test:performance || true
  continue-on-error: true
```

## Troubleshooting

### Tests Are Slow

1. **Check Mock Performance**: Mock'ları optimize et
2. **Check Async Operations**: Gereksiz await'leri kaldır
3. **Check Test Isolation**: Test interference'ı kontrol et
4. **Use Test Sharding**: Büyük suite'leri böl

### CI Tests Timeout

1. **Increase Timeout**: `testTimeout` değerini artır
2. **Reduce Parallelism**: `maxWorkers` değerini azalt
3. **Use Single Thread**: CI'da `threads: false`

## Kaynaklar

- [Vitest Performance](https://vitest.dev/guide/performance)
- [Test Sharding](https://vitest.dev/guide/cli#shard)
- [Mock Optimization](https://vitest.dev/api/vi.html#vi-fn)
