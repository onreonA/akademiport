# 🧠 Sprint 17: AI Altyapısı - Detaylı Analiz ve Plan

**Tarih:** 15 Kasım 2025  
**Sprint:** 17 / 28  
**Durum:** 📋 Planlama Aşaması  
**Öncelik:** 🔴 Çok Yüksek (6 sprint'in temel altyapısı)

---

## 🎯 Sprint Hedefi

**Ana Hedef:** OpenAI ve Claude API entegrasyonu ile kapsamlı AI service layer oluşturmak.

**Alt Hedefler:**

1. ✅ OpenAI GPT-4 API entegrasyonu
2. ✅ Anthropic Claude API entegrasyonu
3. ✅ AI Router (use case bazlı provider seçimi)
4. ✅ Prompt Management (versiyonlama ve şablon yönetimi)
5. ✅ Token Tracking (kullanım takibi)
6. ✅ Cost Tracking (maliyet hesaplama)
7. ✅ Error Handling & Retry mekanizması
8. ✅ Rate Limiting
9. ✅ Caching (opsiyonel - Redis)

---

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanmış Altyapı

- ✅ Database & Auth (Sprint 2)
- ✅ Clean Architecture yapısı
- ✅ Environment variable yönetimi
- ✅ Logger sistemi
- ✅ Error handling pattern'leri

### ❌ Eksik Özellikler

- ❌ AI service layer yok
- ❌ OpenAI SDK entegrasyonu yok
- ❌ Claude SDK entegrasyonu yok
- ❌ AI usage tracking yok
- ❌ Prompt management yok
- ❌ Token/cost tracking yok

---

## 📦 Sprint Kapsamı

### Faz A: Database Schema (1-2 saat)

**Migration:** `037_create_ai_tables.sql`

**Tablo 1: `ai_usage_logs`**

- AI kullanım logları
- Token sayısı
- Maliyet bilgisi
- Provider (openai/claude)
- Use case tipi
- Başarı/hata durumu

**Tablo 2: `ai_prompts`**

- Prompt şablonları
- Versiyonlama
- Use case mapping
- Metadata

**Tablo 3: `ai_provider_configs`** (opsiyonel)

- Provider ayarları
- Rate limit ayarları
- Model seçimleri

---

### Faz B: Dependencies & Configuration (30 dakika)

**Paketler:**

- `openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `ioredis` (opsiyonel) - Redis caching

**Environment Variables:**

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://... (opsiyonel)
```

**Configuration:**

- `src/4-infrastructure/config/ai.config.ts`

---

### Faz C: Core Services (4-5 saat)

#### 1. OpenAI Service (`openai.service.ts`)

- GPT-4, GPT-3.5-turbo desteği
- Streaming desteği
- Error handling
- Retry logic

#### 2. Claude Service (`claude.service.ts`)

- Claude 3 Opus, Sonnet, Haiku desteği
- Streaming desteği
- Error handling
- Retry logic

#### 3. AI Router Service (`ai-router.service.ts`)

- Use case bazlı provider seçimi
- Fallback mekanizması
- Provider health check

#### 4. Prompt Manager Service (`prompt-manager.service.ts`)

- Prompt şablon yönetimi
- Versiyonlama
- Variable substitution
- Database entegrasyonu

#### 5. Token Tracker Service (`token-tracker.service.ts`)

- Input/output token sayımı
- Database logging
- Aggregation queries

#### 6. Cost Tracker Service (`cost-tracker.service.ts`)

- Provider bazlı maliyet hesaplama
- Model bazlı fiyatlandırma
- Database logging
- Cost reports

---

### Faz D: Error Handling & Retry (1 saat)

- Exponential backoff
- Max retry attempts
- Error classification
- Fallback strategies

---

### Faz E: Rate Limiting (1 saat)

- Provider bazlı rate limits
- Token bucket algorithm
- Queue management
- Rate limit headers

---

### Faz F: Caching (1 saat - Opsiyonel)

- Redis integration
- Response caching
- Cache invalidation
- TTL management

---

### Faz G: Domain Layer (1 saat)

**Entities:**

- `AIUsageLog`
- `AIPrompt`
- `AIProviderConfig`

**Enums:**

- `AIProvider` (OPENAI, CLAUDE)
- `AIUseCase` (TASK_DESCRIPTION, REPORT_GENERATION, vb.)
- `AIModel` (GPT-4, GPT-3.5, CLAUDE_OPUS, vb.)

**Interfaces:**

- `IAIService`
- `IAIRouter`
- `IPromptManager`
- `ITokenTracker`
- `ICostTracker`

---

### Faz H: Tests (2 saat)

- Unit tests (her service için)
- Integration tests (API calls)
- Mock providers
- Error scenario tests

---

## 🏗️ Mimari Yapı

```
src/
├── 3-domain/
│   ├── entities/
│   │   ├── AIUsageLog.ts
│   │   ├── AIPrompt.ts
│   │   └── AIProviderConfig.ts
│   ├── enums/
│   │   └── AIEnums.ts
│   └── interfaces/
│       └── services/
│           ├── IAIService.ts
│           ├── IAIRouter.ts
│           ├── IPromptManager.ts
│           ├── ITokenTracker.ts
│           └── ICostTracker.ts
│
├── 4-infrastructure/
│   ├── config/
│   │   └── ai.config.ts
│   └── database/
│       └── migrations/
│           └── 037_create_ai_tables.sql
│
└── 5-shared/
    └── services/
        └── ai/
            ├── openai.service.ts
            ├── claude.service.ts
            ├── ai-router.service.ts
            ├── prompt-manager.service.ts
            ├── token-tracker.service.ts
            ├── cost-tracker.service.ts
            └── index.ts
```

---

## 📋 Detaylı Görev Listesi

### 1. Database Schema ✅

- [ ] `ai_usage_logs` tablosu
- [ ] `ai_prompts` tablosu
- [ ] `ai_provider_configs` tablosu (opsiyonel)
- [ ] Indexes
- [ ] RLS policies
- [ ] Migration dosyası

### 2. Dependencies ✅

- [ ] `openai` paketi kurulumu
- [ ] `@anthropic-ai/sdk` paketi kurulumu
- [ ] `ioredis` paketi kurulumu (opsiyonel)
- [ ] Environment variables ekleme

### 3. Configuration ✅

- [ ] `ai.config.ts` oluşturma
- [ ] Provider mapping
- [ ] Model pricing
- [ ] Rate limit configs

### 4. Domain Layer ✅

- [ ] Entities
- [ ] Enums
- [ ] Interfaces

### 5. Services ✅

- [ ] OpenAI Service
- [ ] Claude Service
- [ ] AI Router Service
- [ ] Prompt Manager Service
- [ ] Token Tracker Service
- [ ] Cost Tracker Service

### 6. Error Handling ✅

- [ ] Retry logic
- [ ] Error classification
- [ ] Fallback strategies

### 7. Rate Limiting ✅

- [ ] Token bucket implementation
- [ ] Queue management

### 8. Tests ✅

- [ ] Unit tests
- [ ] Integration tests

---

## 🎯 AI Provider Selection Strategy

```typescript
const AI_PROVIDER_MAP = {
  // Kısa metinler için GPT-4
  task_description: 'openai-gpt-4',
  news_rewrite: 'openai-gpt-4',
  forum_moderation: 'openai-gpt-3.5-turbo',

  // Uzun metinler için Claude
  report_generation: 'claude-opus',
  cv_analysis: 'claude-sonnet',
  document_summary: 'claude-haiku',

  // Chatbot için GPT-4
  chatbot: 'openai-gpt-4',

  // Risk analizi için Claude
  risk_analysis: 'claude-opus',
  success_prediction: 'claude-opus',
};
```

---

## 💰 Cost Tracking

### OpenAI Pricing (yaklaşık)

- GPT-4: $0.03 / 1K input tokens, $0.06 / 1K output tokens
- GPT-3.5-turbo: $0.0015 / 1K input tokens, $0.002 / 1K output tokens

### Claude Pricing (yaklaşık)

- Claude Opus: $15 / 1M input tokens, $75 / 1M output tokens
- Claude Sonnet: $3 / 1M input tokens, $15 / 1M output tokens
- Claude Haiku: $0.25 / 1M input tokens, $1.25 / 1M output tokens

---

## ✅ Kabul Kriterleri

- ✅ OpenAI API çalışıyor
- ✅ Claude API çalışıyor
- ✅ AI Router doğru provider seçiyor
- ✅ Token tracking çalışıyor
- ✅ Cost tracking çalışıyor
- ✅ Error handling çalışıyor
- ✅ Retry mekanizması çalışıyor
- ✅ Rate limiting çalışıyor
- ✅ Prompt management çalışıyor
- ✅ Tests geçiyor

---

## 📊 Tahmini Süre

- **Faz A (Database):** 1-2 saat
- **Faz B (Dependencies):** 30 dakika
- **Faz C (Services):** 4-5 saat
- **Faz D (Error Handling):** 1 saat
- **Faz E (Rate Limiting):** 1 saat
- **Faz F (Caching):** 1 saat (opsiyonel)
- **Faz G (Domain):** 1 saat
- **Faz H (Tests):** 2 saat

**Toplam:** ~11-13 saat (~1.5-2 gün)

---

## 🚀 Başlangıç Adımları

1. Database migration oluştur
2. Dependencies kur
3. Configuration dosyası oluştur
4. Domain layer oluştur
5. Services implementasyonu
6. Tests yaz

---

**Son Güncelleme:** 15 Kasım 2025  
**Hazırlayan:** AI Assistant
