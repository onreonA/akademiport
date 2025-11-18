-- Migration: Add Forum Moderation Prompt Template
-- Description: Forum spam tespiti için default prompt template
-- Date: 2025-11-17

-- Default Forum Moderation Prompt Template
INSERT INTO ai_prompts (
  name,
  description,
  use_case,
  template,
  variables,
  version,
  is_active,
  provider,
  model,
  temperature,
  max_tokens,
  top_p,
  metadata,
  created_by
) VALUES (
  'Forum Spam Tespiti - v1',
  'Forum topic ve reply içeriğinde spam tespiti',
  'forum_moderation',
  'Sen bir forum moderasyon uzmanısın. Aşağıdaki forum içeriğini analiz edip spam olup olmadığını tespit et.

**İçerik:**
{{content}}

**Yazar Bilgisi:**
Kullanıcı ID: {{authorId}}
E-posta: {{authorEmail}}
Tip: {{type}} (topic veya reply)

**Spam Kriterleri:**
1. Link spam (çok fazla link içeren içerik)
2. Promosyon içeriği (ürün/hizmet satışı)
3. Tekrarlayan içerik (aynı metnin tekrarı)
4. Uygunsuz dil (küfür, hakaret)
5. Otomatik mesajlar (bot benzeri)
6. İstenmeyen reklamlar

**Görev:**
1. İçeriği analiz et
2. Spam skoru belirle (0-100)
3. Spam faktörlerini listele
4. Öneri ver (approve/reject/review)

**Çıktı Formatı (JSON):**
{
  "spamScore": 0-100 arası spam skoru,
  "isSpam": true/false,
  "reason": "Spam nedeni (eğer spam ise)",
  "recommendation": "approve|reject|review",
  "factors": [
    {
      "name": "Faktör adı (örn: Link Spam)",
      "score": 0-100 arası skor,
      "description": "Açıklama"
    }
  ]
}

**Öneri Kuralları:**
- spamScore < 40: approve (otomatik onayla)
- spamScore >= 70: reject (otomatik reddet)
- 40 <= spamScore < 70: review (admin onayı gerekli)

Lütfen yalnızca JSON formatında yanıt ver.',
  '{"content": "string", "authorId": "string", "authorEmail": "string", "type": "string"}'::jsonb,
  1,
  true,
  'openai',
  'gpt-3.5-turbo',
  0.5,
  1500,
  1.0,
  '{"purpose": "Forum spam detection", "thresholds": {"approve": 40, "reject": 70}}'::jsonb,
  NULL
)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE ai_prompts IS 'AI prompt şablonları ve versiyonlama';
COMMENT ON COLUMN ai_prompts.use_case IS 'AI use case tipi (forum_moderation, news_rewrite, vb.)';

