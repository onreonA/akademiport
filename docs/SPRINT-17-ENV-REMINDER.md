# ⚠️ SPRINT 17 - ENVIRONMENT VARIABLES HATIRLATMASI

**Tarih:** 17 Kasım 2025  
**Durum:** 🔴 Bekliyor - Kullanıcı Aksiyonu Gerekli

---

## 📋 YAPILMASI GEREKENLER

### 1. Environment Variables Ekle

`.env.local` dosyasına aşağıdaki satırları ekle:

```env
# AI API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Kontrol Et

```bash
npx tsx src/5-shared/services/ai/check-env.ts
```

### 3. Integration Test Çalıştır

```bash
npx tsx src/5-shared/services/ai/__test-integration__.ts
```

---

## 🎯 NEDEN GEREKLİ?

- OpenAI ve Claude API'lerini kullanmak için API key'ler gerekli
- Sprint 18 (AI Özellikleri) başlamadan önce test edilmeli
- Production'da environment variables olmadan çalışmaz

---

## 📝 NOTLAR

- API key'leri `.gitignore`'da olmalı
- Asla commit edilmemeli
- Test key'leri kullanılabilir (ücretsiz tier)

---

**Hatırlatma:** Bu dosyayı Sprint 18 başlamadan önce kontrol et!
