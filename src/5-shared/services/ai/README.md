# 🧠 AI Service Layer

AI altyapısı - OpenAI ve Claude entegrasyonu

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Use Case Mapping](#use-case-mapping)
- [Configuration](#configuration)
- [Test](#test)
- [API Reference](#api-reference)

---

## 🚀 Kurulum

### 1. Environment Variables

`.env.local` dosyasına API key'leri ekleyin:

```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Database Migration

Supabase SQL Editor'da migration'ı çalıştırın:

```sql
-- src/4-infrastructure/database/migrations/037_create_ai_tables.sql
```

Migration şunları oluşturur:

- `ai_prompts` - Prompt şablonları
- `ai_usage_logs` - Kullanım logları
- `ai_provider_configs` - Provider ayarları

---

## 💻 Kullanım

### 1. OpenAI Service (Doğrudan)

```typescript
import { OpenAIService } from '@/5-shared/services/ai/openai.service';
import { AIModel } from '@/3-domain/enums/AIEnums';

const service = new OpenAIService(AIModel.GPT_4);
const result = await service.complete('Merhaba! Nasılsın?');

if (result.isSuccess) {
  console.log(result.value.text);
  console.log(`Cost: $${result.value.costUsd}`);
  console.log(`Tokens: ${result.value.totalTokens}`);
} else {
  console.error('Error:', result.error);
}
```

### 2. Claude Service (Doğrudan)

```typescript
import { ClaudeService } from '@/5-shared/services/ai/claude.service';

const service = new ClaudeService();
const result = await service.complete('Uzun bir rapor yaz');

if (result.isSuccess) {
  console.log(result.value.text);
}
```

### 3. AI Router (Önerilen) ⭐

Use case bazlı otomatik provider seçimi:

```typescript
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

const router = new AIRouterService();

// Use case bazlı otomatik provider seçimi
const result = await router.complete(
  AIUseCase.TASK_DESCRIPTION,
  "Alibaba.com'da mağaza açma görevi için detaylı açıklama oluştur"
);

if (result.isSuccess) {
  console.log(`Provider: ${result.value.provider}`);
  console.log(`Model: ${result.value.model}`);
  console.log(result.value.text);
}
```

### 4. Streaming (Real-time)

```typescript
const router = new AIRouterService();

const result = await router.stream(
  AIUseCase.CHATBOT,
  'E-ihracat hakkında bilgi ver',
  undefined,
  (chunk) => {
    // Her chunk geldiğinde çağrılır
    process.stdout.write(chunk);
  }
);
```

---

## 📊 Use Case Mapping

AI Router, use case'e göre optimal provider'ı seçer:

| Use Case             | Provider | Model         | Neden                    |
| -------------------- | -------- | ------------- | ------------------------ |
| `TASK_DESCRIPTION`   | OpenAI   | GPT-4         | Kısa metinler için hızlı |
| `NEWS_REWRITE`       | OpenAI   | GPT-4         | Yaratıcı yazım           |
| `FORUM_MODERATION`   | OpenAI   | GPT-3.5 Turbo | Hızlı ve ucuz            |
| `CHATBOT`            | OpenAI   | GPT-4         | Konuşma kalitesi         |
| `REPORT_GENERATION`  | Claude   | Opus          | Uzun raporlar için güçlü |
| `CV_ANALYSIS`        | Claude   | Sonnet        | Analitik düşünme         |
| `DOCUMENT_SUMMARY`   | Claude   | Haiku         | Hızlı ve ucuz            |
| `RISK_ANALYSIS`      | Claude   | Opus          | Derin analiz             |
| `SUCCESS_PREDICTION` | Claude   | Opus          | Analitik düşünme         |
| `TREND_ANALYSIS`     | Claude   | Sonnet        | Veri analizi             |

---

## ⚙️ Configuration

### Model Pricing

`src/4-infrastructure/config/ai.config.ts` dosyasında model fiyatları tanımlı:

```typescript
export const modelPricing: Record<AIModel, { inputPrice: number; outputPrice: number }> = {
  [AIModel.GPT_4]: {
    inputPrice: 30.0, // $30 per 1M input tokens
    outputPrice: 60.0, // $60 per 1M output tokens
  },
  // ...
};
```

### Rate Limits

```typescript
export const defaultRateLimits: Record<AIProvider, {...}> = {
  [AIProvider.OPENAI]: {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
  },
  [AIProvider.CLAUDE]: {
    perMinute: 50,
    perHour: 800,
    perDay: 8000,
  },
};
```

---

## 🧪 Test

### Unit Tests

```bash
# Tüm AI testlerini çalıştır
npm test -- ai

# Sadece OpenAI testleri
npm test -- openai.service

# Sadece Router testleri
npm test -- ai-router.service
```

### Integration Test (Gerçek API)

```bash
# Integration test (API key'ler gerekli)
npx tsx src/5-shared/services/ai/__test-integration__.ts
```

**Not:** Integration test gerçek API çağrıları yapar ve maliyet oluşturur!

---

## 📚 API Reference

### IAIService Interface

```typescript
interface IAIService {
  complete(prompt: string, options?: AIRequestOptions): Promise<Result<AIResponse, AIError>>;
  stream(
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<Result<AIResponse, AIError>>;
  getProvider(): AIProvider;
  getDefaultModel(): AIModel;
  isAvailable(): Promise<boolean>;
}
```

### AIRequestOptions

```typescript
interface AIRequestOptions {
  temperature?: number; // 0-2, default: 0.7
  maxTokens?: number; // default: 2000
  topP?: number; // 0-1, default: 1.0
  stream?: boolean; // default: false
  userId?: string;
  companyId?: string;
  programId?: string;
  metadata?: Record<string, any>;
}
```

### AIResponse

```typescript
interface AIResponse {
  text: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  model: AIModel;
  provider: AIProvider;
}
```

---

## 🔧 Advanced Usage

### Prompt Manager

```typescript
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

const promptManager = new PromptManagerService();

// Aktif prompt'u al
const promptResult = await promptManager.getActivePrompt(AIUseCase.TASK_DESCRIPTION);

if (promptResult.isSuccess && promptResult.value) {
  const prompt = promptResult.value;

  // Template'i render et
  const rendered = promptManager.renderPrompt(prompt, {
    task_title: 'Alibaba mağaza açma',
    program_name: 'E-İhracat Programı',
    company_name: 'ABC Şirketi',
  });

  console.log(rendered);
}
```

### Token Tracker

```typescript
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';

const tracker = new TokenTrackerService();

// Kullanım logla
await tracker.logUsage({
  userId: 'user-123',
  provider: AIProvider.OPENAI,
  model: AIModel.GPT_4,
  useCase: AIUseCase.CHATBOT,
  requestTokens: 100,
  responseTokens: 200,
  totalTokens: 300,
  costUsd: 0.001,
  status: AIRequestStatus.SUCCESS,
});

// İstatistikleri al
const statsResult = await tracker.getUsageStats({
  provider: AIProvider.OPENAI,
  startDate: new Date('2025-01-01'),
});

if (statsResult.isSuccess) {
  console.log(`Total Requests: ${statsResult.value.totalRequests}`);
  console.log(`Total Tokens: ${statsResult.value.totalTokens}`);
}
```

### Cost Tracker

```typescript
import { CostTrackerService } from '@/5-shared/services/ai/cost-tracker.service';

const costTracker = new CostTrackerService();

// Toplam maliyeti al
const costResult = await costTracker.getTotalCost({
  provider: AIProvider.OPENAI,
  startDate: new Date('2025-01-01'),
});

if (costResult.isSuccess) {
  console.log(`Total Cost: $${costResult.value.toFixed(2)}`);
}
```

---

## 🚨 Önemli Notlar

### 1. API Key'ler Gizli

- `.env.local` dosyası `.gitignore`'da olmalı
- Asla commit edilmemeli
- Production'da environment variables kullanılmalı

### 2. Rate Limiting

- OpenAI: 60/dakika, 1000/saat
- Claude: 50/dakika, 800/saat
- Rate limit aşılırsa 429 hatası gelir
- Rate limiter otomatik kontrol eder

### 3. Maliyet

- GPT-4: $30/$60 (input/output per 1M token)
- Claude Opus: $15/$75
- Test sırasında dikkatli ol!
- Cost tracker otomatik hesaplar

### 4. Fallback

- Bir provider çökerse diğeri devreye girer
- AI Router otomatik fallback yapar
- Health check ile provider durumu kontrol edilir

### 5. Error Handling

- Retry mekanizması var (exponential backoff)
- Retryable hatalar otomatik tekrar denenir
- Max 3 retry attempt

---

## 📞 Destek

Sorun yaşarsanız:

1. Environment variables kontrol edin
2. Database migration uygulandı mı kontrol edin
3. API key'lerin geçerli olduğunu kontrol edin
4. Rate limit'e takılmadığınızı kontrol edin
5. Log dosyalarını kontrol edin

---

**Hazırlayan:** AI Assistant  
**Sprint:** 17 - AI Altyapısı  
**Tarih:** 17 Kasım 2025
