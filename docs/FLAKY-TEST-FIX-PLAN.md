# Flaky Test Fix Plan

**Tarih:** 13 Aralık 2025  
**Durum:** 🔄 Devam Ediyor

---

## 📊 Bilinen Flaky Testler

### 1. Component Tests

#### AppointmentRequestForm.test.tsx

**Sorun:** Radix UI Select component ile interaction sorunları

**Neden Flaky:**

- Portal rendering timing sorunları
- Mock fetch sequence sorunları
- Select dropdown'ın async açılması

**Çözüm:**

```typescript
// waitFor kullanarak async rendering'i bekle
await waitFor(() => {
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});

// User event'i daha güvenilir şekilde kullan
const user = userEvent.setup();
await user.click(screen.getByRole('combobox'));
await waitFor(() => {
  expect(screen.getByRole('option', { name: 'Option 1' })).toBeVisible();
});
```

#### UnifiedCalendar.test.tsx

**Sorun:** FullCalendar filter'ları mock edilemiyor

**Neden Flaky:**

- FullCalendar component'i kompleks
- Filter state management timing sorunları

**Çözüm:**

- E2E test'lere taşı (zaten yapıldı)
- Component test'te daha basit mock kullan

#### AvailabilityManagement.test.tsx

**Sorun:** Mock hook'lar düzgün çalışmıyor

**Neden Flaky:**

- Custom hook mock'ları timing sorunları
- State update race conditions

**Çözüm:**

```typescript
// Hook mock'larını daha güvenilir hale getir
vi.mock('@/hooks/useAvailability', () => ({
  useAvailability: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));
```

### 2. Integration Tests

#### API Route Tests

**Sorun:** Mock Supabase client chain sorunları

**Neden Flaky:**

- Chainable API mock'ları karmaşık
- Hoisting sorunları

**Çözüm:**

- Factory function pattern kullan (zaten yapıldı)
- Mock'ları test isolation içinde reset et

### 3. E2E Tests

**Sorun:** Timing ve network sorunları

**Neden Flaky:**

- Network latency
- Page load timing
- Element visibility timing

**Çözüm:**

- `waitFor` kullan
- `networkidle` wait state kullan
- Retry mekanizması ekle

---

## 🔧 Çözüm Stratejisi

### 1. Test Retry Mekanizması

Vitest config'e retry ekle:

```typescript
// vitest.config.ts
test: {
  retry: process.env.CI ? 2 : 0, // CI'da 2 retry
  // ...
}
```

### 2. Test Isolation İyileştirmeleri

- Her test öncesi mocks reset et
- Global state'i temizle
- Browser state'i temizle (E2E için)

### 3. Timing İyileştirmeleri

- `waitFor` kullan (React Testing Library)
- `waitForLoadState` kullan (Playwright)
- Timeout değerlerini artır

### 4. Mock İyileştirmeleri

- Factory function pattern kullan
- Mock'ları test içinde oluştur (hoisting sorunlarını önle)
- Mock state'i her test öncesi reset et

---

## 📋 Yapılacaklar

- [ ] Flaky test detection script'i çalıştır
- [ ] Flaky testleri listele
- [ ] Her flaky test için fix uygula
- [ ] Retry mekanizması ekle
- [ ] Test isolation iyileştirmeleri yap
- [ ] Timing iyileştirmeleri yap
- [ ] Mock iyileştirmeleri yap
- [ ] Flaky testleri tekrar test et

---

## 🎯 Hedefler

- Flaky test oranı: %5 → %1 altı
- Test güvenilirliği: %95+ → %99+
- CI/CD başarı oranı: %90+ → %98+

