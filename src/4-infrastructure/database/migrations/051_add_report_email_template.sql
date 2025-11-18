-- =====================================================
-- MIGRATION: 051_add_report_email_template
-- Description: Rapor email template'i ekle
-- Created: 2025-01-XX
-- Sprint: 16 - AI Raporlama Sistemi
-- =====================================================

-- Rapor Email Template
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'report-completed') THEN
    INSERT INTO email_templates (
      name,
      description,
      subject,
      html_content,
      text_content,
      email_type,
      variables,
      is_active
    )
    VALUES (
      'report-completed',
      'Rapor tamamlandığında gönderilen email template''i',
      'Raporunuz Hazır: {{report_title}}',
      '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raporunuz Hazır</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin-top: 0;">Raporunuz Hazır!</h1>
    <p>Merhaba,</p>
    <p><strong>{{report_title}}</strong> raporu başarıyla oluşturuldu.</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #1f2937; margin-top: 0;">Rapor Detayları</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Rapor Tipi:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">{{report_type}}</td>
      </tr>
      {{#if period}}
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Dönem:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">{{period}}</td>
      </tr>
      {{/if}}
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Oluşturulma Tarihi:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">{{created_at}}</td>
      </tr>
    </table>
  </div>
  
  {{#if ai_analysis}}
  <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #2563eb; border-radius: 4px; margin-bottom: 20px;">
    <h3 style="color: #1f2937; margin-top: 0;">AI Analizi</h3>
    <p style="margin-bottom: 10px;"><strong>Risk Skoru:</strong> {{risk_score}}/100</p>
    <p style="margin-bottom: 10px;"><strong>Başarı Olasılığı:</strong> %{{success_probability}}</p>
    {{#if summary}}
    <p style="margin-top: 15px;"><strong>Özet:</strong></p>
    <p style="margin-left: 20px;">{{summary}}</p>
    {{/if}}
  </div>
  {{/if}}
  
  <div style="text-align: center; margin-top: 30px;">
    <a href="{{report_url}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Raporu Görüntüle</a>
  </div>
  
  {{#if pdf_url}}
  <div style="text-align: center; margin-top: 15px;">
    <a href="{{pdf_url}}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">PDF İndir</a>
  </div>
  {{/if}}
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
    <p>Bu email Akademi Port platformu tarafından otomatik olarak gönderilmiştir.</p>
    <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
  </div>
</body>
</html>',
      'Raporunuz Hazır: {{report_title}}

Merhaba,

{{report_title}} raporu başarıyla oluşturuldu.

Rapor Detayları:
- Rapor Tipi: {{report_type}}
{{#if period}}- Dönem: {{period}}{{/if}}
- Oluşturulma Tarihi: {{created_at}}

{{#if ai_analysis}}
AI Analizi:
- Risk Skoru: {{risk_score}}/100
- Başarı Olasılığı: %{{success_probability}}
{{#if summary}}- Özet: {{summary}}{{/if}}
{{/if}}

Raporu görüntülemek için: {{report_url}}
{{#if pdf_url}}PDF indirmek için: {{pdf_url}}{{/if}}

Bu email Akademi Port platformu tarafından otomatik olarak gönderilmiştir.',
      'transactional',
      '{
        "report_title": "Rapor başlığı",
        "report_type": "Rapor tipi (Ara Rapor, Aylık Rapor, vb.)",
        "period": "Dönem bilgisi (opsiyonel)",
        "created_at": "Oluşturulma tarihi",
        "report_url": "Rapor görüntüleme URL''i",
        "pdf_url": "PDF indirme URL''i (opsiyonel)",
        "ai_analysis": "AI analizi var mı (true/false)",
        "risk_score": "Risk skoru (0-100)",
        "success_probability": "Başarı olasılığı (0-100)",
        "summary": "AI analizi özeti (opsiyonel)"
      }'::jsonb,
      true
    );
  END IF;
END $$;

