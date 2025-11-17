# 🎨 Sprint 18: AI Özellikleri - Başlangıç Planı

**Başlangıç Tarihi:** 17 Kasım 2025  
**Tahmini Süre:** 1 hafta (40 saat)  
**Durum:** 🔴 BAŞLANIYOR  
**Bağımlılıklar:** ✅ Sprint 8, 9, 17 (Tamamlandı)

---

## 🎯 Sprint Hedefi

AI asistan özellikleri implementasyonu:

- Görev açıklaması üretimi
- Eğitim özeti çıkarma
- Firma risk analizi
- Başarı tahmini
- Trend analizi

---

## 📋 GÖREV LİSTESİ

### Faz 1: Görev Açıklaması Üretimi (AI) - 2 saat

**Use Case:** `AIUseCase.TASK_DESCRIPTION`

**Özellikler:**

- Görev başlığından detaylı açıklama üretimi
- Alt görev önerileri
- Adım adım plan

**Yapılacaklar:**

- [ ] `GenerateTaskDescriptionUseCase` oluştur
- [ ] Prompt template hazırla
- [ ] API endpoint oluştur: `POST /api/ai/tasks/generate-description`
- [ ] Frontend component: AI butonu görev formuna ekle
- [ ] Test yaz

**Kullanım Senaryosu:**

1. Consultant görev oluştururken "AI ile Açıklama Üret" butonuna tıklar
2. Görev başlığı AI'a gönderilir
3. AI detaylı açıklama ve alt görev önerileri üretir
4. Consultant açıklamayı kabul eder veya düzenler

---

### Faz 2: Eğitim Özeti Çıkarma (AI) - 2 saat

**Use Case:** `AIUseCase.DOCUMENT_SUMMARY`

**Özellikler:**

- Video transkript özeti (YouTube)
- Döküman özeti (PDF, Word, Excel, PPT)
- Anahtar kelimeler çıkarma

**Yapılacaklar:**

- [ ] `GenerateTrainingSummaryUseCase` oluştur
- [ ] Video transkript extraction (YouTube API)
- [ ] Döküman text extraction (PDF, Word, vb.)
- [ ] API endpoint: `POST /api/ai/trainings/[id]/generate-summary`
- [ ] Frontend component: Eğitim detay sayfasına AI özet butonu
- [ ] Test yaz

**Kullanım Senaryosu:**

1. Consultant eğitim detay sayfasında "AI Özet Oluştur" butonuna tıklar
2. AI video/döküman içeriğini analiz eder
3. Özet ve anahtar kelimeler üretir
4. Özet kaydedilir ve gösterilir

---

### Faz 3: Firma Risk Analizi (AI) - 3 saat

**Use Case:** `AIUseCase.RISK_ANALYSIS`

**Özellikler:**

- Proje ilerlemesi analizi
- Eğitim tamamlama oranı
- Etkinlik katılımı
- Risk skoru (0-100)
- Öneriler

**Yapılacaklar:**

- [ ] `AnalyzeCompanyRiskUseCase` oluştur
- [ ] Firma verilerini topla (projeler, eğitimler, etkinlikler)
- [ ] AI'a analiz için gönder
- [ ] API endpoint: `POST /api/ai/companies/[id]/analyze-risk`
- [ ] Frontend component: Firma detay sayfasına risk analizi kartı
- [ ] Test yaz

**Kullanım Senaryosu:**

1. Consultant firma detay sayfasında "Risk Analizi" butonuna tıklar
2. Sistem firma verilerini toplar
3. AI analiz yapar ve risk skoru üretir
4. Sonuçlar gösterilir

---

### Faz 4: Başarı Tahmini (AI) - 2 saat

**Use Case:** `AIUseCase.SUCCESS_PREDICTION`

**Özellikler:**

- Geçmiş verilerden öğrenme
- Başarı olasılığı (0-100)
- Faktörler analizi

**Yapılacaklar:**

- [ ] `PredictCompanySuccessUseCase` oluştur
- [ ] Geçmiş başarılı firmaları analiz et
- [ ] Mevcut firma ile karşılaştır
- [ ] API endpoint: `POST /api/ai/companies/[id]/predict-success`
- [ ] Frontend component: Başarı tahmini kartı
- [ ] Test yaz

---

### Faz 5: Trend Analizi (AI) - 2 saat

**Use Case:** `AIUseCase.TREND_ANALYSIS`

**Özellikler:**

- Sektör trendleri analizi
- Firma performans trendi
- Karşılaştırmalı analiz

**Yapılacaklar:**

- [ ] `AnalyzeTrendsUseCase` oluştur
- [ ] Firma performans verilerini topla
- [ ] Trend analizi yap
- [ ] API endpoint: `POST /api/ai/companies/[id]/analyze-trends`
- [ ] Frontend component: Trend grafikleri
- [ ] Test yaz

---

## 🏗️ MİMARİ TASARIM

### Use Cases

```
src/2-application/use-cases/ai/
├── GenerateTaskDescriptionUseCase.ts
├── GenerateTrainingSummaryUseCase.ts
├── AnalyzeCompanyRiskUseCase.ts
├── PredictCompanySuccessUseCase.ts
└── AnalyzeTrendsUseCase.ts
```

### API Routes

```
src/app/api/ai/
├── tasks/
│   └── generate-description/
│       └── route.ts
├── trainings/
│   └── [id]/
│       └── generate-summary/
│           └── route.ts
└── companies/
    └── [id]/
        ├── analyze-risk/
        │   └── route.ts
        ├── predict-success/
        │   └── route.ts
        └── analyze-trends/
            └── route.ts
```

### Frontend Components

```
src/1-presentation/components/features/ai/
├── TaskDescriptionGenerator.tsx
├── TrainingSummaryGenerator.tsx
├── CompanyRiskAnalysis.tsx
├── SuccessPrediction.tsx
└── TrendAnalysis.tsx
```

---

## 📊 İLERLEME TAKİBİ

- [ ] Faz 1: Görev Açıklaması Üretimi (0/6)
- [ ] Faz 2: Eğitim Özeti Çıkarma (0/6)
- [ ] Faz 3: Firma Risk Analizi (0/6)
- [ ] Faz 4: Başarı Tahmini (0/6)
- [ ] Faz 5: Trend Analizi (0/6)

**Toplam:** 0/30 görev tamamlandı (%0)

---

## 🎯 KABUL KRİTERLERİ

- ✅ Görev açıklaması AI ile üretilebiliyor
- ✅ Eğitim özeti AI ile çıkarılabiliyor
- ✅ Firma risk analizi yapılabiliyor
- ✅ Başarı tahmini çalışıyor
- ✅ Trend analizi çalışıyor
- ✅ Tüm özellikler frontend'de kullanılabilir
- ✅ AI geçmişi kaydediliyor
- ✅ Testler passing

---

## 📝 NOTLAR

- Tüm AI çağrıları `ai_usage_logs` tablosuna kaydedilecek
- Prompt'lar `ai_prompts` tablosundan alınacak
- Token ve cost tracking otomatik çalışacak
- Error handling kapsamlı olmalı

---

**Hazırlayan:** Composer 1 (AI Assistant)  
**Başlangıç:** 17 Kasım 2025  
**Durum:** 🔴 Başlanıyor
