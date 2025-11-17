# 🧠 Sprint 17: AI Altyapısı - Başlangıç Planı

**Başlangıç Tarihi:** 17 Kasım 2025  
**Tahmini Süre:** 1 hafta (40 saat)  
**Durum:** 🔴 BAŞLANIYOR  
**Öncelik:** Kritik (5 sprint'in temel bağımlılığı)

---

## 🎯 Sprint Hedefi

OpenAI ve Claude API entegrasyonu ile kapsamlı AI service layer oluşturmak.

---

## 📋 GÖREV LİSTESİ

### ✅ Hazır Olan Dosyalar (Kontrol Edilecek)

1. **AI Configuration** ✅
   - `src/4-infrastructure/config/ai.config.ts` - Mevcut
   - Environment variables tanımlı
   - Model pricing tanımlı
   - Rate limits tanımlı

2. **AI Enums** ✅
   - `src/3-domain/enums/AIEnums.ts` - Mevcut
   - AIProvider, AIUseCase, AIModel enum'ları
   - AI_PROVIDER_MAP tanımlı

3. **AI Services** ✅ (Kontrol edilecek)
   - `src/5-shared/services/ai/openai.service.ts` - Mevcut
   - `src/5-shared/services/ai/claude.service.ts` - Mevcut
   - `src/5-shared/services/ai/ai-router.service.ts` - Mevcut
   - `src/5-shared/services/ai/token-tracker.service.ts` - Mevcut
   - `src/5-shared/services/ai/cost-tracker.service.ts` - Mevcut

4. **Database Migration** ⚠️
   - `src/4-infrastructure/database/migrations/037_create_ai_tables.sql` - Kontrol edilecek

5. **Dependencies** ✅
   - `openai@^6.9.0` - Kurulu
   - `@anthropic-ai/sdk@^0.69.0` - Kurulu

---

## 🔧 YAPILACAK İŞLER

### Faz 1: Mevcut Dosyaları Kontrol Et (1 saat)

- [ ] AI service dosyalarını oku ve kontrol et
- [ ] Eksik fonksiyonları tespit et
- [ ] Test dosyalarını kontrol et
- [ ] Database migration'ı kontrol et

### Faz 2: Eksikleri Tamamla (2-3 saat)

- [ ] Eksik fonksiyonları implement et
- [ ] Error handling iyileştir
- [ ] Retry logic ekle
- [ ] Rate limiting test et

### Faz 3: Database Migration (1 saat)

- [ ] Migration dosyasını kontrol et
- [ ] Gerekirse düzelt
- [ ] Supabase'e uygula
- [ ] RLS policies kontrol et

### Faz 4: Test Et (2 saat)

- [ ] Unit testleri çalıştır
- [ ] Integration testleri yaz
- [ ] OpenAI API test et
- [ ] Claude API test et
- [ ] AI Router test et

### Faz 5: Dokümantasyon (1 saat)

- [ ] API dokümantasyonu yaz
- [ ] Kullanım örnekleri ekle
- [ ] README güncelle

---

## 🚀 BAŞLANGIÇ ADIMLARI

### Adım 1: Environment Variables

```bash
# .env.local dosyasına ekle
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Adım 2: Mevcut Dosyaları Kontrol Et

```bash
# AI service dosyalarını listele
ls -la src/5-shared/services/ai/

# AI config'i kontrol et
cat src/4-infrastructure/config/ai.config.ts

# AI enums'ı kontrol et
cat src/3-domain/enums/AIEnums.ts
```

### Adım 3: Test Çalıştır

```bash
# AI service testlerini çalıştır
npm test -- ai
```

---

## 📊 İLERLEME TAKİBİ

- [ ] Faz 1: Mevcut dosyaları kontrol et (0/5)
- [ ] Faz 2: Eksikleri tamamla (0/4)
- [ ] Faz 3: Database migration (0/4)
- [ ] Faz 4: Test et (0/4)
- [ ] Faz 5: Dokümantasyon (0/3)

**Toplam:** 0/20 görev tamamlandı (%0)

---

## 🎯 KABUL KRİTERLERİ

- ✅ OpenAI API çalışıyor (GPT-4, GPT-4 Turbo, GPT-3.5)
- ✅ Claude API çalışıyor (Opus, Sonnet, Haiku)
- ✅ AI Router use case bazlı provider seçiyor
- ✅ Token tracking çalışıyor
- ✅ Cost tracking çalışıyor
- ✅ Error handling ve retry çalışıyor
- ✅ Rate limiting çalışıyor
- ✅ Database migration uygulandı
- ✅ Testler passing
- ✅ Dokümantasyon tamamlandı

---

## 📝 NOTLAR

- OpenAI ve Claude API key'leri .env.local'de olmalı
- Rate limit'lere dikkat edilmeli
- Token ve cost tracking her request'te çalışmalı
- Error handling kapsamlı olmalı (retry, fallback)

---

**Hazırlayan:** AI Assistant  
**Başlangıç:** 17 Kasım 2025  
**Durum:** 🔴 Başlanıyor
