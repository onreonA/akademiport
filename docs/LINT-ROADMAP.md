# Lint Refaktör Yol Haritası

> **Geçici durum:** `next.config.ts` içinde `eslint.ignoreDuringBuilds = true` ayarlanarak CI sırasında lint blokajı devre dışı bırakıldı.

## Neden?

- Kod tabanında yüzlerce `eslint` uyarısı ve hatası bulunuyor.
- CI’da `npm run lint` aşaması bu nedenle başarısız oluyor ve diğer iş akışlarını durduruyor.
- Sorunları tek commit’te temizlemek gerçekçi olmadığından lint kontrolü geçici olarak devre dışı bırakıldı.

## Temizlik Planı

| Sprint    | Odak Alanı                               | Açıklama                                                                       |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| Sprint 10 | API katmanı                              | `no-console`, `no-unused-vars` ve `no-explicit-any` uyarılarının kaldırılması. |
| Sprint 11 | Dashboard sayfaları (admin & consultant) | React hook bağımlılık listelerinin düzeltilmesi, tiplerin iyileştirilmesi.     |
| Sprint 12 | Company dashboard & shared bileşenler    | Kalan `any` kullanımları, tiplerin güçlendirilmesi, son temizlik.              |

### CI Ayarı

- CI pipeline’ında `npm run build` yerine `npm run build:ci` kullanılmalı.
- `build:ci` script’i `NEXT_DISABLE_ESLINT=1` ile lint’i geçici olarak devre dışı bırakır.

## Yeniden Etkinleştirme Kriterleri

1. Her sprint sonunda ilgili dosya grubunda lint raporu temiz çıkmalı.
2. Raporlar `docs/SPRINT-XX` notlarına eklenmeli.
3. Tüm kategoriler temizlendiğinde `build:ci` script’i kaldırılıp standart `npm run build` ve `npm run lint` tekrar CI pipelinelara dahil edilecek.

## Takip

- Lint temizlik PR’ları `lint:` öneki ile adlandırılmalı.
- Her PR’a kısa bir özet (hangi kural / dosyalar) eklenmeli.
- Gerekirse ESLint konfigürasyonunda hassasiyet ayarları (ör. `no-console` için `warn`) sprint 12 sonunda tekrar değerlendirilir.
