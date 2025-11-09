# Proje Görev Akışları

Bu doküman, Sprint 8 kapsamındaki proje yönetimi görev akışlarında (admin, danışman, şirket rolleri) yapılan son geliştirmeleri ve standartları özetler.

## Danışman Paneli (`/consultant-dashboard/projects/[id]`)

- Görev **atama** işlemi modallaştırıldı. Danışman, firma kullanıcı listesinden seçim yapıyor ve isteğe bağlı not bırakabiliyor.
- **Onay/Red** kararları için gerekçe alanı sunuluyor; notlar otomatik olarak görev yorumlarına ekleniyor.
- Tüm ağ istekleri sırasında loader/toast davranışları tutarlı: işlem başlamadan buton kilitleniyor, başarı ve hata mesajları standardize edildi.

## Şirket Paneli (`/company-dashboard/projects/[id]`)

- Görev **tamamlama** akışı modal ile ilerliyor. Firma kullanıcısı isteğe bağlı not ekleyebiliyor; görev durumu optimistik güncellenip danışman onayına gönderiliyor.
- **Soru Sor** düğmesi artık modal içeriyor; sorular `isQuestion` bayrağıyla yorumlara kaydediliyor ve danışmana bildiriliyor.
- Tüm hatalarda aynı mesaj seti kullanılıyor (`Görev tamamlanamadı`, `Sorunuz kaydedilemedi` vb.).

## Paylaşılan Yardımcılar

- `src/1-presentation/utils/taskActions.ts` altında merkezi `postTaskComment` helper’ı eklendi. Yorum/soru kaydetme işlemleri bu fonksiyon üzerinden ilerleyerek kod tekrarı azaltıldı ve toast mesajları tek noktadan yönetiliyor.

## Test Notları

- Modallar ve yorum akışları UI üzerinden manuel test edilebilir. Tamamlama/soru gönderimi sonrası danışman panelinde hiyerarşinin güncellendiğini doğrulamak önerilir.
