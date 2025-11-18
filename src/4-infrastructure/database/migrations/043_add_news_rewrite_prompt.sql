-- Migration: Add News Rewrite Prompt Template
-- Description: RSS feed item'larını AI ile yeniden yazmak için default prompt template
-- Date: 2025-11-17

-- Default News Rewrite Prompt Template
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
  'Haber Yeniden Yazma - v1',
  'RSS feed item''larını e-ihracat odaklı Türkçe haber olarak yeniden yazma',
  'news_rewrite',
  'Sen bir e-ihracat ve dijital dönüşüm konularında uzman bir içerik yazarısın. Aşağıdaki haber içeriğini Türkçe''ye çevirerek ve e-ihracat odaklı olarak yeniden yaz.

**Orijinal Haber:**
Başlık: {{title}}
Açıklama: {{description}}
İçerik: {{content}}
Kaynak: {{link}}
Yazar: {{author}}
Yayın Tarihi: {{pubDate}}

**Görevler:**
1. Haberi Türkçe''ye çevir ve e-ihracat/dijital dönüşüm perspektifinden yeniden yaz
2. Başlığı çekici ve SEO uyumlu hale getir
3. İlk paragrafta haberin özetini ver (150-200 kelime)
4. Ana içerikte detayları açıkla ve e-ihracat ile bağlantı kur
5. Meta açıklama (160 karakter) ve anahtar kelimeler oluştur
6. Kategori: {{category}}

**Çıktı Formatı (JSON):**
{
  "title": "Yeniden yazılmış başlık",
  "summary": "Haber özeti (150-200 kelime)",
  "content": "Tam haber içeriği (e-ihracat odaklı)",
  "metaDescription": "SEO meta açıklama (160 karakter)",
  "metaKeywords": ["anahtar", "kelime", "listesi"],
  "category": "{{category}}"
}

Lütfen yalnızca JSON formatında yanıt ver.',
  '{"title": "string", "description": "string", "content": "string", "link": "string", "author": "string", "pubDate": "string", "category": "string", "language": "string"}'::jsonb,
  1,
  true,
  'openai',
  'gpt-4',
  0.7,
  2000,
  1.0,
  '{"purpose": "RSS feed item rewrite", "target_audience": "e-export companies"}'::jsonb,
  NULL
)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE ai_prompts IS 'AI prompt şablonları ve versiyonlama';
COMMENT ON COLUMN ai_prompts.use_case IS 'AI use case tipi (news_rewrite, forum_moderation, vb.)';

