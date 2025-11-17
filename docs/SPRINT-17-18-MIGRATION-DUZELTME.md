# 🔧 Sprint 17-18: Migration Düzeltme

**Tarih:** 17 Kasım 2025  
**Sorun:** Trigger ve Policy'ler zaten mevcut hatası  
**Durum:** ✅ Düzeltildi

---

## 🐛 SORUN

Migration çalıştırılırken şu hata alındı:

```
ERROR: 42710: trigger "trigger_update_ai_prompts_updated_at" for relation "ai_prompts" already exists
```

**Neden:** Migration dosyası idempotent değildi. Trigger ve policy'ler için `DROP IF EXISTS` kontrolü yoktu.

---

## ✅ ÇÖZÜM

Migration dosyası idempotent hale getirildi:

### 1. Trigger'lar İçin Düzeltme

**Önce:**

```sql
CREATE TRIGGER trigger_update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_updated_at();
```

**Sonra:**

```sql
DROP TRIGGER IF EXISTS trigger_update_ai_prompts_updated_at ON ai_prompts;
CREATE TRIGGER trigger_update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_updated_at();
```

### 2. Policy'ler İçin Düzeltme

**Önce:**

```sql
CREATE POLICY "ai_prompts_select" ON ai_prompts
  FOR SELECT
  USING (true);
```

**Sonra:**

```sql
DROP POLICY IF EXISTS "ai_prompts_select" ON ai_prompts;
CREATE POLICY "ai_prompts_select" ON ai_prompts
  FOR SELECT
  USING (true);
```

**Düzeltilen Policy'ler:**

- `ai_prompts_select`
- `ai_prompts_insert`
- `ai_prompts_update`
- `ai_prompts_delete`
- `ai_usage_logs_select_own`
- `ai_usage_logs_insert`
- `ai_usage_logs_delete`
- `ai_provider_configs_select`
- `ai_provider_configs_insert`
- `ai_provider_configs_update`

---

## 📋 GÜNCELLENEN DOSYA

**Dosya:** `src/4-infrastructure/database/migrations/037_create_ai_tables.sql`

**Değişiklikler:**

- ✅ Tüm trigger'lar için `DROP TRIGGER IF EXISTS` eklendi
- ✅ Tüm policy'ler için `DROP POLICY IF EXISTS` eklendi
- ✅ Migration artık idempotent (tekrar çalıştırılabilir)

---

## ✅ DOĞRULAMA

Migration dosyası artık tekrar çalıştırılabilir. Şu komutları Supabase SQL Editor'da çalıştırabilirsiniz:

```sql
-- Migration'ı çalıştır
-- (Tüm içeriği SQL Editor'a yapıştırın)

-- Kontrol et
SELECT
  use_case,
  name,
  version,
  is_active
FROM ai_prompts
WHERE is_active = true
ORDER BY use_case;
```

**Beklenen:** Hata olmadan çalışmalı ve 6 aktif prompt görünmeli.

---

## 🚀 SONRAKI ADIMLAR

1. ✅ Migration dosyası düzeltildi
2. ⏳ Supabase'e migration'ı uygula
3. ⏳ Prompt'ları doğrula
4. ⏳ Environment variables ekle (daha sonra)

---

**Hazırlayan:** Composer 1 (AI Assistant)  
**Tarih:** 17 Kasım 2025  
**Durum:** ✅ Düzeltildi - Tekrar Denenebilir
