# 📝 Sprint 18: Prompt Templates Kurulum Rehberi

**Tarih:** 17 Kasım 2025  
**Durum:** ✅ Hazır - Migration Uygulanmalı

---

## 🎯 AMAÇ

Sprint 18'de oluşturulan AI özellikleri için prompt template'lerini database'e eklemek.

---

## 📋 YAPILACAKLAR

### Adım 1: Migration Dosyasını Kontrol Et

Migration dosyası hazır ve güncellenmiş:

- **Dosya:** `src/4-infrastructure/database/migrations/037_create_ai_tables.sql`
- **Durum:** ✅ Tüm prompt'lar eklendi

### Adım 2: Supabase'e Migration Uygula

1. **Supabase Dashboard'a git**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **SQL Editor'ı aç**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

3. **Migration dosyasını çalıştır**
   - `src/4-infrastructure/database/migrations/037_create_ai_tables.sql` dosyasını açın
   - Tüm içeriği SQL Editor'a yapıştırın
   - "Run" butonuna tıklayın

4. **Kontrol et**
   - Aşağıdaki SQL sorgusunu çalıştırarak prompt'ların eklendiğini doğrulayın:

```sql
SELECT
  use_case,
  name,
  version,
  is_active,
  provider,
  model
FROM ai_prompts
WHERE is_active = true
ORDER BY use_case;
```

**Beklenen Sonuç:** 6 aktif prompt görünmeli:

- `task_description` - Görev Açıklaması Üretimi
- `document_summary` - Eğitim Özeti
- `risk_analysis` - Firma Risk Analizi
- `success_prediction` - Başarı Tahmini
- `trend_analysis` - Trend Analizi
- `report_generation` - Rapor Üretimi

---

## 📊 EKLENEN PROMPT TEMPLATE'LERİ

### 1. Task Description (Görev Açıklaması)

**Use Case:** `task_description`  
**Provider:** OpenAI  
**Model:** GPT-4  
**Temperature:** 0.7  
**Max Tokens:** 2000

**Template Değişkenleri:**

- `{{task_title}}` - Görev başlığı
- `{{program_name}}` - Program adı
- `{{company_name}}` - Firma adı
- `{{project_name}}` - Proje adı
- `{{sub_project_name}}` - Alt proje adı

**Beklenen JSON Format:**

```json
{
  "description": "...",
  "subTasks": [...],
  "keyPoints": [...],
  "estimatedDuration": "..."
}
```

---

### 2. Document Summary (Eğitim Özeti)

**Use Case:** `document_summary`  
**Provider:** Claude  
**Model:** Claude Haiku  
**Temperature:** 0.5  
**Max Tokens:** 2000

**Template Değişkenleri:**

- `{{training_name}}` - Eğitim adı
- `{{training_description}}` - Eğitim açıklaması
- `{{content_context}}` - İçerik bağlamı (videolar ve dökümanlar)
- `{{video_count}}` - Video sayısı
- `{{document_count}}` - Döküman sayısı

**Beklenen JSON Format:**

```json
{
  "summary": "...",
  "keyPoints": [...],
  "learningOutcomes": [...],
  "prerequisites": [...],
  "estimatedDuration": "...",
  "difficulty": "beginner|intermediate|advanced"
}
```

---

### 3. Risk Analysis (Risk Analizi)

**Use Case:** `risk_analysis`  
**Provider:** Claude  
**Model:** Claude Opus  
**Temperature:** 0.6  
**Max Tokens:** 3000

**Template Değişkenleri:**

- `{{company_name}}` - Firma adı
- `{{company_email}}` - Firma e-posta
- `{{project_data}}` - Proje verileri (JSON)
- `{{training_data}}` - Eğitim verileri (JSON)
- `{{event_data}}` - Etkinlik verileri (JSON)
- `{{overall_stats}}` - Genel istatistikler (JSON)

**Beklenen JSON Format:**

```json
{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "analysis": "...",
  "factors": [...],
  "recommendations": [...]
}
```

---

### 4. Success Prediction (Başarı Tahmini)

**Use Case:** `success_prediction`  
**Provider:** Claude  
**Model:** Claude Opus  
**Temperature:** 0.6  
**Max Tokens:** 3000

**Template Değişkenleri:**

- `{{company_name}}` - Firma adı
- `{{company_email}}` - Firma e-posta
- `{{project_data}}` - Proje verileri (JSON)
- `{{training_data}}` - Eğitim verileri (JSON)
- `{{event_data}}` - Etkinlik verileri (JSON)
- `{{overall_stats}}` - Genel istatistikler (JSON)

**Beklenen JSON Format:**

```json
{
  "successProbability": 0-100,
  "successLevel": "low|medium|high|very_high",
  "prediction": "...",
  "factors": [...],
  "recommendations": [...],
  "historicalComparison": {...}
}
```

---

### 5. Trend Analysis (Trend Analizi)

**Use Case:** `trend_analysis`  
**Provider:** Claude  
**Model:** Claude Sonnet  
**Temperature:** 0.5  
**Max Tokens:** 3000

**Template Değişkenleri:**

- `{{company_name}}` - Firma adı
- `{{period}}` - Dönem (week/month/quarter/year)
- `{{trend_data}}` - Trend verileri (JSON)

**Beklenen JSON Format:**

```json
{
  "trends": [...],
  "insights": [...],
  "predictions": [...],
  "recommendations": [...]
}
```

---

### 6. Report Generation (Rapor Üretimi)

**Use Case:** `report_generation`  
**Provider:** Claude  
**Model:** Claude Opus  
**Temperature:** 0.7  
**Max Tokens:** 4000

**Template Değişkenleri:**

- `{{company_name}}` - Firma adı
- `{{program_name}}` - Program adı
- `{{period}}` - Dönem
- `{{data}}` - Veriler (JSON)

---

## ✅ DOĞRULAMA

Migration uygulandıktan sonra, prompt'ların doğru eklendiğini kontrol edin:

```sql
-- Tüm aktif prompt'ları listele
SELECT
  use_case,
  name,
  provider,
  model,
  version,
  is_active,
  temperature,
  max_tokens,
  top_p
FROM ai_prompts
WHERE is_active = true
ORDER BY use_case;

-- Belirli bir use case için prompt kontrolü
SELECT * FROM ai_prompts
WHERE use_case = 'task_description' AND is_active = true;
```

---

## 🧪 TEST

Prompt'lar eklendikten sonra, test script'ini çalıştırabilirsiniz:

```bash
# Prompt check script (environment variables gerekli)
npx tsx src/5-shared/services/ai/__test-prompt-check__.ts
```

**Not:** Bu script Supabase connection gerektirir, environment variables olmadan çalışmaz.

---

## 📝 NOTLAR

1. **Migration Güvenli:**
   - `IF NOT EXISTS` kontrolü ile duplicate insert önleniyor
   - Sadece aktif prompt yoksa ekleniyor

2. **Prompt Versiyonlama:**
   - Her prompt'un version numarası var
   - Yeni versiyon eklerken eski versiyonu pasif yapabilirsiniz

3. **Template Değişkenleri:**
   - `{{variable}}` formatında değişkenler kullanılıyor
   - PromptManagerService otomatik olarak render ediyor

4. **Provider ve Model Seçimi:**
   - Her use case için optimal provider/model seçilmiş
   - AI Router otomatik olarak seçiyor

---

## 🚀 SONRAKI ADIMLAR

1. ✅ Migration dosyasını Supabase'e uygula
2. ✅ Prompt'ların eklendiğini doğrula
3. ⏳ Environment variables ekle (`.env.local`)
4. ⏳ Integration test çalıştır

---

**Hazırlayan:** Composer 1 (AI Assistant)  
**Tarih:** 17 Kasım 2025  
**Durum:** ✅ Hazır - Migration Uygulanmalı
